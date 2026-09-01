from agent.loop import VoltronAgent


def fake_scanner():

    return [
        {
            "symbol": "SPY",
            "max_loss": 500,
            "opportunity_score": 85,
            "proposed_exposure": 5000
        }
    ]


def fake_analyst(opportunity):

    return {
        "decision": "TRADE_CANDIDATE",
        "confidence": 85,
        "direction": "BULLISH"
    }


def fake_strategy_selector(analysis):

    return "BULL_PUT_SPREAD"


class FakeRiskEngine:

    def evaluate(
        self,
        max_loss,
        opportunity_score,
        proposed_exposure
    ):

        if max_loss > 1000:
            return False, "TRADE_RISK_TOO_HIGH"

        return True, "RISK_APPROVED"


def fake_executor(trade):

    return {
        "submitted": False,
        "reason": "TEST_MODE"
    }


agent = VoltronAgent(
    scanner=fake_scanner,
    analyst=fake_analyst,
    strategy_selector=fake_strategy_selector,
    risk_engine=FakeRiskEngine(),
    executor=fake_executor
)


result = agent.run_cycle()


print("=" * 60)
print("        VOLTRON AUTONOMOUS LOOP TEST")
print("=" * 60)

print()

print("Cycle:", agent.state.cycle)
print("Symbol:", agent.state.symbol)
print("Status:", agent.state.status)
print("Reason:", agent.state.last_reason)

print()
print("Result:")
print(result)

print()
print("=" * 60)

print()
print("KILL SWITCH TEST")

risk_engine = FakeRiskEngine()

agent = VoltronAgent(
    scanner=fake_scanner,
    analyst=fake_analyst,
    strategy_selector=fake_strategy_selector,
    risk_engine=risk_engine,
    executor=fake_executor
)

print("Agent created successfully")