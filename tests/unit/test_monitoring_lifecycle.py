import unittest
from unittest.mock import MagicMock, patch
from agent.monitor import PositionMonitor
from agent.state import AgentState


class TestMonitoringLifecyclePhase43(unittest.TestCase):

    def setUp(self):
        self.monitor = PositionMonitor()

    def test_a_profit_target_trigger(self):
        self.monitor.register_position(
            symbol="SPY_IC_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            take_profit=1.50,
            stop_loss=6.00,
            is_credit=True,
            quantity=1
        )
        should_exit, reason = self.monitor.check_exit("SPY_IC_TEST", current_price=1.40)
        self.assertTrue(should_exit)
        self.assertEqual(reason, "PROFIT_TARGET")

    def test_b_stop_loss_trigger(self):
        self.monitor.register_position(
            symbol="SPY_CREDIT_TEST",
            strategy="BULL_PUT_SPREAD",
            entry_price=2.00,
            take_profit=1.00,
            stop_loss=4.00,
            is_credit=True,
            quantity=1
        )
        should_exit, reason = self.monitor.check_exit("SPY_CREDIT_TEST", current_price=4.20)
        self.assertTrue(should_exit)
        self.assertEqual(reason, "STOP_LOSS")

    def test_c_normal_holding(self):
        self.monitor.register_position(
            symbol="SPY_HOLD_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            take_profit=1.50,
            stop_loss=6.00,
            is_credit=True,
            quantity=1
        )
        should_exit, reason = self.monitor.check_exit("SPY_HOLD_TEST", current_price=2.20)
        self.assertFalse(should_exit)
        self.assertEqual(reason, "HOLD")

    def test_d_expiry_handling_21_dte(self):
        self.monitor.register_position(
            symbol="SPY_EXPIRY_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            dte=25,
            is_credit=True
        )
        should_exit, reason = self.monitor.check_exit("SPY_EXPIRY_TEST", current_price=2.50, dte=25)
        self.assertFalse(should_exit)

        should_exit, reason = self.monitor.check_exit("SPY_EXPIRY_TEST", current_price=2.50, dte=21)
        self.assertTrue(should_exit)
        self.assertEqual(reason, "EXPIRY")

    def test_e_duplicate_exit_prevention(self):
        self.monitor.register_position(
            symbol="SPY_DUP_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            take_profit=1.50,
            stop_loss=6.00,
            is_credit=True
        )
        exit1, reason1 = self.monitor.check_exit("SPY_DUP_TEST", current_price=1.20, mark_pending=True)
        self.assertTrue(exit1)
        self.assertEqual(reason1, "PROFIT_TARGET")

        exit2, reason2 = self.monitor.check_exit("SPY_DUP_TEST", current_price=1.20)
        self.assertFalse(exit2)
        self.assertEqual(reason2, "ALREADY_EXITING")

        self.monitor.close_position("SPY_DUP_TEST", reason="PROFIT_TARGET", exit_price=1.20)

        exit3, reason3 = self.monitor.check_exit("SPY_DUP_TEST", current_price=1.20)
        self.assertFalse(exit3)
        self.assertEqual(reason3, "ALREADY_CLOSED")

    def test_f_missing_price_fail_closed(self):
        self.monitor.register_position(
            symbol="SPY_NO_PRICE",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            is_credit=True
        )
        should_exit, reason = self.monitor.check_exit("SPY_NO_PRICE", current_price=None)
        self.assertFalse(should_exit)
        self.assertEqual(reason, "MISSING_PRICE")

    def test_g_broker_error_handling(self):
        from agent.loop import VoltronAgent
        agent = VoltronAgent()
        agent.monitor.register_position(
            symbol="SPY_ERR_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            take_profit=1.50,
            stop_loss=6.00,
            is_credit=True
        )
        res = agent.monitor_position("SPY_ERR_TEST", current_price=2.00)
        self.assertFalse(res["exit"])
        self.assertEqual(res["reason"], "HOLD")

        mock_executor = MagicMock()
        mock_executor.submit_option_order.side_effect = ConnectionError("Alpaca Paper REST Gateway 502")
        agent.executor = mock_executor

        pos = agent.monitor.get_position("SPY_ERR_TEST")
        pos["status"] = "OPEN"
        should_exit, reason = agent.monitor.check_exit("SPY_ERR_TEST", current_price=1.20)
        self.assertTrue(should_exit)

        trade_payload = {"order": {"symbol": "SPY"}, "max_loss": 300, "opportunity_score": 80, "proposed_exposure": 300}
        exec_res = agent.execute(trade_payload, dry_run=False)
        self.assertFalse(exec_res.get("submitted", False))
        self.assertIsNotNone(agent.monitor.get_position("SPY_ERR_TEST"))

    def test_h_reconcile_already_closed(self):
        self.monitor.register_position(
            symbol="SPY_RECONCILE_TEST",
            strategy="IRON_CONDOR",
            entry_price=3.00,
            legs=[{"symbol": "SPY260918C00580000", "quantity": 1}]
        )
        result = self.monitor.reconcile_broker_positions(broker_positions=[])
        self.assertIn("SPY_RECONCILE_TEST", result["reconciled_closed"])
        pos = self.monitor.get_position("SPY_RECONCILE_TEST")
        self.assertEqual(pos["status"], "CLOSED")
        self.assertEqual(pos["exit_reason"], "RECONCILED_CLOSED_AT_BROKER")

    def test_multileg_integrity_and_strategy_pnl(self):
        legs = [
            {"symbol": "SPY_P1", "side": "BUY", "quantity": 1, "strike": 570, "entry_price": 0.50},
            {"symbol": "SPY_P2", "side": "SELL", "quantity": 1, "strike": 575, "entry_price": 1.50},
            {"symbol": "SPY_C1", "side": "SELL", "quantity": 1, "strike": 590, "entry_price": 1.50},
            {"symbol": "SPY_C2", "side": "BUY", "quantity": 1, "strike": 595, "entry_price": 0.50},
        ]
        self.monitor.register_position(
            symbol="SPY_IC_MULTI",
            strategy="IRON_CONDOR",
            entry_price=2.00,
            is_credit=True,
            quantity=1,
            legs=legs,
            max_loss=300.0,
            max_profit=200.0
        )
        ok, reason = self.monitor.validate_multileg_integrity("SPY_IC_MULTI")
        self.assertTrue(ok)
        self.assertEqual(reason, "MULTILEG_INTEGRITY_APPROVED")

        self.monitor.register_position(
            symbol="SPY_BAD_IC",
            strategy="IRON_CONDOR",
            entry_price=1.00,
            legs=legs[:3],
            quantity=1
        )
        bad_ok, bad_reason = self.monitor.validate_multileg_integrity("SPY_BAD_IC")
        self.assertFalse(bad_ok)
        self.assertIn("INCOMPLETE_LEGS", bad_reason)

        current_quotes = {
            "SPY_P1": 0.10,
            "SPY_P2": 0.40,
            "SPY_C1": 0.40,
            "SPY_C2": 0.10,
        }
        pnl_res = self.monitor.calculate_pnl("SPY_IC_MULTI", leg_prices=current_quotes)
        self.assertEqual(pnl_res["unrealized_pnl"], 140.0)
        self.assertEqual(len(pnl_res["legs"]), 4)

    def test_state_machine_transitions(self):
        state = AgentState()
        self.assertEqual(state.status, "IDLE")

        state.transition_to("SCANNING", reason="CYCLE_START")
        self.assertEqual(state.status, "SCANNING")

        state.transition_to("ANALYZING", reason="OPPORTUNITY_FOUND")
        self.assertEqual(state.status, "ANALYZING")

        state.transition_to("TRADE_ACTIVE", reason="ORDER_FILLED")
        self.assertEqual(state.status, "TRADE_ACTIVE")

        state.transition_to("MONITORING", reason="POSITION_REGISTERED")
        self.assertEqual(state.status, "MONITORING")

        state.transition_to("EXIT_PENDING", reason="PROFIT_TARGET_HIT")
        self.assertEqual(state.status, "EXIT_PENDING")

        state.transition_to("CLOSED", reason="EXIT_ORDER_FILLED")
        self.assertEqual(state.status, "CLOSED")

        self.assertEqual(len(state.state_history), 6)

    def test_duplicate_exit_order_prevention_in_executor(self):
        from execution.executor import PaperExecutor
        from risk.risk_engine import RiskEngine
        executor = PaperExecutor(risk_engine=RiskEngine(account_equity=100000.0))

        mock_client = MagicMock()
        mock_order = MagicMock()
        mock_order.id = "MOCK_ORDER_123"
        mock_client.submit_order.return_value = mock_order

        with patch.dict("os.environ", {"VOLTRON_TRADING_ENABLED": "false"}):
            with patch("execution.executor.get_trading_client", return_value=mock_client):
                res1 = executor.submit_option_order(
                    order=MagicMock(side="buy", qty=1),
                    max_loss=300.0,
                    opportunity_score=85,
                    proposed_exposure=300.0,
                    spread_percent=0.03,
                    dry_run=False,
                )
                self.assertFalse(res1["submitted"])
                self.assertEqual(res1["reason"], "TRADING_DISABLED")

                res2 = executor.submit_option_order(
                    order=MagicMock(side="buy", qty=1),
                    max_loss=300.0,
                    opportunity_score=85,
                    proposed_exposure=300.0,
                    spread_percent=0.03,
                    dry_run=False,
                )
                self.assertFalse(res2["submitted"])
                self.assertEqual(res2["reason"], "TRADING_DISABLED")

                self.assertEqual(mock_client.submit_order.call_count, 0)


if __name__ == "__main__":
    unittest.main()

