import os
import sys
import unittest
import numpy as np

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from quant.strategy_selector import select_strategy
from quant.alpha import calculate_iv_rv_ratio, calculate_iv_premium
from quant.volatility import calculate_realized_volatility, calculate_log_returns
from quant.risk_reward import credit_spread_metrics, debit_spread_metrics
from risk.risk_engine import RiskEngine
from risk.limits import (
    MAX_TRADE_RISK,
    MAX_DAILY_LOSS,
    MAX_PORTFOLIO_EXPOSURE,
    MAX_CONSECUTIVE_LOSSES,
    MIN_OPPORTUNITY_SCORE,
    MAX_SPREAD_PERCENT,
)
from agent.state import AgentState
from agent.monitor import PositionMonitor
from agent.trade_logger import TradeLogger
from agent.analyst import create_analysis
from backtest.metrics import total_return, win_rate, profit_factor, max_drawdown, sharpe_ratio
from backend.service import VoltronService


class TestVoltronFullQA(unittest.TestCase):

    def setUp(self):
        self.service = VoltronService()
        self.risk_engine = RiskEngine(account_equity=100000.0)
        self.monitor = PositionMonitor()

    def test_ai_analyst_empty_market_data(self):
        res = create_analysis({})
        self.assertIn("decision", res)
        self.assertEqual(res["decision"], "NO_TRADE")

    def test_ai_analyst_invalid_api_key(self):
        old_key = os.environ.get("GEMINI_API_KEY")
        try:
            os.environ["GEMINI_API_KEY"] = ""
            res = create_analysis({"symbol": "SPY", "iv": 16.8})
            self.assertEqual(res["decision"], "NO_TRADE")
            self.assertEqual(res["confidence"], 0)
        finally:
            if old_key:
                os.environ["GEMINI_API_KEY"] = old_key

    def test_strategy_boundary_confidence_69(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 69,
            "opportunity_score": 90,
            "iv_rv_ratio": 1.62,
            "direction": "NEUTRAL"
        }
        self.assertEqual(select_strategy(analysis), "NO_TRADE")

    def test_strategy_boundary_confidence_70(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 70,
            "opportunity_score": 70,
            "iv_rv_ratio": 1.62,
            "direction": "NEUTRAL"
        }
        self.assertEqual(select_strategy(analysis), "IRON_CONDOR")

    def test_strategy_boundary_opp_score_69(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 69,
            "iv_rv_ratio": 1.62,
            "direction": "NEUTRAL"
        }
        self.assertEqual(select_strategy(analysis), "NO_TRADE")

    def test_strategy_expensive_vol_bullish(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 1.45,
            "direction": "BULLISH"
        }
        self.assertEqual(select_strategy(analysis), "BULL_PUT_SPREAD")

    def test_strategy_expensive_vol_bearish(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 1.45,
            "direction": "BEARISH"
        }
        self.assertEqual(select_strategy(analysis), "BEAR_CALL_SPREAD")

    def test_strategy_cheap_vol_neutral(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 0.75,
            "direction": "NEUTRAL"
        }
        self.assertEqual(select_strategy(analysis), "LONG_STRADDLE")

    def test_strategy_cheap_vol_bullish(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 0.75,
            "direction": "BULLISH"
        }
        self.assertEqual(select_strategy(analysis), "BULL_CALL_SPREAD")

    def test_strategy_cheap_vol_bearish(self):
        analysis = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 0.75,
            "direction": "BEARISH"
        }
        self.assertEqual(select_strategy(analysis), "BEAR_PUT_SPREAD")

    def test_risk_gate_opportunity_score_too_low(self):
        ok, reason = self.risk_engine.evaluate(max_loss=300, opportunity_score=65, proposed_exposure=5000)
        self.assertFalse(ok)
        self.assertEqual(reason, "OPPORTUNITY_SCORE_TOO_LOW")

    def test_risk_gate_trade_risk_too_high(self):
        ok, reason = self.risk_engine.evaluate(max_loss=1200, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok)
        self.assertEqual(reason, "TRADE_RISK_TOO_HIGH")

    def test_risk_gate_daily_loss_limit(self):
        self.risk_engine.daily_pnl = -2100.0
        ok, reason = self.risk_engine.evaluate(max_loss=300, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok)
        self.assertEqual(reason, "DAILY_LOSS_LIMIT_REACHED")

    def test_risk_gate_portfolio_exposure_too_high(self):
        self.risk_engine.portfolio_exposure = 28000.0
        ok, reason = self.risk_engine.evaluate(max_loss=300, opportunity_score=85, proposed_exposure=4000.0)
        self.assertFalse(ok)
        self.assertEqual(reason, "PORTFOLIO_EXPOSURE_TOO_HIGH")

    def test_risk_gate_consecutive_losses_limit(self):
        self.risk_engine.consecutive_losses = 3
        ok, reason = self.risk_engine.evaluate(max_loss=300, opportunity_score=85, proposed_exposure=2000.0)
        self.assertFalse(ok)
        self.assertEqual(reason, "CONSECUTIVE_LOSS_LIMIT")

    def test_risk_gate_all_approved(self):
        ok, reason = self.risk_engine.evaluate(max_loss=315.0, opportunity_score=94.0, proposed_exposure=5000.0)
        self.assertTrue(ok)
        self.assertEqual(reason, "RISK_APPROVED")

    def test_kill_switch_blocks_all_execution(self):
        self.risk_engine.activate_kill_switch()
        self.assertTrue(self.risk_engine.kill_switch)

        ok, reason = self.risk_engine.evaluate(max_loss=100.0, opportunity_score=100.0, proposed_exposure=100.0)
        self.assertFalse(ok)
        self.assertEqual(reason, "KILL_SWITCH_ACTIVE")

        self.risk_engine.reset_kill_switch()
        self.assertFalse(self.risk_engine.kill_switch)
        ok, reason = self.risk_engine.evaluate(max_loss=100.0, opportunity_score=100.0, proposed_exposure=100.0)
        self.assertTrue(ok)
        self.assertEqual(reason, "RISK_APPROVED")

    def test_position_monitor_take_profit_and_stop_loss(self):
        self.monitor.register_position(
            symbol="SPY",
            strategy="IRON_CONDOR",
            entry_price=5.00,
            take_profit=7.50,
            stop_loss=2.50
        )

        should_exit, reason = self.monitor.check_exit("SPY", current_price=6.00)
        self.assertFalse(should_exit)
        self.assertEqual(reason, "HOLD")

        should_exit, reason = self.monitor.check_exit("SPY", current_price=7.60)
        self.assertTrue(should_exit)
        self.assertEqual(reason, "TAKE_PROFIT")

        should_exit, reason = self.monitor.check_exit("SPY", current_price=2.40)
        self.assertTrue(should_exit)
        self.assertEqual(reason, "STOP_LOSS")

    def test_backtest_metrics_calculations(self):
        pnls = [185.0, 185.0, -315.0, 185.0, 185.0]
        self.assertAlmostEqual(win_rate(pnls), 0.80)

        self.assertAlmostEqual(total_return(100000, 100425), 0.00425)

        curve = [100000, 100185, 100370, 100055, 100240, 100425]
        self.assertAlmostEqual(max_drawdown(curve), (100370 - 100055) / 100370, places=4)

        returns = [0.01, 0.02, -0.01, 0.015, 0.02]
        sr = sharpe_ratio(returns)
        self.assertGreater(sr, 0)


if __name__ == "__main__":
    unittest.main()
