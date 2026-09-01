from backtest.strategy import generate_signal


tests = [
    {
        "name": "Cheap volatility",
        "iv": 0.18,
        "rv": 0.25,
        "score": 85
    },
    {
        "name": "Expensive volatility",
        "iv": 0.35,
        "rv": 0.20,
        "score": 90
    },
    {
        "name": "Neutral volatility",
        "iv": 0.24,
        "rv": 0.22,
        "score": 80
    },
    {
        "name": "Weak opportunity",
        "iv": 0.35,
        "rv": 0.20,
        "score": 55
    }
]


print("=" * 60)
print("       VOLTRON DAY 7 — STRATEGY TEST")
print("=" * 60)

for test in tests:

    result = generate_signal(
        iv=test["iv"],
        realized_vol=test["rv"],
        opportunity_score=test["score"]
    )

    print()
    print(test["name"])
    print(f"IV:              {test['iv']:.2%}")
    print(f"Realized Vol:    {test['rv']:.2%}")
    print(f"Score:           {test['score']}")
    print(f"Action:          {result.action}")
    print(f"Reason:          {result.reason}")
    print(f"Confidence:      {result.confidence:.2%}")

print()
print("=" * 60)