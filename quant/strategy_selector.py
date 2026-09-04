def select_strategy(analysis):

    if not analysis:
        return "NO_TRADE"

    iv_rv_ratio = analysis.get(
        "iv_rv_ratio",
        0
    )

    opportunity_score = analysis.get(
        "opportunity_score",
        0
    )

    market_direction = analysis.get(
        "direction",
        "NEUTRAL"
    )

    decision = analysis.get(
        "decision",
        "NO_TRADE"
    )

    confidence = analysis.get(
        "confidence",
        0
    )

    if decision != "TRADE_CANDIDATE":
        return "NO_TRADE"

    if confidence < 70:
        return "NO_TRADE"

    if opportunity_score < 70:
        return "NO_TRADE"


    if iv_rv_ratio >= 1.40:

        if market_direction == "BULLISH":
            return "BULL_PUT_SPREAD"

        if market_direction == "BEARISH":
            return "BEAR_CALL_SPREAD"

        return "IRON_CONDOR"


    if iv_rv_ratio <= 0.80:

        if market_direction == "BULLISH":
            return "BULL_CALL_SPREAD"

        if market_direction == "BEARISH":
            return "BEAR_PUT_SPREAD"

        return "LONG_STRADDLE"


    return "NO_TRADE"