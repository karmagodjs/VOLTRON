import unittest
import numpy as np
import pandas as pd
import math

from quant.volatility import calculate_realized_volatility, calculate_log_returns
from quant.alpha import calculate_iv_rv_ratio, calculate_iv_premium
from quant.scanner import calculate_opportunity_score
from quant.atm_selector import find_atm_contracts
from quant.strategy_selector import select_strategy
from quant.risk_reward import credit_spread_metrics, debit_spread_metrics


class DummySnapshot:
    def __init__(self, iv, greeks, quote):
        self.implied_volatility = iv
        self.greeks = greeks
        self.latest_quote = quote


class TestQuantPipeline(unittest.TestCase):

    def test_calculate_log_returns(self):
        prices = pd.Series([100.0, 102.0, 101.0, 104.0])
        returns = calculate_log_returns(prices)
        self.assertEqual(len(returns), 3)
        self.assertAlmostEqual(returns.iloc[0], math.log(102.0 / 100.0))

    def test_calculate_realized_volatility(self):
        # 30 constant prices -> 0 volatility
        prices = pd.Series([100.0] * 30)
        rv = calculate_realized_volatility(prices)
        self.assertEqual(rv, 0.0)

        # Fluctuating prices -> positive annualized volatility
        prices = pd.Series([100.0 + (i % 3) * 2.0 for i in range(30)])
        rv = calculate_realized_volatility(prices)
        self.assertGreater(rv, 0.0)

    def test_calculate_iv_rv_ratio(self):
        # IV = 0.20, RV = 0.10 -> ratio = 2.0
        ratio = calculate_iv_rv_ratio(0.20, 0.10)
        self.assertEqual(ratio, 2.0)

        # RV = 0 -> ratio = None (safe division)
        ratio_zero = calculate_iv_rv_ratio(0.20, 0.0)
        self.assertIsNone(ratio_zero)

    def test_calculate_iv_premium(self):
        # IV = 0.25, RV = 0.15 -> premium = (0.25 - 0.15)/0.15
        prem = calculate_iv_premium(0.25, 0.15)
        self.assertAlmostEqual(prem, 0.10 / 0.15)

    def test_calculate_opportunity_score(self):
        # High IV/RV ratio (1.65) and premium (0.45) -> score >= 70
        score = calculate_opportunity_score(
            iv_rv_ratio=1.65,
            iv_premium=0.45
        )
        self.assertGreaterEqual(score, 70)
        self.assertLessEqual(score, 100)

    def test_find_atm_contracts(self):
        chain = {
            "SPY260918C00580000": DummySnapshot(iv=0.18, greeks={"delta": 0.50}, quote={"bid": 2.0, "ask": 2.1}),
            "SPY260918P00580000": DummySnapshot(iv=None, greeks=None, quote=None),
        }
        res = find_atm_contracts(chain, 580.0)
        self.assertEqual(len(res), 1)
        self.assertEqual(res[0][0], "SPY260918C00580000")

    def test_strategy_selector_all_regimes(self):
        # 1. High IV + Neutral -> Iron Condor
        res1 = select_strategy({
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 1.55,
            "direction": "NEUTRAL"
        })
        self.assertEqual(res1, "IRON_CONDOR")

        # 2. High IV + Bullish -> Bull Put Spread
        res2 = select_strategy({
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 1.55,
            "direction": "BULLISH"
        })
        self.assertEqual(res2, "BULL_PUT_SPREAD")

        # 3. High IV + Bearish -> Bear Call Spread
        res3 = select_strategy({
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 1.55,
            "direction": "BEARISH"
        })
        self.assertEqual(res3, "BEAR_CALL_SPREAD")

        # 4. Low IV + Neutral -> Long Straddle
        res4 = select_strategy({
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "opportunity_score": 85,
            "iv_rv_ratio": 0.75,
            "direction": "NEUTRAL"
        })
        self.assertEqual(res4, "LONG_STRADDLE")

    def test_credit_spread_risk_reward(self):
        # 5-wide credit spread collected $1.50 credit
        metrics = credit_spread_metrics(spread_width=5.0, credit_received=1.50)
        self.assertEqual(metrics["max_profit"], 1.50)
        self.assertEqual(metrics["max_loss"], 3.50)
        self.assertAlmostEqual(metrics["reward_risk"], 1.50 / 3.50)


if __name__ == "__main__":
    unittest.main()
