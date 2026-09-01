from agent.loop import VoltronAgent


def scanner():
    return [{
        "symbol": "SPY",
        "iv_rv_ratio": 1.66,
        "opportunity_score": 95,
        "max_loss": 300,
        "proposed_exposure": 1000,
        "short_call": "TEST_SC",
        "long_call": "TEST_LC",
        "short_put": "TEST_SP",
        "long_put": "TEST_LP",
        "quantity": 1,
    }]


def analyst(data):
    return {
        "decision": "TRADE_CANDIDATE",
        "direction": "NEUTRAL",
        "confidence": 88,
        "thesis": "Test opportunity",
    }


def selector(analysis):
    return "IRON_CONDOR"


def executor(trade):
    return {
        "submitted": False,
        "reason": "TEST_MODE",
    }


agent = VoltronAgent(
    scanner=scanner,
    analyst=analyst,
    strategy_selector=selector,
    risk_engine=None,
    executor=executor,
)

print("\n==============================")
print("     VOLTRON AGENT TEST")
print("==============================")

result = agent.run_cycle()

print(result)

print("==============================\n")