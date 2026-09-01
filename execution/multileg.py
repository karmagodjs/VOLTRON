from alpaca.trading.requests import (
    OptionLegRequest,
    LimitOrderRequest
)

from alpaca.trading.enums import (
    OrderSide,
    TimeInForce,
    PositionIntent
)


def build_iron_condor(
    long_put,
    short_put,
    short_call,
    long_call,
    quantity,
    limit_price
):

    if quantity <= 0:
        raise ValueError("Invalid quantity")

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