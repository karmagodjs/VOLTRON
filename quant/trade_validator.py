def validate_trade(
    max_loss,
    account_equity,
    opportunity_score,
    reward_risk
):

    max_allowed_loss = account_equity * 0.01

    if opportunity_score < 70:
        return False, "Opportunity score too low"

    if max_loss > max_allowed_loss:
        return False, "Maximum loss exceeds 1% risk limit"

    if reward_risk < 0.30:
        return False, "Reward/risk too low"

    return True, "Trade passed validation"