from agent.trade_logger import TradeLogger


logger = TradeLogger("test_voltron_trades.csv")

logger.log_trade(
    symbol="TEST_OPTION",
    strategy="IRON_CONDOR",
    entry_price=5.00,
    exit_price=6.50,
    pnl=150.0,
    exit_reason="TAKE_PROFIT",
)

logger.log_trade(
    symbol="TEST_OPTION_2",
    strategy="BULL_PUT_SPREAD",
    entry_price=4.00,
    exit_price=2.50,
    pnl=-150.0,
    exit_reason="STOP_LOSS",
)

print("\n==============================")
print("    VOLTRON TRADE LOGGER")
print("==============================")

print(logger.get_summary())

print("==============================\n")