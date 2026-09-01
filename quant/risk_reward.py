def credit_spread_metrics(
    spread_width,
    credit_received
):
    max_profit = credit_received
    max_loss = spread_width - credit_received

    if max_loss <= 0:
        return None

    reward_risk = max_profit / max_loss

    return {
        "max_profit": max_profit,
        "max_loss": max_loss,
        "reward_risk": reward_risk
    }


def debit_spread_metrics(
    spread_width,
    premium_paid
):
    max_loss = premium_paid
    max_profit = spread_width - premium_paid

    if max_profit <= 0:
        return None

    reward_risk = max_profit / max_loss

    return {
        "max_profit": max_profit,
        "max_loss": max_loss,
        "reward_risk": reward_risk
    }