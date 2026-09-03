from risk.limits import (
    MAX_TRADE_RISK,
    MAX_DAILY_LOSS,
    MAX_PORTFOLIO_EXPOSURE,
    MAX_CONSECUTIVE_LOSSES,
    MIN_OPPORTUNITY_SCORE,
    MAX_SPREAD_PERCENT,
    MAX_CONTRACT_QUANTITY,
)


class RiskEngine:

    def __init__(self, account_equity):

        self.account_equity = account_equity
        self.daily_pnl = 0.0
        self.portfolio_exposure = 0.0
        self.consecutive_losses = 0
        self.kill_switch = False

    def check_order_size(self, quantity: int, max_contracts: int = None):
        cap = max_contracts if max_contracts is not None else MAX_CONTRACT_QUANTITY
        if quantity is None or quantity <= 0:
            return False, "INVALID_ORDER_SIZE"
        if quantity > cap:
            return False, "ORDER_SIZE_TOO_LARGE"
        return True, "ORDER_SIZE_APPROVED"

    def evaluate(
        self,
        max_loss,
        opportunity_score,
        proposed_exposure,
        quantity=None,
        max_contracts=None,
    ):

        if self.kill_switch:
            return False, "KILL_SWITCH_ACTIVE"

        if quantity is not None:
            size_ok, size_reason = self.check_order_size(quantity, max_contracts)
            if not size_ok:
                return False, size_reason

        if opportunity_score < MIN_OPPORTUNITY_SCORE:
            return False, "OPPORTUNITY_SCORE_TOO_LOW"

        max_trade_loss = (
            self.account_equity * MAX_TRADE_RISK
        )

        if max_loss > max_trade_loss:
            return False, "TRADE_RISK_TOO_HIGH"

        max_daily_loss = (
            self.account_equity * MAX_DAILY_LOSS
        )

        if abs(self.daily_pnl) >= max_daily_loss:
            return False, "DAILY_LOSS_LIMIT_REACHED"

        max_exposure = (
            self.account_equity * MAX_PORTFOLIO_EXPOSURE
        )

        if (
            self.portfolio_exposure + proposed_exposure
            > max_exposure
        ):
            return False, "PORTFOLIO_EXPOSURE_TOO_HIGH"

        if self.consecutive_losses >= MAX_CONSECUTIVE_LOSSES:
            return False, "CONSECUTIVE_LOSS_LIMIT"

        return True, "RISK_APPROVED"

    def record_trade_result(self, pnl):

        self.daily_pnl += pnl

        if pnl < 0:
            self.consecutive_losses += 1
        else:
            self.consecutive_losses = 0

        max_daily_loss = (
            self.account_equity * MAX_DAILY_LOSS
        )

        if abs(self.daily_pnl) >= max_daily_loss:
            self.kill_switch = True

    def activate_kill_switch(self):

        self.kill_switch = True

    def reset_kill_switch(self):

        self.kill_switch = False

    def check_liquidity(self, spread_percent, quantity=None, available_size=None, max_contracts=None):

        if spread_percent is None:
            return False, "NO_SPREAD_DATA"

        if spread_percent > MAX_SPREAD_PERCENT:
            return False, "SPREAD_TOO_WIDE"

        cap = max_contracts if max_contracts is not None else MAX_CONTRACT_QUANTITY
        if quantity is not None and quantity > cap:
            return False, "ORDER_SIZE_TOO_LARGE"

        if available_size is not None and quantity is not None and quantity > available_size:
            return False, "INSUFFICIENT_LIQUIDITY_FOR_SIZE"

        return True, "LIQUIDITY_APPROVED"


def check_liquidity(spread_percent, quantity=None, available_size=None, max_contracts=None):

    if spread_percent is None:
        return False, "NO_SPREAD_DATA"

    if spread_percent > MAX_SPREAD_PERCENT:
        return False, "SPREAD_TOO_WIDE"

    cap = max_contracts if max_contracts is not None else MAX_CONTRACT_QUANTITY
    if quantity is not None and quantity > cap:
        return False, "ORDER_SIZE_TOO_LARGE"

    if available_size is not None and quantity is not None and quantity > available_size:
        return False, "INSUFFICIENT_LIQUIDITY_FOR_SIZE"

    return True, "LIQUIDITY_APPROVED"