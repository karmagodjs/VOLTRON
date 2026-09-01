from execution.client import get_account


account = get_account()


print("=" * 60)
print("        VOLTRON PAPER ACCOUNT TEST")
print("=" * 60)

print()
print("Account ID:", account.id)
print("Status:", account.status)
print("Cash:", account.cash)
print("Buying Power:", account.buying_power)
print("Portfolio Value:", account.portfolio_value)

print()
print("=" * 60)