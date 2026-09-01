from risk.risk_engine import RiskEngine


engine = RiskEngine(
    account_equity=100000
)


print("=" * 60)
print("          VOLTRON RISK ENGINE TEST")
print("=" * 60)


# Test 1
approved, reason = engine.evaluate(
    max_loss=500,
    opportunity_score=85,
    proposed_exposure=5000
)

print()
print("TEST 1 — Normal Trade")
print("Approved:", approved)
print("Reason:", reason)


# Test 2
approved, reason = engine.evaluate(
    max_loss=1500,
    opportunity_score=90,
    proposed_exposure=5000
)

print()
print("TEST 2 — Excessive Risk")
print("Approved:", approved)
print("Reason:", reason)


# Test 3
approved, reason = engine.evaluate(
    max_loss=500,
    opportunity_score=50,
    proposed_exposure=5000
)

print()
print("TEST 3 — Low Opportunity")
print("Approved:", approved)
print("Reason:", reason)


# Test 4
engine.record_trade_result(-800)
engine.record_trade_result(-800)
engine.record_trade_result(-800)

approved, reason = engine.evaluate(
    max_loss=500,
    opportunity_score=90,
    proposed_exposure=5000
)

print()
print("TEST 4 — Consecutive Loss Protection")
print("Approved:", approved)
print("Reason:", reason)


print()
print("=" * 60)