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

        self.equity_curve = [
            starting_capital
        ]

    def record_trade(self, trade):

        self.trades.append(trade)

        self.capital += trade.pnl

        self.equity_curve.append(
            self.capital
        )

    def summary(self):

        return {
            "starting_capital":
                self.starting_capital,

            "ending_capital":
                self.capital,

            "trades":
                len(self.trades),

            "equity_curve":
                self.equity_curve
        }