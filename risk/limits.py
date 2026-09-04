import os

MAX_TRADE_RISK = 0.01
MAX_DAILY_LOSS = 0.02
MAX_PORTFOLIO_EXPOSURE = 0.30
MAX_CONSECUTIVE_LOSSES = 3
MIN_OPPORTUNITY_SCORE = 70
# Conservative production risk configuration for options liquidity spread limit (<= 5.0%)
MAX_SPREAD_PERCENT = float(os.getenv("VOLTRON_MAX_SPREAD_PERCENT", "5.0"))

# Conservative hard cap for single order/strategy execution
MAX_CONTRACT_QUANTITY = int(os.getenv("VOLTRON_MAX_CONTRACTS", "10"))