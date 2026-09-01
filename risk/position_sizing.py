def calculate_position_size(
    account_equity,
    max_loss_per_contract,
    risk_fraction=0.01
):
    if account_equity <= 0:
        return 0

    if max_loss_per_contract <= 0:
        return 0

    risk_budget = account_equity * risk_fraction

    quantity = int(
        risk_budget / max_loss_per_contract
    )

    return max(0, quantity)