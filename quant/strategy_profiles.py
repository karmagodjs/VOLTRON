STRATEGIES = {

    "BULL_CALL_SPREAD": {
        "type": "DEBIT_SPREAD",
        "direction": "BULLISH",
        "risk": "DEFINED",
        "max_loss": "PREMIUM_PAID",
        "max_profit": "WIDTH_MINUS_PREMIUM"
    },

    "BEAR_PUT_SPREAD": {
        "type": "DEBIT_SPREAD",
        "direction": "BEARISH",
        "risk": "DEFINED",
        "max_loss": "PREMIUM_PAID",
        "max_profit": "WIDTH_MINUS_PREMIUM"
    },

    "BULL_PUT_SPREAD": {
        "type": "CREDIT_SPREAD",
        "direction": "BULLISH",
        "risk": "DEFINED",
        "max_loss": "WIDTH_MINUS_CREDIT",
        "max_profit": "CREDIT_RECEIVED"
    },

    "BEAR_CALL_SPREAD": {
        "type": "CREDIT_SPREAD",
        "direction": "BEARISH",
        "risk": "DEFINED",
        "max_loss": "WIDTH_MINUS_CREDIT",
        "max_profit": "CREDIT_RECEIVED"
    },

    "IRON_CONDOR": {
        "type": "MULTI_LEG",
        "direction": "NEUTRAL",
        "risk": "DEFINED",
        "max_loss": "WING_WIDTH_MINUS_CREDIT",
        "max_profit": "CREDIT_RECEIVED"
    },

    "LONG_STRADDLE": {
        "type": "MULTI_LEG",
        "direction": "VOLATILITY",
        "risk": "DEFINED",
        "max_loss": "PREMIUM_PAID",
        "max_profit": "UNLIMITED_UPSIDE"
    }
}