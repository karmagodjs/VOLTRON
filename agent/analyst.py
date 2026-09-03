import json
import os
import re
import time

from dotenv import load_dotenv
from google import genai


load_dotenv()


# Rate limit cooldown tracking (Free tier protection)
_rate_limit_until: float = 0.0
_last_retry_delay: float = 60.0


def is_rate_limited() -> bool:
    """Return True if Gemini is currently in a rate limit cooldown window."""
    return time.time() < _rate_limit_until


def get_rate_limit_remaining() -> int:
    """Return seconds remaining in the current rate limit cooldown window."""
    return max(0, int(_rate_limit_until - time.time()))


def reset_rate_limit():
    """Reset rate limit cooldown (primarily for unit tests)."""
    global _rate_limit_until, _last_retry_delay
    _rate_limit_until = 0.0
    _last_retry_delay = 60.0


def _is_rate_limit_error(exc: Exception) -> bool:
    """Detect if an exception is an HTTP 429 / RESOURCE_EXHAUSTED rate limit error."""
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
    """Extract retryDelay from exception message/details if supplied by Gemini."""
    exc_str = str(exc)
    m = re.search(r"retryDelay['\":\s]+(\d+(?:\.\d+)?)s?", exc_str, re.IGNORECASE)
    if m:
        try:
            return max(10.0, float(m.group(1)))
        except (ValueError, TypeError):
            pass

    m2 = re.search(r"retry in (\d+(?:\.\d+)?)s", exc_str, re.IGNORECASE)
    if m2:
        try:
            return max(10.0, float(m2.group(1)))
        except (ValueError, TypeError):
            pass

    m3 = re.search(r"retry[- ]after[:\s]+(\d+(?:\.\d+)?)", exc_str, re.IGNORECASE)
    if m3:
        try:
            return max(10.0, float(m3.group(1)))
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


def create_analysis(data):
    global _rate_limit_until, _last_retry_delay

    api_key = os.getenv("GEMINI_API_KEY")

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
            ]
        }

    # Fail closed on empty or incomplete market data
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
            ]
        }

    # If Gemini is in an active rate limit cooldown, return structured 429 response immediately
    if is_rate_limited():
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
        }

    try:
        client = genai.Client(api_key=api_key)
        prompt = build_analysis_prompt(data)
        model_name = os.getenv("GEMINI_MODEL", "gemini-3.6-flash")

        output_text = None

        # Preferred: Interactions API with gemini-3.6-flash
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
            except Exception as exc:
                if _is_rate_limit_error(exc):
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

        # Strip potential markdown formatting e.g. ```json
        cleaned_text = output_text.strip()
        if cleaned_text.startswith("```"):
            lines = cleaned_text.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned_text = "\n".join(lines).strip()

        analysis = json.loads(cleaned_text)

        # Validate mandatory schema
        if not isinstance(analysis, dict) or "decision" not in analysis:
            raise ValueError("Malformed AI response missing decision")

        analysis["status"] = "COMPLETE"
        analysis["ai_status"] = "LIVE"
        return analysis

    except Exception as exc:
        if _is_rate_limit_error(exc):
            delay = _parse_retry_delay(exc, default=60.0)
            effective_delay = max(60.0, delay)
            _rate_limit_until = time.time() + effective_delay
            _last_retry_delay = effective_delay

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
            ]
        }