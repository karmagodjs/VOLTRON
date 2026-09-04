from data.market_data import get_daily_bars
from quant.volatility import calculate_realized_volatility
from quant.options_scanner import get_option_chain
from quant.alpha import (
    calculate_iv_rv_ratio,
    calculate_iv_premium
)


df = get_daily_bars("SPY", 60)

prices = df["close"]

rv = calculate_realized_volatility(
    prices,
    window=20
)


chain = get_option_chain("SPY")


option_iv = None
option_symbol = None

for symbol, snapshot in chain.items():

    if snapshot.implied_volatility is None:
        continue

    if snapshot.greeks is None:
        continue

    if snapshot.latest_quote is None:
        continue

    bid = snapshot.latest_quote.bid_price
    ask = snapshot.latest_quote.ask_price

    if bid <= 0 or ask <= 0:
        continue

    option_iv = snapshot.implied_volatility
    option_symbol = symbol

    break


if option_iv is None:

    print("❌ No valid option with IV/Greeks found.")

else:

    ratio = calculate_iv_rv_ratio(
        option_iv,
        rv
    )

    premium = calculate_iv_premium(
        option_iv,
        rv
    )

    print()
    print("=" * 45)
    print("       VOLTRON DAY 3 ALPHA TEST")
    print("=" * 45)

    print(f"Option:              {option_symbol}")
    print(f"20D Realized Vol:    {rv:.2%}")
    print(f"Implied Vol:         {option_iv:.2%}")
    print(f"IV/RV Ratio:         {ratio:.2f}")
    print(f"IV Premium:          {premium:.2%}")

    print("=" * 45)