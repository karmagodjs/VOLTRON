import math
import numpy as np


def total_return(starting_capital, ending_capital):
    """
    Calculate total portfolio return.

    Returns:
        float: Return as a decimal.
               Example: 0.10 = 10%
    """

    if starting_capital <= 0:
        return 0.0

    return (
        ending_capital - starting_capital
    ) / starting_capital


def win_rate(pnls):
    """
    Calculate the percentage of profitable trades.

    Args:
        pnls: List of trade P&Ls.

    Returns:
        float: Win rate as a decimal.
               Example: 0.60 = 60%
    """

    if not pnls:
        return 0.0

    wins = sum(
        1
        for pnl in pnls
        if pnl > 0
    )

    return wins / len(pnls)


def profit_factor(pnls):
    """
    Calculate profit factor.

    Profit Factor =
        Gross Profits / Gross Losses
    """

    profits = sum(
        pnl
        for pnl in pnls
        if pnl > 0
    )

    losses = abs(
        sum(
            pnl
            for pnl in pnls
            if pnl < 0
        )
    )

    if losses == 0:
        if profits > 0:
            return float("inf")

        return 0.0

    return profits / losses


def max_drawdown(equity_curve):
    """
    Calculate maximum drawdown.

    Returns:
        float: Maximum drawdown as a positive decimal.
               Example: 0.15 = 15%
    """

    if not equity_curve:
        return 0.0

    peak = equity_curve[0]
    max_dd = 0.0

    for equity in equity_curve:

        if equity > peak:
            peak = equity

        if peak <= 0:
            continue

        drawdown = (
            equity - peak
        ) / peak

        max_dd = min(
            max_dd,
            drawdown
        )

    return abs(max_dd)


def sharpe_ratio(
    returns,
    periods_per_year=252
):
    """
    Calculate annualized Sharpe ratio.

    Args:
        returns: List/array of periodic returns.
        periods_per_year: Number of periods per year.

    Returns:
        float: Annualized Sharpe ratio.
    """

    if len(returns) < 2:
        return 0.0

    returns = np.array(
        returns,
        dtype=float
    )

    std = np.std(
        returns,
        ddof=1
    )

    if std == 0:
        return 0.0

    return (
        np.mean(returns)
        / std
        * math.sqrt(periods_per_year)
    )