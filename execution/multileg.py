from alpaca.trading.requests import (
    OptionLegRequest,
    LimitOrderRequest
)

from alpaca.trading.enums import (
    OrderSide,
    TimeInForce,
    PositionIntent
)
from risk.limits import MAX_CONTRACT_QUANTITY


def build_iron_condor(
    long_put,
    short_put,
    short_call,
    long_call,
    quantity,
    limit_price
):
    if not all([long_put, short_put, short_call, long_call]):
        raise ValueError("All 4 option leg symbols are required for an Iron Condor")

    symbols = [long_put, short_put, short_call, long_call]
    if len(set(symbols)) != 4:
        raise ValueError("All 4 Iron Condor leg symbols must be distinct contracts")

    if quantity <= 0:
        raise ValueError("Invalid quantity")

    if quantity > MAX_CONTRACT_QUANTITY:
        raise ValueError(f"Quantity {quantity} exceeds maximum contract limit of {MAX_CONTRACT_QUANTITY}")

    if limit_price <= 0:
        raise ValueError("Limit price must be positive")

    legs = [
        OptionLegRequest(
            symbol=long_put,
            side=OrderSide.BUY,
            ratio_qty=1,
            position_intent=PositionIntent.BUY_TO_OPEN
        ),
        OptionLegRequest(
            symbol=short_put,
            side=OrderSide.SELL,
            ratio_qty=1,
            position_intent=PositionIntent.SELL_TO_OPEN
        ),
        OptionLegRequest(
            symbol=short_call,
            side=OrderSide.SELL,
            ratio_qty=1,
            position_intent=PositionIntent.SELL_TO_OPEN
        ),
        OptionLegRequest(
            symbol=long_call,
            side=OrderSide.BUY,
            ratio_qty=1,
            position_intent=PositionIntent.BUY_TO_OPEN
        )
    ]

    return LimitOrderRequest(
        order_class="mleg",
        qty=quantity,
        type="limit",
        limit_price=limit_price,
        time_in_force=TimeInForce.DAY,
        legs=legs
    )


def build_vertical_spread(
    long_leg,
    short_leg,
    quantity,
    limit_price,
    spread_type="BULL_CALL_SPREAD"
):
    """
    Build defined-risk 2-leg vertical spread:
    - Bull Call Spread / Bear Put Spread (Debit)
    - Bull Put Spread / Bear Call Spread (Credit)
    Guarantees exactly 2 legs (1 BUY, 1 SELL) with equal ratio_qty=1.
    """
    if not long_leg or not short_leg:
        raise ValueError("Both long and short leg symbols are required for a vertical spread")

    if long_leg == short_leg:
        raise ValueError("Long and short leg symbols cannot be identical")

    if quantity <= 0:
        raise ValueError("Invalid quantity")

    if quantity > MAX_CONTRACT_QUANTITY:
        raise ValueError(f"Quantity {quantity} exceeds maximum contract limit of {MAX_CONTRACT_QUANTITY}")

    if limit_price <= 0:
        raise ValueError("Limit price must be positive")

    legs = [
        OptionLegRequest(
            symbol=long_leg,
            side=OrderSide.BUY,
            ratio_qty=1,
            position_intent=PositionIntent.BUY_TO_OPEN
        ),
        OptionLegRequest(
            symbol=short_leg,
            side=OrderSide.SELL,
            ratio_qty=1,
            position_intent=PositionIntent.SELL_TO_OPEN
        )
    ]

    return LimitOrderRequest(
        order_class="mleg",
        qty=quantity,
        type="limit",
        limit_price=limit_price,
        time_in_force=TimeInForce.DAY,
        legs=legs
    )


def build_long_straddle(
    call_leg,
    put_leg,
    quantity,
    limit_price
):
    """
    Build defined-risk 2-leg long straddle:
    - 1 Long Call (BUY) + 1 Long Put (BUY) at ATM strike.
    Guarantees exactly 2 BUY legs with equal ratio_qty=1 (max loss = premium paid).
    """
    if not call_leg or not put_leg:
        raise ValueError("Both call and put leg symbols are required for a straddle")

    if call_leg == put_leg:
        raise ValueError("Call and put leg symbols cannot be identical")

    if quantity <= 0:
        raise ValueError("Invalid quantity")

    if quantity > MAX_CONTRACT_QUANTITY:
        raise ValueError(f"Quantity {quantity} exceeds maximum contract limit of {MAX_CONTRACT_QUANTITY}")

    if limit_price <= 0:
        raise ValueError("Limit price must be positive")

    legs = [
        OptionLegRequest(
            symbol=call_leg,
            side=OrderSide.BUY,
            ratio_qty=1,
            position_intent=PositionIntent.BUY_TO_OPEN
        ),
        OptionLegRequest(
            symbol=put_leg,
            side=OrderSide.BUY,
            ratio_qty=1,
            position_intent=PositionIntent.BUY_TO_OPEN
        )
    ]

    return LimitOrderRequest(
        order_class="mleg",
        qty=quantity,
        type="limit",
        limit_price=limit_price,
        time_in_force=TimeInForce.DAY,
        legs=legs
    )