from agent.analyst import create_analysis


data = {
    "symbol": "SPY",
    "underlying_price": 761.78,
    "implied_volatility": 0.1194,
    "realized_volatility": 0.0718,
    "iv_rv_ratio": 1.66,
    "iv_premium": 0.6635,
    "opportunity_score": 95,
    "volatility_signal": "IV_EXPENSIVE",
    "market_direction": "NEUTRAL",
}


result = create_analysis(data)

print("\n==============================")
print("       GEMINI ANALYSIS")
print("==============================\n")

print(result)