from backtest.option_data import get_option_bars

OPTION_SYMBOL = "SPY260918C00650000"

bars = get_option_bars(
    OPTION_SYMBOL,
    days=30
)

print("=" * 50)
print("       VOLTRON OPTION HISTORY TEST")
print("=" * 50)

print(bars)

print("=" * 50)