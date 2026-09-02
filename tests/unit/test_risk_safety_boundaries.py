import unittest
from risk.risk_engine import RiskEngine
from risk.limits import (
    MAX_TRADE_RISK,
    MAX_DAILY_LOSS,
    MAX_PORTFOLIO_EXPOSURE,
    MAX_CONSECUTIVE_LOSSES,
    MIN_OPPORTUNITY_SCORE,
    MAX_SPREAD_PERCENT,
)


class TestRiskSafetyBoundaries(unittest.TestCase):

    def setUp(self):
        self.risk = RiskEngine(account_equity=100000.0)

    def test_gate_01_opportunity_score_boundary(self):
        # Boundary: 69 (Block), 70 (Pass), 71 (Pass)
        ok69, r69 = self.risk.evaluate(max_loss=500, opportunity_score=69, proposed_exposure=5000)
        self.assertFalse(ok69)
        self.assertEqual(r69, "OPPORTUNITY_SCORE_TOO_LOW")

        ok70, r70 = self.risk.evaluate(max_loss=500, opportunity_score=70, proposed_exposure=5000)
        self.assertTrue(ok70)
        self.assertEqual(r70, "RISK_APPROVED")

        ok71, r71 = self.risk.evaluate(max_loss=500, opportunity_score=71, proposed_exposure=5000)
        self.assertTrue(ok71)
        self.assertEqual(r71, "RISK_APPROVED")

    def test_gate_02_max_trade_risk_boundary(self):
        # 1% of 100,000 = $1,000. Boundary: 999 (Pass), 1000 (Pass), 1001 (Block)
        ok999, r999 = self.risk.evaluate(max_loss=999.0, opportunity_score=85, proposed_exposure=5000)
        self.assertTrue(ok999)

        ok1000, r1000 = self.risk.evaluate(max_loss=1000.0, opportunity_score=85, proposed_exposure=5000)
        self.assertTrue(ok1000)

        ok1001, r1001 = self.risk.evaluate(max_loss=1001.0, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok1001)
        self.assertEqual(r1001, "TRADE_RISK_TOO_HIGH")

    def test_gate_03_max_daily_loss_boundary(self):
        # 2% of 100,000 = $2,000 max daily loss.
        self.risk.daily_pnl = -1999.0
        ok1, _ = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=5000)
        self.assertTrue(ok1)

        self.risk.daily_pnl = -2000.0
        ok2, r2 = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok2)
        self.assertEqual(r2, "DAILY_LOSS_LIMIT_REACHED")

        self.risk.daily_pnl = -2001.0
        ok3, r3 = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok3)
        self.assertEqual(r3, "DAILY_LOSS_LIMIT_REACHED")

    def test_gate_04_max_portfolio_exposure_boundary(self):
        # 30% of 100,000 = $30,000 max exposure cap.
        self.risk.portfolio_exposure = 26000.0
        # +4,000 = 30,000 (Pass)
        ok1, _ = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=4000.0)
        self.assertTrue(ok1)

        # +4,001 = 30,001 (Block)
        ok2, r2 = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=4001.0)
        self.assertFalse(ok2)
        self.assertEqual(r2, "PORTFOLIO_EXPOSURE_TOO_HIGH")

    def test_gate_05_consecutive_losses_boundary(self):
        # Limit is 3 consecutive losses
        self.risk.consecutive_losses = 2
        ok1, _ = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=5000)
        self.assertTrue(ok1)

        self.risk.consecutive_losses = 3
        ok2, r2 = self.risk.evaluate(max_loss=500, opportunity_score=85, proposed_exposure=5000)
        self.assertFalse(ok2)
        self.assertEqual(r2, "CONSECUTIVE_LOSS_LIMIT")

    def test_gate_06_kill_switch_fail_closed(self):
        # Active kill switch must block 100% of evaluations
        self.risk.activate_kill_switch()
        ok, r = self.risk.evaluate(max_loss=10.0, opportunity_score=100.0, proposed_exposure=100.0)
        self.assertFalse(ok)
        self.assertEqual(r, "KILL_SWITCH_ACTIVE")

    def test_risk_fail_closed_zero_equity(self):
        # Zero equity account must fail-closed immediately
        zero_risk = RiskEngine(account_equity=0.0)
        ok, r = zero_risk.evaluate(max_loss=100.0, opportunity_score=90.0, proposed_exposure=100.0)
        self.assertFalse(ok)


if __name__ == "__main__":
    unittest.main()
