def validate_ai_decision(
    decision,
    confidence,
    opportunity_score
):

    if decision not in [
        "TRADE_CANDIDATE",
        "NO_TRADE"
    ]:
        return False, "Invalid AI decision"

    if decision == "NO_TRADE":
        return False, "AI rejected opportunity"

    if confidence < 70:
        return False, "AI confidence too low"

    if opportunity_score < 70:
        return False, "Opportunity score too low"

    return True, "AI decision passed"