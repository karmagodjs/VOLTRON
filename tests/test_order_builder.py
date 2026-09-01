from execution.order_builder import (
    build_option_buy_order
)


order = build_option_buy_order(
    symbol="YOUR_REAL_OPTION_SYMBOL",
    quantity=1,
    limit_price=1.00
)


print("=" * 60)
print("       VOLTRON ORDER BUILDER TEST")
print("=" * 60)

print()
print("Symbol:", order.symbol)
print("Quantity:", order.qty)
print("Side:", order.side)
print("Type:", order.type)
print("Limit Price:", order.limit_price)
print("Time in Force:", order.time_in_force)

print()
print("=" * 60)