import os
from typing import Optional, Dict, Any

from execution.client import trading_client, get_trading_client
from execution.order_builder import validate_defined_risk_order
from quant.trade_validator import validate_buying_power


def is_trading_enabled() -> bool:
    return os.getenv("VOLTRON_TRADING_ENABLED", "false").lower() == "true"


class PaperExecutor:

    def __init__(self, risk_engine):
        self.risk_engine = risk_engine

    def submit_option_order(
        self,
        order,
        max_loss: float,
        opportunity_score: float,
        proposed_exposure: float,
        spread_percent: Optional[float] = None,
        dry_run: bool = False,
        available_buying_power: Optional[float] = None,
    ) -> Dict[str, Any]:

        # 1. Defined-Risk Validation Gate (No naked shorts allowed)
        dr_approved, dr_reason = validate_defined_risk_order(order)
        if not dr_approved:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": dr_reason,
                "gate": "DEFINED_RISK_GATE",
            }

        # 2. Risk Engine Evaluation (7 Risk Engine Gates)
        approved, reason = self.risk_engine.evaluate(
            max_loss=max_loss,
            opportunity_score=opportunity_score,
            proposed_exposure=proposed_exposure
        )
        if not approved:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": reason,
                "gate": "RISK_ENGINE_GATE",
            }

        # 3. Liquidity Gate
        liquidity_ok, liquidity_reason = self.risk_engine.check_liquidity(
            spread_percent
        )
        if not liquidity_ok:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": liquidity_reason,
                "gate": "LIQUIDITY_GATE",
            }

        # 4. Buying Power Gate
        if available_buying_power is not None and max_loss > available_buying_power:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": f"INSUFFICIENT_BUYING_POWER: max_loss ${max_loss:.2f} > buying_power ${available_buying_power:.2f}",
                "gate": "BUYING_POWER_GATE",
            }

        # 5. DRY-RUN Execution Gate (Stops immediately before submission)
        if dry_run:
            return {
                "submitted": False,
                "execution_mode": "PAPER_DRY_RUN",
                "reason": "DRY_RUN_PASSED",
                "status": "APPROVED_PRE_SUBMISSION",
                "safety_gate": "ORDER_SUBMISSION_PREVENTED",
                "details": {
                    "defined_risk": "APPROVED",
                    "risk_engine": "APPROVED",
                    "liquidity": "APPROVED",
                    "buying_power": "APPROVED",
                    "trading_enabled": is_trading_enabled(),
                }
            }

        # 6. Final Safety Gate (VOLTRON_TRADING_ENABLED=false)
        if not is_trading_enabled():
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": "TRADING_DISABLED",
                "safety_gate": "VOLTRON_TRADING_ENABLED=false",
            }

        # 7. Alpaca Paper Execution (Only reachable if trading enabled and not dry run)
        client = get_trading_client() or trading_client
        if not client:
            return {
                "submitted": False,
                "execution_mode": "ERROR",
                "reason": "ALPACA_CLIENT_UNAVAILABLE",
            }

        try:
            result = client.submit_order(order_data=order)
            return {
                "submitted": True,
                "execution_mode": "ALPACA_PAPER",
                "reason": "ORDER_SUBMITTED_TO_PAPER",
                "order": result
            }
        except Exception as e:
            return {
                "submitted": False,
                "execution_mode": "ERROR",
                "reason": f"ALPACA_SUBMISSION_ERROR: {str(e)}",
            }