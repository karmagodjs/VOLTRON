import re
from datetime import datetime, timezone
from typing import Tuple, Optional

VALID_DEFINED_RISK_STRATEGIES = {
    "BULL_CALL_SPREAD",
    "BEAR_PUT_SPREAD",
    "BULL_PUT_SPREAD",
    "BEAR_CALL_SPREAD",
    "IRON_CONDOR",
    "LONG_STRADDLE",
    "NO_TRADE",
}


def validate_trade(
    max_loss,
    account_equity,
    opportunity_score,
    reward_risk
):
    max_allowed_loss = account_equity * 0.01

    if opportunity_score < 70:
        return False, "Opportunity score too low"

    if max_loss > max_allowed_loss:
        return False, "Maximum loss exceeds 1% risk limit"

    if reward_risk < 0.30:
        return False, "Reward/risk too low"

    return True, "Trade passed validation"


def validate_occ_symbol(symbol: str) -> Tuple[bool, str]:
    """
    Validate standard OCC option symbol format.
    Format: [1-6 letters underlying][YYMMDD][C or P][8 digits strike * 1000]
    Example: SPY260903C00500000
    """
    if not symbol or not isinstance(symbol, str):
        return False, "EMPTY_OR_INVALID_SYMBOL"

    symbol = symbol.strip()
    match = re.match(r"^([A-Z]{1,6})(\d{6})([CP])(\d{8})$", symbol)
    if not match:
        return False, "MALFORMED_OCC_SYMBOL"

    underlying, datestr, opt_type, strikestr = match.groups()

    try:
        exp_date = datetime.strptime(datestr, "%y%m%d").date()
    except ValueError:
        return False, "INVALID_EXPIRY_DATE"

    today = datetime.now(timezone.utc).date()
    if exp_date <= today:
        return False, "EXPIRED_CONTRACT"

    strike = float(strikestr) / 1000.0
    if strike <= 0:
        return False, "INVALID_STRIKE_PRICE"

    return True, "VALID_OCC_SYMBOL"


def validate_buying_power(
    required_capital: float,
    available_buying_power: float
) -> Tuple[bool, str]:
    """
    Ensure the account has sufficient available buying power.
    """
    if required_capital <= 0:
        return False, "INVALID_REQUIRED_CAPITAL"

    if available_buying_power < required_capital:
        return False, f"INSUFFICIENT_BUYING_POWER: needed ${required_capital:.2f}, available ${available_buying_power:.2f}"

    return True, "BUYING_POWER_SUFFICIENT"


def validate_strategy_name(strategy: str) -> Tuple[bool, str]:
    """
    Ensure the strategy is one of the 7 defined-risk strategies.
    """
    if not strategy or strategy.upper() not in VALID_DEFINED_RISK_STRATEGIES:
        return False, f"INVALID_STRATEGY: '{strategy}' is not a defined-risk strategy"

    return True, "VALID_DEFINED_RISK_STRATEGY"