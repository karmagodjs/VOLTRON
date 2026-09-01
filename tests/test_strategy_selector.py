from agent.analyst import create_analysis


test_data = {
    "symbol": "SPY",
    "price": 761.78,
    "iv": 0.1194,
    "rv": 0.0718,
    "iv_rv_ratio": 1.66,
    "iv_premium": 0.6635,
    "opportunity_score": 95,
}


print("=" * 60)
print("          VOLTRON AI ANALYST TEST")
print("=" * 60)

print("\nMARKET DATA:")
print(test_data)

result = create_analysis(test_data)

print("\nAI ANALYSIS:")
print(result)

assert "decision" in result
assert "confidence" in result
assert "direction" in result
assert "volatility_view" in result

print("\nAI ANALYST TEST: PASS")
print("=" * 60)