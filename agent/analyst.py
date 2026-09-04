import json
import os
import re
import time
from typing import Any, Dict, Optional

from dotenv import load_dotenv
from google import genai
import requests


load_dotenv()


_rate_limit_until: float = 0.0
_last_retry_delay: float = 60.0

AI_CACHE_TTL: float = 180.0
_ai_cache: Dict[str, Dict[str, Any]] = {}


def is_rate_limited() -> bool:
    return time.time() < _rate_limit_until


def get_rate_limit_remaining() -> int:
    return max(0, int(_rate_limit_until - time.time()))


def reset_rate_limit():
    global _rate_limit_until, _last_retry_delay
    _rate_limit_until = 0.0
    _last_retry_delay = 60.0


def reset_ai_cache():
    global _ai_cache
    _ai_cache.clear()


def _generate_cache_key(data: dict) -> str:
    if not isinstance(data, dict):
        return ""

    sym = str(data.get("symbol") or data.get("underlying") or "").upper().strip()
    if not sym:
        return ""

    price_val = data.get("price")
    if price_val is None:
        price_val = data.get("spot_price")
    if price_val is None:
        price_val = data.get("underlying_price")

    price_bucket = "NONE"
    if price_val is not None:
        try:
            price_bucket = f"{round(float(price_val) / 0.50) * 0.50:.2f}"
        except (ValueError, TypeError):
            price_bucket = str(price_val)

    iv_val = data.get("iv") if data.get("iv") is not None else data.get("implied_volatility")
    iv_bucket = "NONE"
    if iv_val is not None:
        try:
            iv_bucket = f"{round(float(iv_val), 2):.2f}"
        except (ValueError, TypeError):
            iv_bucket = str(iv_val)

    rv_val = data.get("rv") if data.get("rv") is not None else data.get("realized_volatility")
    rv_bucket = "NONE"
    if rv_val is not None:
        try:
            rv_bucket = f"{round(float(rv_val), 2):.2f}"
        except (ValueError, TypeError):
            rv_bucket = str(rv_val)

    ratio_val = data.get("iv_rv_ratio")
    ratio_bucket = "NONE"
    if ratio_val is not None:
        try:
            ratio_bucket = f"{round(float(ratio_val), 2):.2f}"
        except (ValueError, TypeError):
            ratio_bucket = str(ratio_val)

    score_val = data.get("opportunity_score")
    score_bucket = "NONE"
    if score_val is not None:
        try:
            score_bucket = str(int(score_val))
        except (ValueError, TypeError):
            score_bucket = str(score_val)

    regime = str(data.get("market_regime") or data.get("regime") or "NONE").upper().strip()
    vol_sig = str(data.get("vol_signal") or data.get("volatility_signal") or "NONE").upper().strip()

    return f"{sym}:P={price_bucket}:IV={iv_bucket}:RV={rv_bucket}:RATIO={ratio_bucket}:SCORE={score_bucket}:REGIME={regime}:SIG={vol_sig}"


def get_cached_analysis(data: dict) -> Optional[Dict[str, Any]]:
    key = _generate_cache_key(data)
    if not key or key not in _ai_cache:
        return None

    entry = _ai_cache[key]
    cached_time = entry.get("timestamp", 0.0)
    current_time = time.time()
    if (current_time - cached_time) >= AI_CACHE_TTL or (current_time - cached_time) < 0:
        _ai_cache.pop(key, None)
        return None

    cached_result = dict(entry.get("analysis", {}))
    cached_result["status"] = "CACHED"
    cached_result["ai_status"] = "CACHED"
    if "ai_provider" not in cached_result:
        cached_result["ai_provider"] = "GEMINI"
    return cached_result


def store_cached_analysis(data: dict, analysis: dict) -> None:
    if not isinstance(analysis, dict):
        return

    status = analysis.get("status")
    ai_status = analysis.get("ai_status")
    if status in ("RATE_LIMITED", "ERROR") or ai_status in ("RATE_LIMITED", "ERROR"):
        return
    if status != "COMPLETE" and ai_status != "LIVE":
        return

    key = _generate_cache_key(data)
    if not key:
        return

    _ai_cache[key] = {
        "analysis": dict(analysis),
        "timestamp": time.time(),
    }


def get_openrouter_api_key() -> Optional[str]:
    key = os.getenv("OPENROUTER_API_KEY")
    if key:
        key = key.strip().strip("'").strip('"')
    return key if key else None


def _is_temporary_unavailable_error(exc: Exception) -> bool:
    code = getattr(exc, "code", None) or getattr(exc, "status_code", None)
    if code in (503, "503", 504, "504"):
        return True

    cls_name = exc.__class__.__name__.lower()
    if cls_name in ("serviceunavailable", "temporarilyunavailable"):
        return True

    exc_str = str(exc).lower()
    if "500" in exc_str:
        return False
    if "503" in exc_str or "temporarily unavailable" in exc_str or "service unavailable" in exc_str:
        return True

    return False


def _is_rate_limit_error(exc: Exception) -> bool:
    code = getattr(exc, "code", None) or getattr(exc, "status_code", None)
    if code in (429, "429", "too_many_requests"):
        return True

    cls_name = exc.__class__.__name__.lower()
    if "ratelimit" in cls_name or "resourceexhausted" in cls_name:
        return True

    exc_str = str(exc)
    if "429" in exc_str or "RESOURCE_EXHAUSTED" in exc_str or "quota exceeded" in exc_str.lower() or "too many requests" in exc_str.lower():
        return True

    return False


def _parse_retry_delay(exc: Exception, default: float = 60.0) -> float:
    exc_str = str(exc)

    m_ms = re.search(r"retry in (\d+(?:\.\d+)?)ms", exc_str, re.IGNORECASE)
    if m_ms:
        try:
            return max(2.0, (float(m_ms.group(1)) / 1000.0) + 1.0)
        except (ValueError, TypeError):
            pass

    m = re.search(r"retryDelay['\":\s]+(\d+(?:\.\d+)?)s?", exc_str, re.IGNORECASE)
    if m:
        try:
            return max(5.0, float(m.group(1)))
        except (ValueError, TypeError):
            pass

    m2 = re.search(r"retry in (\d+(?:\.\d+)?)s", exc_str, re.IGNORECASE)
    if m2:
        try:
            return max(5.0, float(m2.group(1)))
        except (ValueError, TypeError):
            pass

    m3 = re.search(r"retry[- ]after[:\s]+(\d+(?:\.\d+)?)", exc_str, re.IGNORECASE)
    if m3:
        try:
            return max(5.0, float(m3.group(1)))
        except (ValueError, TypeError):
            pass

    return default


SYSTEM_PROMPT = """
You are VOLTRON, an autonomous options volatility analyst.

Your job is to analyze structured quantitative market
signals and determine whether an options opportunity
deserves further consideration.

IMPORTANT RULES:

1. Never invent market data.
2. Never invent IV, RV, prices, Greeks, or news.
3. Use only the supplied market data.
4. Do not place orders.
5. Do not override the risk engine.
6. Prefer defined-risk options strategies.
7. If evidence is weak, recommend NO_TRADE.
8. Return valid JSON only.
9. Confidence must be between 0 and 100.
"""


def build_analysis_prompt(data):

    return f"""
Analyze this VOLTRON market opportunity.

MARKET DATA:

{json.dumps(data, indent=2, default=str)}

Return ONLY valid JSON:

{{
    "decision": "TRADE_CANDIDATE",
    "thesis": "short explanation",
    "volatility_view": "EXPENSIVE",
    "direction": "NEUTRAL",
    "confidence": 85,
    "key_reasons": [
        "reason 1",
        "reason 2"
    ],
    "risks": [
        "risk 1",
        "risk 2"
    ]
}}

Allowed values:

decision:
TRADE_CANDIDATE
NO_TRADE

volatility_view:
CHEAP
FAIR
EXPENSIVE

direction:
BULLISH
BEARISH
NEUTRAL

Rules:

- Do not invent information.
- Confidence must be 0-100.
- If evidence is insufficient, use NO_TRADE.
- Do not place or recommend a specific order.
- The risk engine makes the final risk decision.
"""


def call_openrouter_fallback(data: dict, api_key: Optional[str] = None) -> Optional[Dict[str, Any]]:
    key = api_key or get_openrouter_api_key()
    if not key:
        return None

    model_name = os.getenv("OPENROUTER_MODEL", "openrouter/free")
    prompt = build_analysis_prompt(data)

    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://voltron.ai",
        "X-Title": "VOLTRON",
    }

    payload = {
        "model": model_name,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.2,
    }

    try:
        resp = requests.post(
            "https://openrouter.ai/api/v1/chat/completions",
            headers=headers,
            json=payload,
            timeout=12.0,
        )
        if resp.status_code != 200:
            return None

        body = resp.json()
        choices = body.get("choices")
        if not choices or not isinstance(choices, list):
            return None

        raw_text = choices[0].get("message", {}).get("content", "")
        if not raw_text:
            return None

        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            parsed = json.loads(cleaned)
        except json.JSONDecodeError:
            json_match = re.search(r"(\{[\s\S]*\})", cleaned)
            if json_match:
                try:
                    parsed = json.loads(json_match.group(1))
                except Exception:
                    return None
            else:
                return None

        if not isinstance(parsed, dict) or "decision" not in parsed:
            return None

        decision = str(parsed.get("decision", "NO_TRADE")).upper().strip()
        if decision not in ("TRADE_CANDIDATE", "NO_TRADE"):
            decision = "NO_TRADE"

        try:
            confidence = max(0, min(100, int(parsed.get("confidence", 0) or 0)))
        except (ValueError, TypeError):
            confidence = 0

        vol_view = str(parsed.get("volatility_view", "FAIR")).upper().strip()
        if vol_view not in ("CHEAP", "FAIR", "EXPENSIVE"):
            vol_view = "FAIR"

        direction = str(parsed.get("direction", "NEUTRAL")).upper().strip()
        if direction not in ("BULLISH", "BEARISH", "NEUTRAL"):
            direction = "NEUTRAL"

        thesis = str(parsed.get("thesis") or "OpenRouter volatility analysis complete.").strip()

        raw_reasons = parsed.get("key_reasons", [])
        if isinstance(raw_reasons, list):
            key_reasons = [str(r) for r in raw_reasons]
        else:
            key_reasons = [str(raw_reasons)] if raw_reasons else []

        raw_risks = parsed.get("risks", [])
        if isinstance(raw_risks, list):
            risks = [str(r) for r in raw_risks]
        else:
            risks = [str(raw_risks)] if raw_risks else []

        return {
            "decision": decision,
            "confidence": confidence,
            "volatility_view": vol_view,
            "direction": direction,
            "thesis": thesis,
            "key_reasons": key_reasons,
            "risks": risks,
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "ai_provider": "OPENROUTER",
        }
    except Exception:
        return None


def create_analysis(data):
    global _rate_limit_until, _last_retry_delay

    api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY") or os.getenv("GEMINI_KEY")
    if api_key:
        api_key = api_key.strip().strip("'").strip('"')

    if not api_key:
        return {
            "decision": "NO_TRADE",
            "status": "NO_TRADE",
            "ai_status": "ERROR",
            "thesis": "Gemini API key is missing.",
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "confidence": 0,
            "key_reasons": [],
            "risks": [
                "GEMINI_API_KEY is not configured."
            ],
            "ai_provider": "GEMINI",
        }

    if not data or not data.get("symbol") or (data.get("iv") is None and data.get("rv") is None and data.get("implied_volatility") is None and data.get("realized_volatility") is None):
        return {
            "decision": "NO_TRADE",
            "status": "NO_TRADE",
            "ai_status": "ERROR",
            "thesis": "Incomplete market data for volatility analysis.",
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "confidence": 0,
            "key_reasons": [],
            "risks": [
                "Missing required volatility inputs."
            ],
            "ai_provider": "GEMINI",
        }

    cached = get_cached_analysis(data)
    if cached is not None:
        return cached

    if is_rate_limited():
        openrouter_key = get_openrouter_api_key()
        if openrouter_key:
            openrouter_resp = call_openrouter_fallback(data, api_key=openrouter_key)
            if openrouter_resp and openrouter_resp.get("decision") in ("TRADE_CANDIDATE", "NO_TRADE"):
                store_cached_analysis(data, openrouter_resp)
                return openrouter_resp

        return {
            "decision": "NO_TRADE",
            "confidence": 0,
            "status": "RATE_LIMITED",
            "ai_status": "RATE_LIMITED",
            "volatility_view": data.get("vol_signal", "FAIR") if data else "FAIR",
            "direction": "NEUTRAL",
            "thesis": "Gemini analysis temporarily unavailable due to API quota.",
            "key_reasons": [],
            "risks": ["GEMINI_RATE_LIMITED"],
            "retry_delay": get_rate_limit_remaining(),
            "ai_provider": "GEMINI",
        }

    try:
        client = genai.Client(api_key=api_key)
        prompt = build_analysis_prompt(data)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

        output_text = None

        if hasattr(client, "interactions") and hasattr(client.interactions, "create"):
            try:
                interaction = client.interactions.create(
                    model=model_name,
                    input=(
                        SYSTEM_PROMPT
                        + "\n\n"
                        + prompt
                    )
                )
                output_text = getattr(interaction, "output_text", getattr(interaction, "text", None))
                if not output_text and hasattr(interaction, "outputs"):
                    for out in getattr(interaction, "outputs", []):
                        if hasattr(out, "text") and out.text:
                            output_text = out.text
                            break
            except Exception as exc:
                if _is_rate_limit_error(exc) or _is_temporary_unavailable_error(exc):
                    raise exc
                output_text = None

        if output_text is None and hasattr(client, "models") and hasattr(client.models, "generate_content"):
            response = client.models.generate_content(
                model=model_name,
                contents=(
                    SYSTEM_PROMPT
                    + "\n\n"
                    + prompt
                )
            )
            output_text = getattr(response, "text", "")

        if output_text is None:
            raise ValueError("No response generated from Gemini API")

        cleaned_text = output_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        try:
            analysis = json.loads(cleaned_text)
        except json.JSONDecodeError:
            json_match = re.search(r"(\{[\s\S]*\})", cleaned_text)
            if json_match:
                analysis = json.loads(json_match.group(1))
            else:
                raise ValueError("Malformed AI response missing JSON object")

        if not isinstance(analysis, dict) or "decision" not in analysis:
            raise ValueError("Malformed AI response missing decision")

        analysis["status"] = "COMPLETE"
        analysis["ai_status"] = "LIVE"
        analysis["ai_provider"] = "GEMINI"
        store_cached_analysis(data, analysis)
        return analysis

    except Exception as exc:
        is_rl = _is_rate_limit_error(exc)
        is_temp = _is_temporary_unavailable_error(exc)

        if is_rl or is_temp:
            if is_rl:
                delay = _parse_retry_delay(exc, default=60.0)
                effective_delay = max(5.0, delay)
                _rate_limit_until = time.time() + effective_delay
                _last_retry_delay = effective_delay

            openrouter_key = get_openrouter_api_key()
            if openrouter_key:
                openrouter_resp = call_openrouter_fallback(data, api_key=openrouter_key)
                if openrouter_resp and openrouter_resp.get("decision") in ("TRADE_CANDIDATE", "NO_TRADE"):
                    store_cached_analysis(data, openrouter_resp)
                    return openrouter_resp

            if is_rl:
                return {
                    "decision": "NO_TRADE",
                    "confidence": 0,
                    "status": "RATE_LIMITED",
                    "ai_status": "RATE_LIMITED",
                    "volatility_view": data.get("vol_signal", "FAIR") if data else "FAIR",
                    "direction": "NEUTRAL",
                    "thesis": "Gemini analysis temporarily unavailable due to API quota.",
                    "key_reasons": [],
                    "risks": ["GEMINI_RATE_LIMITED"],
                    "retry_delay": int(effective_delay),
                    "ai_provider": "GEMINI",
                }
            else:
                return {
                    "decision": "NO_TRADE",
                    "confidence": 0,
                    "status": "ERROR",
                    "ai_status": "ERROR",
                    "volatility_view": "FAIR",
                    "direction": "NEUTRAL",
                    "thesis": "Gemini analysis failed safely.",
                    "key_reasons": [],
                    "risks": [
                        f"Gemini error: {exc}"
                    ],
                    "ai_provider": "GEMINI",
                }

        return {
            "decision": "NO_TRADE",
            "confidence": 0,
            "status": "ERROR",
            "ai_status": "ERROR",
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "thesis": "Gemini analysis failed safely.",
            "key_reasons": [],
            "risks": [
                f"Gemini error: {exc}"
            ],
            "ai_provider": "GEMINI",
        }