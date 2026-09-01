from agent.loop import VoltronAgent
from risk.risk_engine import RiskEngine


cycle_count = 0


def scanner():
    global cycle_count

    cycle_count += 1

    print(f"\n--- SCAN CYCLE {cycle_count} ---")

    return [{
        "symbol": "SPY",
        "iv_rv_ratio": 1.66,
        "opportunity_score": 95,
        "max_loss": 300,
        "proposed_exposure": 1000,
    }]


def analyst(opportunity):

    return {
        "decision": "TRADE_CANDIDATE",
        "direction": "NEUTRAL",
        "confidence": 88,
        "volatility_view": "EXPENSIVE",
        "thesis": "Test volatility opportunity",
    }


def strategy_selector(analysis):
    return "IRON_CONDOR"


def executor(trade):

    print("EXECUTION BLOCKED — TEST MODE")

    return {
        "submitted": False,
        "reason": "TEST_MODE",
    }


risk_engine = RiskEngine(account_equity=100000)


agent = VoltronAgent(
    scanner=scanner,
    analyst=analyst,
    strategy_selector=strategy_selector,
    risk_engine=risk_engine,
    executor=executor,
)


print("\n========================================")
print("      VOLTRON AUTONOMOUS LOOP TEST")
print("========================================")

results = agent.run(
    cycles=3,
    delay_seconds=1,
)

print("\nRESULTS:")

for result in results:
    print(result)


print("\n========================================")
print("      AUTONOMOUS LOOP TEST COMPLETE")
print("========================================\n")