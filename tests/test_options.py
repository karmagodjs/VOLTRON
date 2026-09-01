from quant.options_scanner import get_option_chain


chain = get_option_chain("SPY")

print("Total contracts:", len(chain))

count = 0

for symbol, snapshot in chain.items():

    if snapshot.implied_volatility is None:
        continue

    print("\nContract:", symbol)
    print("IV:", snapshot.implied_volatility)
    print("Greeks:", snapshot.greeks)

    if snapshot.latest_quote:
        print("Bid:", snapshot.latest_quote.bid_price)
        print("Ask:", snapshot.latest_quote.ask_price)

    count += 1

    if count >= 5:
        break