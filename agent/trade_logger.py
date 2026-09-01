import csv
import os
from datetime import datetime


class TradeLogger:

    def __init__(self, filename="voltron_trades.csv"):
        self.filename = filename

        if not os.path.exists(self.filename):
            with open(self.filename, "w", newline="") as file:
                writer = csv.writer(file)

                writer.writerow([
                    "timestamp",
                    "symbol",
                    "strategy",
                    "entry_price",
                    "exit_price",
                    "pnl",
                    "exit_reason",
                ])

    def log_trade(
        self,
        symbol,
        strategy,
        entry_price,
        exit_price,
        pnl,
        exit_reason,
    ):
        with open(self.filename, "a", newline="") as file:
            writer = csv.writer(file)

            writer.writerow([
                datetime.utcnow().isoformat(),
                symbol,
                strategy,
                entry_price,
                exit_price,
                pnl,
                exit_reason,
            ])

    def get_summary(self):
        if not os.path.exists(self.filename):
            return {
                "trades": 0,
                "wins": 0,
                "losses": 0,
                "total_pnl": 0.0,
            }

        trades = 0
        wins = 0
        losses = 0
        total_pnl = 0.0

        with open(self.filename, newline="") as file:
            reader = csv.DictReader(file)

            for row in reader:
                trades += 1

                pnl = float(row["pnl"])
                total_pnl += pnl

                if pnl > 0:
                    wins += 1
                elif pnl < 0:
                    losses += 1

        return {
            "trades": trades,
            "wins": wins,
            "losses": losses,
            "total_pnl": total_pnl,
        }