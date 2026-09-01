def select_strategy(analysis):
    """
    Select a defined-risk options strategy based on
    VOLTRON quantitative signals and Gemini analysis.
    """

    if not analysis:
        return "NO_TRADE"

    # Support the scanner fields that are passed
    # together with Gemini analysis.
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

    # AI must agree that the opportunity deserves
    # further consideration.
    if decision != "TRADE_CANDIDATE":
        return "NO_TRADE"

    # Require reasonable AI confidence.
    if confidence < 70:
        return "NO_TRADE"

    # Quantitative opportunity threshold.
    if opportunity_score < 70:
        return "NO_TRADE"

    # ------------------------------------------------
    # EXPENSIVE VOLATILITY
    # ------------------------------------------------

    if iv_rv_ratio >= 1.40:

        if market_direction == "BULLISH":
            return "BULL_PUT_SPREAD"

        if market_direction == "BEARISH":
            return "BEAR_CALL_SPREAD"

        return "IRON_CONDOR"

    # ------------------------------------------------
    # CHEAP VOLATILITY
    # ------------------------------------------------

    if iv_rv_ratio <= 0.80:

        if market_direction == "BULLISH":
            return "BULL_CALL_SPREAD"

        if market_direction == "BEARISH":
            return "BEAR_PUT_SPREAD"

        return "LONG_STRADDLE"

    # ------------------------------------------------
    # NO CLEAR VOLATILITY EDGE
    # ------------------------------------------------

    return "NO_TRADE"