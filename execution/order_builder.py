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