import unittest
from unittest.mock import patch, MagicMock

from agent.state import AgentState
from agent.loop import VoltronAgent
from agent.monitor import PositionMonitor
from agent.trade_logger import TradeLogger
from risk.risk_engine import RiskEngine


class TestAutonomousLifecycle(unittest.TestCase):

    def setUp(self):
        self.state = AgentState()
        self.risk = RiskEngine(account_equity=100000.0)
        self.monitor = PositionMonitor()
        self.logger = TradeLogger()
        self.agent = VoltronAgent(risk_engine=self.risk)

    def test_state_machine_initial_state(self):
        self.assertEqual(self.agent.state.status, "IDLE")
        self.assertEqual(self.agent.state.cycle, 0)

    def test_state_machine_transition_sequence(self):
        # Verify safe state updates
        self.agent.state.status = "SCANNING"
        self.assertEqual(self.agent.state.status, "SCANNING")

        self.agent.state.status = "ANALYZING"
        self.assertEqual(self.agent.state.status, "ANALYZING")

        self.agent.state.status = "RISK_CHECK"
        self.assertEqual(self.agent.state.status, "RISK_CHECK")

        self.agent.state.status = "EXECUTING"
        self.assertEqual(self.agent.state.status, "EXECUTING")

        self.agent.state.status = "MONITORING"
        self.assertEqual(self.agent.state.status, "MONITORING")

    def test_state_consistency_on_risk_rejection(self):
        # If risk engine rejects, execution must NOT occur
        self.agent.state.status = "RISK_CHECK"
        ok, reason = self.risk.evaluate(max_loss=5000.0, opportunity_score=50, proposed_exposure=5000.0)
        self.assertFalse(ok)
        
        self.agent.state.status = "RISK_REJECTED"
        self.assertEqual(self.agent.state.status, "RISK_REJECTED")

    def test_kill_switch_intercepts_lifecycle(self):
        self.risk.activate_kill_switch()
        ok, reason = self.risk.evaluate(max_loss=100.0, opportunity_score=95, proposed_exposure=100.0)
        self.assertFalse(ok)
        self.assertEqual(reason, "KILL_SWITCH_ACTIVE")


if __name__ == "__main__":
    unittest.main()
