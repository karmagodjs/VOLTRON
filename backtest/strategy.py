from dataclasses import dataclass
from typing import Optional


@dataclass
class TradeSignal:
    action: str
    reason: str
    confidence: float


def generate_signal(
    iv: float,
    realized_vol: float,
    opportunity_score: float,
    market_direction: str = "NEUTRAL"
) -> TradeSignal:

    if realized_vol <= 0:
        return TradeSignal(
            action="NO_TRADE",
            reason="Invalid realized volatility",
            confidence=0.0
        )

    iv_rv = iv / realized_vol

    if opportunity_score < 70:
        return TradeSignal(
            action="NO_TRADE",
            reason="Opportunity score below threshold",
            confidence=0.0
        )

    if iv_rv <= 0.80:

        return TradeSignal(
            action="LONG_VOL",
            reason=f"IV/RV is low ({iv_rv:.2f})",
            confidence=min(1.0, opportunity_score / 100)
        )

    if iv_rv >= 1.40:

        return TradeSignal(
            action="SHORT_VOL_DEFINED_RISK",
            reason=f"IV/RV is high ({iv_rv:.2f})",
            confidence=min(1.0, opportunity_score / 100)
        )

    return TradeSignal(
        action="NO_TRADE",
        reason=f"IV/RV is neutral ({iv_rv:.2f})",
        confidence=0.0
    )