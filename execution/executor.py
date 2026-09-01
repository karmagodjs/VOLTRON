import os

from execution.client import trading_client


TRADING_ENABLED = (
    os.getenv(
        "VOLTRON_TRADING_ENABLED",
        "false"
    ).lower() == "true"
)

class PaperExecutor:

    def __init__(self, risk_engine):

        self.risk_engine = risk_engine

    def submit_option_order(
        self,
        order,
        max_loss,
        opportunity_score,
        proposed_exposure,
        spread_percent
    ):

        if not TRADING_ENABLED:
            return{
                "submitted": False,
                "reason": "TRADING_DISABLED"
            }

        # 1. Risk check
        approved, reason = self.risk_engine.evaluate(
            max_loss=max_loss,
            opportunity_score=opportunity_score,
            proposed_exposure=proposed_exposure
        )

        if not approved:
            return {
                "submitted": False,
                "reason": reason
            }

        # 2. Liquidity check
        liquidity_ok, liquidity_reason = (
            self.risk_engine.check_liquidity(
                spread_percent
            )
        )

        if not liquidity_ok:
            return {
                "submitted": False,
                "reason": liquidity_reason
            }

        # 3. Final paper-order submission
        result = trading_client.submit_order(
            order_data=order
        )

        return {
            "submitted": True,
            "reason": "ORDER_SUBMITTED_TO_PAPER",
            "order": result
        }