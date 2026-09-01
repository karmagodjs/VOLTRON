from agent.loop import VoltronAgent
from risk.risk_engine import RiskEngine


def scanner():

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
        "thesis": "Defined-risk volatility opportunity",
    }


def strategy_selector(analysis):

    return "IRON_CONDOR"


def executor(trade):

    print("\nPAPER EXECUTION TEST")
    print("Strategy:", trade["strategy"])
    print("Symbol:", trade["symbol"])

    return {
        "submitted": False,
        "reason": "DRY_RUN",
    }


risk_engine = RiskEngine(
    account_equity=100000
)


agent = VoltronAgent(
    scanner=scanner,
    analyst=analyst,
    strategy_selector=strategy_selector,
    risk_engine=risk_engine,
    executor=executor,
)


print("\n========================================")
print("       VOLTRON PAPER E2E TEST")
print("========================================")

result = agent.run_cycle()

print("\nFINAL RESULT:")
print(result)

assert result["status"] == "EXECUTION_BLOCKED"
assert result["result"]["submitted"] is False

print("\nE2E DRY RUN: PASS")

print("========================================\n")