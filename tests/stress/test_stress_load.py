import unittest
import time
import tracemalloc

from quant.strategy_selector import select_strategy
from risk.risk_engine import RiskEngine
from agent.monitor import PositionMonitor


class TestStressLoad(unittest.TestCase):

    def test_1000_simulated_quant_risk_evaluations(self):
        tracemalloc.start()
        start_time = time.time()

        risk = RiskEngine(account_equity=100000.0)
        monitor = PositionMonitor()

        approved_count = 0
        blocked_count = 0

        for i in range(1000):
            # Vary opportunity score and loss
            opp_score = 65 + (i % 35) # 65 to 99
            max_loss = 200 + (i % 900) # $200 to $1100

            analysis = {
                "decision": "TRADE_CANDIDATE",
                "confidence": 75 + (i % 25),
                "opportunity_score": opp_score,
                "iv_rv_ratio": 1.45,
                "direction": "NEUTRAL"
            }
            strat = select_strategy(analysis)
            
            ok, reason = risk.evaluate(max_loss=max_loss, opportunity_score=opp_score, proposed_exposure=5000.0)
            if ok:
                approved_count += 1
            else:
                blocked_count += 1

        elapsed = time.time() - start_time
        current_mem, peak_mem = tracemalloc.get_traced_memory()
        tracemalloc.stop()

        # 1,000 cycles must run in under 1 second
        self.assertLess(elapsed, 1.0, f"Stress test took too long: {elapsed:.3f}s")
        # Peak memory under 15 MB
        self.assertLess(peak_mem / (1024 * 1024), 15.0, f"Peak memory exceeded limit: {peak_mem / (1024 * 1024):.2f} MB")
        self.assertGreater(approved_count, 0)
        self.assertGreater(blocked_count, 0)


if __name__ == "__main__":
    unittest.main()
