from backtest.metrics import (
    total_return,
    win_rate,
    profit_factor,
    max_drawdown,
    sharpe_ratio
)


starting = 100000

pnls = [
    500,
    -200,
    800,
    -300,
    400
]

equity = [
    100000,
    100500,
    100300,
    101100,
    100800,
    101200
]

returns = [
    0.005,
    -0.002,
    0.008,
    -0.003,
    0.004
]

ending = equity[-1]


print("=" * 60)
print("        VOLTRON — METRICS TEST")
print("=" * 60)

print(f"Starting Capital:  ${starting:,.2f}")
print(f"Ending Capital:    ${ending:,.2f}")

print(
    f"Total Return:       "
    f"{total_return(starting, ending):.2%}"
)

print(
    f"Win Rate:           "
    f"{win_rate(pnls):.2%}"
)

print(
    f"Profit Factor:      "
    f"{profit_factor(pnls):.2f}"
)

print(
    f"Max Drawdown:       "
    f"{max_drawdown(equity):.2%}"
)

print(
    f"Sharpe Ratio:       "
    f"{sharpe_ratio(returns):.2f}"
)

print("=" * 60)