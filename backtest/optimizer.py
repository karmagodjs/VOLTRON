def optimize_thresholds(
    prices,
    thresholds
):

    results = []

    for threshold in thresholds:

        trades = 0
        pnl = 0.0

        for i in range(1, len(prices)):

            previous = prices.iloc[i - 1]
            current = prices.iloc[i]

            if previous <= 0:
                continue

            change = (
                current - previous
            ) / previous

            if abs(change) >= threshold:

                trades += 1

                pnl += change

        results.append({
            "threshold": threshold,
            "trades": trades,
            "pnl": pnl
        })

    return results