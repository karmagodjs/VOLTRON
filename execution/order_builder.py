from typing import Tuple
from alpaca.trading.requests import LimitOrderRequest
from alpaca.trading.enums import (
    OrderSide,
    TimeInForce
)


def build_option_buy_order(
    symbol,
    quantity,
    limit_price
):

    if not symbol:
        raise ValueError("Option symbol is required")

    if quantity <= 0:
        raise ValueError("Quantity must be positive")

    if limit_price <= 0:
        raise ValueError(
            "Limit price must be positive"
        )

    return LimitOrderRequest(
        symbol=symbol,
        qty=quantity,
        side=OrderSide.BUY,
        type="limit",
        limit_price=limit_price,
        time_in_force=TimeInForce.DAY
    )


def build_option_sell_order(symbol, quantity, limit_price):
    """
    Explicitly block single-leg naked short option orders.
    VOLTRON requires all options trading to be strictly defined-risk.
    """
    raise ValueError("Naked short option orders are strictly prohibited by VOLTRON risk rules")


def validate_defined_risk_order(order) -> Tuple[bool, str]:
    """
    Verify that an order has strictly defined risk:
    - Single-leg orders MUST be BUY orders (long option).
    - Multi-leg orders MUST have every short leg covered by an equal-quantity long leg.
    - No naked or uncovered short options are allowed.
    """
    if not order:
        return False, "EMPTY_ORDER"

    legs = getattr(order, "legs", None)
    if not legs:
        side = getattr(order, "side", None)
        if side == OrderSide.SELL:
            return False, "NAKED_SHORT_PROHIBITED"
        return True, "DEFINED_RISK_APPROVED"

    buy_calls = 0
    sell_calls = 0
    buy_puts = 0
    sell_puts = 0

    for leg in legs:
        sym = getattr(leg, "symbol", "") or ""
        side = getattr(leg, "side", None)
        ratio = getattr(leg, "ratio_qty", 1) or 1

        opt_type = None
        if len(sym) >= 15:
            type_char = sym[-9]
            if type_char in ("C", "P"):
                opt_type = type_char

        if side == OrderSide.BUY:
            if opt_type == "C":
                buy_calls += ratio
            elif opt_type == "P":
                buy_puts += ratio
            else:
                buy_calls += ratio
        elif side == OrderSide.SELL:
            if opt_type == "C":
                sell_calls += ratio
            elif opt_type == "P":
                sell_puts += ratio
            else:
                sell_calls += ratio

    if sell_calls > buy_calls:
        return False, "UNCOVERED_SHORT_CALL_PROHIBITED"
    if sell_puts > buy_puts:
        return False, "UNCOVERED_SHORT_PUT_PROHIBITED"

    return True, "DEFINED_RISK_APPROVED"