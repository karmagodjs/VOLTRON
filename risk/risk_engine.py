from risk.limits import (
    MAX_TRADE_RISK,
    MAX_DAILY_LOSS,
    MAX_PORTFOLIO_EXPOSURE,
    MAX_CONSECUTIVE_LOSSES,
    MIN_OPPORTUNITY_SCORE,
    MAX_SPREAD_PERCENT
)


class RiskEngine:

    def __init__(self, account_equity):

        self.account_equity = account_equity
        self.daily_pnl = 0.0
        self.portfolio_exposure = 0.0
        self.consecutive_losses = 0
        self.kill_switch = False

    def evaluate(
        self,
        max_loss,
        opportunity_score,
        proposed_exposure
    ):

        if self.kill_switch:
            return False, "KILL_SWITCH_ACTIVE"

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

    def check_liquidity(self, spread_percent):

        if spread_percent is None:
            return False, "NO_SPREAD_DATA"

        if spread_percent > MAX_SPREAD_PERCENT:
            return False, "SPREAD_TOO_WIDE"

        return True, "LIQUIDITY_APPROVED"


def check_liquidity(spread_percent):

    if spread_percent is None:
        return False, "NO_SPREAD_DATA"

    if spread_percent > MAX_SPREAD_PERCENT:
        return False, "SPREAD_TOO_WIDE"

    return True, "LIQUIDITY_APPROVED"