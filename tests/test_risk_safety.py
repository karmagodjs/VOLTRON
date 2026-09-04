from risk.risk_engine import RiskEngine


print("\n========================================")
print("       VOLTRON RISK SAFETY TEST")
print("========================================")


risk = RiskEngine(account_equity=100000)


approved, reason = risk.evaluate(
    max_loss=300,
    opportunity_score=95,
    proposed_exposure=1000,
)

print("\nTEST 1 — SAFE TRADE")
print("Approved:", approved)
print("Reason:", reason)

assert approved is True


approved, reason = risk.evaluate(
    max_loss=300,
    opportunity_score=40,
    proposed_exposure=1000,
)

print("\nTEST 2 — LOW OPPORTUNITY")
print("Approved:", approved)
print("Reason:", reason)

assert approved is False


approved, reason = risk.evaluate(
    max_loss=10000,
    opportunity_score=95,
    proposed_exposure=1000,
)

print("\nTEST 3 — HIGH TRADE RISK")
print("Approved:", approved)
print("Reason:", reason)

assert approved is False


risk.activate_kill_switch()

approved, reason = risk.evaluate(
    max_loss=300,
    opportunity_score=95,
    proposed_exposure=1000,
)

print("\nTEST 4 — KILL SWITCH")
print("Approved:", approved)
print("Reason:", reason)

assert approved is False


print("\n========================================")
print("       ALL SAFETY TESTS PASSED")
print("========================================\n")