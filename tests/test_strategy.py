from quant.strategy_selector import select_strategy


analysis = {
    "decision": "TRADE_CANDIDATE",
    "direction": "NEUTRAL",
    "confidence": 88,
    "iv_rv_ratio": 1.66,
    "opportunity_score": 95,
}


strategy = select_strategy(analysis)

print("\n==============================")
print("     VOLTRON STRATEGY TEST")
print("==============================")

print(f"Decision: {analysis['decision']}")
print(f"Direction: {analysis['direction']}")
print(f"Confidence: {analysis['confidence']}")
print(f"IV/RV: {analysis['iv_rv_ratio']}")
print(f"Score: {analysis['opportunity_score']}")
print(f"\nSelected Strategy: {strategy}")

print("==============================\n")