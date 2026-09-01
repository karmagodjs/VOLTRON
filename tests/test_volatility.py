from data.market_data import get_daily_bars
from quant.volatility import calculate_realized_volatility


df = get_daily_bars("SPY", 60)

prices = df["close"]

rv = calculate_realized_volatility(
    prices,
    window=20
)

print("SPY")
print("--------")
print(f"Current Price: ${prices.iloc[-1]:.2f}")
print(f"20D Realized Volatility: {rv:.2%}")