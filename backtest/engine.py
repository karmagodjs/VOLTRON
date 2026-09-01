from dataclasses import dataclass


@dataclass
class BacktestTrade:
    entry_date: object
    exit_date: object
    action: str
    entry_price: float
    exit_price: float
    quantity: int
    pnl: float


class BacktestEngine:

    def __init__(self, starting_capital=100000):
        self.starting_capital = starting_capital
        self.capital = starting_capital
        self.trades = []
        self.equity_curve = [starting_capital]

    def execute_trade(
        self,
        entry_date,
        exit_date,
        action,
        entry_price,
        exit_price,
        quantity=1
    ):
        if entry_price <= 0 or exit_price <= 0:
            return None

        if action == "LONG_VOL":
            pnl = (exit_price - entry_price) * quantity * 100

        elif action == "SHORT_VOL_DEFINED_RISK":
            pnl = (entry_price - exit_price) * quantity * 100

        else:
            return None

        trade = BacktestTrade(
            entry_date=entry_date,
            exit_date=exit_date,
            action=action,
            entry_price=entry_price,
            exit_price=exit_price,
            quantity=quantity,
            pnl=pnl
        )

        self.record_trade(trade)

        return trade

    def record_trade(self, trade):
        self.trades.append(trade)
        self.capital += trade.pnl
        self.equity_curve.append(self.capital)
        return trade

    def summary(self):
        return {
            "starting_capital": self.starting_capital,
            "ending_capital": self.capital,
            "trades": len(self.trades),
            "equity_curve": self.equity_curve
        }