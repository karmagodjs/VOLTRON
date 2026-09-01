import json
import os

from dotenv import load_dotenv
from google import genai


load_dotenv()


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

    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:

        return {
            "decision": "NO_TRADE",
            "thesis": "Gemini API key is missing.",
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "confidence": 0,
            "key_reasons": [],
            "risks": [
                "GEMINI_API_KEY is not configured."
            ]
        }

    try:

        client = genai.Client(
            api_key=api_key
        )

        prompt = build_analysis_prompt(data)

        interaction = client.interactions.create(
            model="gemini-3.6-flash",
            input=(
                SYSTEM_PROMPT
                + "\n\n"
                + prompt
            )
        )

        analysis = json.loads(
            interaction.output_text
        )

        return analysis

    except Exception as exc:

        return {
            "decision": "NO_TRADE",
            "thesis": "Gemini analysis failed safely.",
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "confidence": 0,
            "key_reasons": [],
            "risks": [
                f"Gemini error: {exc}"
            ]
        }