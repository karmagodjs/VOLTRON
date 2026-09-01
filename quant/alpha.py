def calculate_iv_rv_ratio(iv, realized_vol):
    if realized_vol <= 0:
        return None

    return iv / realized_vol


def calculate_iv_premium(iv, realized_vol):
    if realized_vol <= 0:
        return None

    return (iv - realized_vol) / realized_vol