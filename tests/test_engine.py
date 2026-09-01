from backtest.engine import (
    BacktestEngine,
    BacktestTrade
)


engine = BacktestEngine(
    starting_capital=100000
)


trade1 = BacktestTrade(
    entry_date="2026-01-01",
    exit_date="2026-01-05",
    action="LONG_VOL",
    entry_price=2.00,
    exit_price=2.50,
    quantity=1,
    pnl=50
)


trade2 = BacktestTrade(
    entry_date="2026-01-10",
    exit_date="2026-01-15",
    action="LONG_VOL",
    entry_price=2.00,
    exit_price=1.80,
    quantity=1,
    pnl=-20
)


engine.record_trade(trade1)
engine.record_trade(trade2)


print("=" * 60)
print("        VOLTRON — ENGINE TEST")
print("=" * 60)

print("Starting:", engine.starting_capital)
print("Ending:", engine.capital)
print("Trades:", len(engine.trades))
print("Equity:", engine.equity_curve)

print("=" * 60)