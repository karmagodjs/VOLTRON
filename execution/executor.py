import os
from typing import Optional, Dict, Any

from execution.client import trading_client, get_trading_client
from execution.order_builder import validate_defined_risk_order
from quant.trade_validator import validate_buying_power, validate_options_buying_power


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
        options_buying_power: Optional[float] = None,
        general_buying_power: Optional[float] = None,
        available_liquidity_size: Optional[int] = None,
    ) -> Dict[str, Any]:

        qty = getattr(order, "qty", None)
        if qty is None and isinstance(order, dict):
            qty = order.get("qty") or order.get("quantity")
        qty = int(qty or 1)

        dr_approved, dr_reason = validate_defined_risk_order(order)
        if not dr_approved:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": dr_reason,
                "gate": "DEFINED_RISK_GATE",
            }

        size_ok, size_reason = self.risk_engine.check_order_size(qty)
        if not size_ok:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": size_reason,
                "gate": "ORDER_SIZE_GATE",
            }

        approved, reason = self.risk_engine.evaluate(
            max_loss=max_loss,
            opportunity_score=opportunity_score,
            proposed_exposure=proposed_exposure,
            quantity=qty,
        )
        if not approved:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": reason,
                "gate": "RISK_ENGINE_GATE",
            }

        liquidity_ok, liquidity_reason = self.risk_engine.check_liquidity(
            spread_percent=spread_percent,
            quantity=qty,
            available_size=available_liquidity_size,
        )
        if not liquidity_ok:
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": liquidity_reason,
                "gate": "LIQUIDITY_GATE",
            }

        bp_to_check = options_buying_power if options_buying_power is not None else available_buying_power
        if bp_to_check is not None:
            bp_ok, bp_reason = validate_options_buying_power(
                required_capital=max_loss,
                options_buying_power=bp_to_check,
                general_buying_power=general_buying_power,
            )
            if not bp_ok:
                return {
                    "submitted": False,
                    "execution_mode": "SAFETY_BLOCKED",
                    "reason": bp_reason,
                    "gate": "BUYING_POWER_GATE",
                }

        if dry_run:
            return {
                "submitted": False,
                "execution_mode": "PAPER_DRY_RUN",
                "reason": "DRY_RUN_PASSED",
                "status": "APPROVED_PRE_SUBMISSION",
                "safety_gate": "ORDER_SUBMISSION_PREVENTED",
                "details": {
                    "defined_risk": "APPROVED",
                    "order_size": "APPROVED",
                    "risk_engine": "APPROVED",
                    "liquidity": "APPROVED",
                    "buying_power": "APPROVED",
                    "trading_enabled": is_trading_enabled(),
                }
            }

        if not is_trading_enabled():
            return {
                "submitted": False,
                "execution_mode": "SAFETY_BLOCKED",
                "reason": "TRADING_DISABLED",
                "safety_gate": "VOLTRON_TRADING_ENABLED=false",
            }

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