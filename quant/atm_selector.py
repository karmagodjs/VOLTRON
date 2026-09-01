def find_atm_contracts(chain, underlying_price):
    candidates = []

    for symbol, snapshot in chain.items():

        if snapshot.implied_volatility is None:
            continue

        if snapshot.greeks is None:
            continue

        if snapshot.latest_quote is None:
            continue

        # Extract strike from option symbol.
        # We'll improve contract parsing later.
        candidates.append(
            (symbol, snapshot)
        )

    return candidates