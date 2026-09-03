from risk.limits import MAX_CONTRACT_QUANTITY


def calculate_position_size(
    account_equity,
    max_loss_per_contract,
    risk_fraction=0.01,
    max_contracts=None,
    available_liquidity_size=None,
):
    if account_equity <= 0:
        return 0

    if max_loss_per_contract <= 0:
        return 0

    risk_budget = account_equity * risk_fraction
    raw_quantity = int(risk_budget / max_loss_per_contract)

    cap = max_contracts if max_contracts is not None else MAX_CONTRACT_QUANTITY
    quantity = min(raw_quantity, cap)

    if available_liquidity_size is not None and available_liquidity_size > 0:
        quantity = min(quantity, int(available_liquidity_size))

    return max(0, quantity)