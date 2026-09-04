import re
from datetime import datetime, timezone
from typing import Tuple, Optional
from risk.limits import MAX_SPREAD_PERCENT

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
    if required_capital <= 0:
        return False, "INVALID_REQUIRED_CAPITAL"

    if available_buying_power < required_capital:
        return False, f"BUYING_POWER_INSUFFICIENT: INSUFFICIENT_BUYING_POWER - needed ${required_capital:.2f}, available ${available_buying_power:.2f}"

    return True, "BUYING_POWER_SUFFICIENT"


def validate_options_buying_power(
    required_capital: float,
    options_buying_power: float,
    general_buying_power: Optional[float] = None
) -> Tuple[bool, str]:
    if required_capital <= 0:
        return False, "INVALID_REQUIRED_CAPITAL"

    if options_buying_power < required_capital:
        reason = f"BUYING_POWER_INSUFFICIENT: needed ${required_capital:.2f}, options buying power ${options_buying_power:.2f}"
        if general_buying_power is not None and general_buying_power >= required_capital:
            reason += f" (general buying power ${general_buying_power:.2f} cannot be used for options)"
        return False, reason

    return True, "OPTIONS_BUYING_POWER_SUFFICIENT"


def validate_multileg_liquidity(
    legs: list,
    max_spread_percent: Optional[float] = None
) -> Tuple[bool, str, list]:
    threshold = max_spread_percent if max_spread_percent is not None else MAX_SPREAD_PERCENT
    if not legs:
        return False, "EMPTY_LEGS_LIST", []

    leg_reports = []
    for idx, leg in enumerate(legs):
        symbol = leg.get("symbol") or f"LEG_{idx}"
        bid = leg.get("bid")
        ask = leg.get("ask")

        if bid is None or ask is None or bid <= 0 or ask <= 0:
            return False, f"LEG_MISSING_QUOTE_DATA: {symbol} has invalid bid/ask", leg_reports

        if ask < bid:
            return False, f"INVERTED_MARKET: {symbol} ask ${ask:.2f} < bid ${bid:.2f}", leg_reports

        mid = (bid + ask) / 2.0
        spread = ask - bid
        spread_pct = round((spread / mid) * 100.0, 2) if mid > 0 else 999.0

        leg_report = {
            "symbol": symbol,
            "bid": bid,
            "ask": ask,
            "mid": round(mid, 2),
            "spread": round(spread, 2),
            "spread_percent": spread_pct,
            "liquid": spread_pct <= threshold
        }
        leg_reports.append(leg_report)

        if spread_pct > threshold:
            return False, f"LEG_SPREAD_TOO_WIDE: {symbol} spread {spread_pct}% exceeds {threshold:.1f}% limit", leg_reports

    return True, "ALL_LEGS_LIQUIDITY_APPROVED", leg_reports


def validate_strategy_name(strategy: str) -> Tuple[bool, str]:
    if not strategy or strategy.upper() not in VALID_DEFINED_RISK_STRATEGIES:
        return False, f"INVALID_STRATEGY: '{strategy}' is not a defined-risk strategy"

    return True, "VALID_DEFINED_RISK_STRATEGY"