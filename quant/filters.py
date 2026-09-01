def valid_option(snapshot):

    if snapshot is None:
        return False

    if snapshot.implied_volatility is None:
        return False

    if snapshot.greeks is None:
        return False

    quote = snapshot.latest_quote

    if quote is None:
        return False

    if quote.bid_price <= 0:
        return False

    if quote.ask_price <= 0:
        return False

    return True
def iv_rv_ratio(iv, rv):

    if rv <= 0:
        return None

    return iv / rv


def iv_premium(iv, rv):

    if rv <= 0:
        return None

    return (iv - rv) / rv

def percentile_rank(values, current):

    if not values:
        return None

    below = sum(v <= current for v in values)

    return below / len(values)

def spread_percentage(bid, ask):

    midpoint = (bid + ask) / 2

    if midpoint <= 0:
        return None

    return (ask - bid) / midpoint

def event_risk_score(symbol):
    return 50
