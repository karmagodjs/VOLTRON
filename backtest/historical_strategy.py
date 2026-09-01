import pandas as pd


def generate_price_signal(
    prices: pd.Series,
    lookback=5,
    threshold=0.05
):

    if len(prices) < lookback + 1:
        return "NO_TRADE"

    current = prices.iloc[-1]

    previous = prices.iloc[-lookback - 1]

    change = (
        current - previous
    ) / previous

    if change >= threshold:
        return "LONG_VOL"

    if change <= -threshold:
        return "SHORT_VOL_DEFINED_RISK"

    return "NO_TRADE"