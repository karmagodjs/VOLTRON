import numpy as np
import pandas as pd


def calculate_log_returns(prices: pd.Series) -> pd.Series:
    return np.log(prices / prices.shift(1)).dropna()


def calculate_realized_volatility(
    prices: pd.Series,
    window: int = 20,
    trading_days: int = 252
) -> float:

    returns = calculate_log_returns(prices)

    volatility = (
        returns
        .rolling(window)
        .std()
        .iloc[-1]
        * np.sqrt(trading_days)
    )

    return float(volatility)