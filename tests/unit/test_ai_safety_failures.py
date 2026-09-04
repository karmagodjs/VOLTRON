import os
import unittest
from unittest.mock import patch, MagicMock

from agent.analyst import create_analysis


class TestAISafetyFailures(unittest.TestCase):

    def setUp(self):
        from agent.analyst import reset_rate_limit, reset_ai_cache
        reset_rate_limit()
        reset_ai_cache()

    def tearDown(self):
        from agent.analyst import reset_rate_limit, reset_ai_cache
        reset_rate_limit()
        reset_ai_cache()

    def test_ai_empty_market_data_fallback(self):
        result = create_analysis({})
        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)

    def test_ai_missing_gemini_api_key(self):
        with patch.dict(os.environ, {"GEMINI_API_KEY": ""}):
            result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})
            self.assertEqual(result["decision"], "NO_TRADE")
            self.assertEqual(result["confidence"], 0)

    @patch("agent.analyst.genai")
    def test_ai_api_timeout_exception(self, mock_genai):
        # Mock Gemini client raising a TimeoutError
        mock_genai.Client.side_effect = TimeoutError("Gemini gRPC Timeout")
        result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})
        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)

    @patch("agent.analyst.genai")
    def test_ai_malformed_json_response(self, mock_genai):
        # Mock Gemini returning invalid JSON
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = "This is not valid JSON {decision: INVALID}"
        mock_client.models.generate_content.return_value = mock_response
        mock_genai.Client.return_value = mock_client

        result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})
        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)

    def test_ai_incomplete_greeks_and_prices(self):
        # Incomplete data must not produce hallucinations
        result = create_analysis({"symbol": "SPY", "iv": None, "rv": None})
        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)

    @patch("agent.analyst.genai")
    def test_ai_rate_limited_429_structured_response(self, mock_genai):
        from agent.analyst import reset_rate_limit, is_rate_limited
        reset_rate_limit()

        # Mock Gemini raising a 429 RESOURCE_EXHAUSTED RateLimitError
        error_msg = "Error code: 429 - {'error': {'message': 'Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests, limit: 20\\nPlease retry in 45.0s.', 'code': 'too_many_requests', 'details': [{'@type': 'type.googleapis.com/google.rpc.RetryInfo', 'retryDelay': '45s'}]}}"
        mock_genai.Client.side_effect = Exception(error_msg)

        result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})

        # Verify exact Requirement 6 structure
        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)
        self.assertEqual(result["status"], "RATE_LIMITED")
        self.assertEqual(result["ai_status"], "RATE_LIMITED")
        self.assertEqual(result["thesis"], "Gemini analysis temporarily unavailable due to API quota.")
        self.assertEqual(result["key_reasons"], [])
        self.assertEqual(result["risks"], ["GEMINI_RATE_LIMITED"])

        # Verify rate limit cooldown is active
        self.assertTrue(is_rate_limited())

        # Test subsequent call during cooldown: Gemini API must NOT be called again
        mock_genai.Client.reset_mock()
        second_result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})
        self.assertEqual(second_result["status"], "RATE_LIMITED")
        self.assertEqual(second_result["confidence"], 0)
        mock_genai.Client.assert_not_called()

        # Clean up
        reset_rate_limit()


class TestVoltronServiceAICaching(unittest.TestCase):

    def setUp(self):
        from agent.analyst import reset_rate_limit, reset_ai_cache
        reset_rate_limit()
        reset_ai_cache()
        from backend.service import VoltronService
        self.service = VoltronService()
        self.service.stock_data_client = MagicMock()
        self.service.option_data_client = MagicMock()

    def tearDown(self):
        from agent.analyst import reset_rate_limit, reset_ai_cache
        reset_rate_limit()
        reset_ai_cache()

    @patch("backend.service.VoltronService.get_market_data")
    @patch("backend.service.create_analysis")
    def test_deterministic_ai_caching(self, mock_create_analysis, mock_get_market_data):
        mock_get_market_data.return_value = {
            "symbol": "SPY",
            "price": 585.20,
            "rv": 12.4,
            "iv": 16.2,
            "iv_rv_ratio": 1.31,
            "iv_premium": 30.6,
            "opportunity_score": 85,
            "market_regime": "NORMAL VOLATILITY",
            "vol_signal": "FAIR",
        }

        mock_create_analysis.return_value = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 85,
            "direction": "NEUTRAL",
            "volatility_view": "FAIR",
            "thesis": "Statistical edge present.",
            "key_reasons": ["IV/RV elevated"],
            "risks": ["Tail risk"],
            "status": "COMPLETE",
            "ai_status": "LIVE",
        }

        # First call: must invoke create_analysis
        res1 = self.service.get_ai_analysis("SPY")
        self.assertEqual(res1["decision"], "TRADE_CANDIDATE")
        self.assertEqual(res1["confidence"], 85)
        self.assertEqual(res1["ai_status"], "LIVE")
        self.assertEqual(mock_create_analysis.call_count, 1)

        # Second call immediately after: must hit cache and NOT invoke create_analysis
        res2 = self.service.get_ai_analysis("SPY")
        self.assertEqual(res2["decision"], "TRADE_CANDIDATE")
        self.assertEqual(res2["confidence"], 85)
        self.assertEqual(res2["ai_status"], "CACHED")
        self.assertTrue(res2["is_cached"])
        self.assertEqual(mock_create_analysis.call_count, 1)

        # Third call: sub-dollar price noise ($585.35 maps to same $585.00 bucket)
        mock_get_market_data.return_value["price"] = 585.35
        res3 = self.service.get_ai_analysis("SPY")
        self.assertEqual(res3["ai_status"], "CACHED")
        self.assertEqual(mock_create_analysis.call_count, 1)

    @patch("backend.service.VoltronService.get_market_data")
    @patch("backend.service.create_analysis")
    def test_ai_rate_limited_structured_response(self, mock_create_analysis, mock_get_market_data):
        mock_get_market_data.return_value = {
            "symbol": "SPY",
            "price": 585.0,
            "rv": 12.0,
            "iv": 16.0,
            "iv_rv_ratio": 1.33,
            "iv_premium": 33.3,
            "opportunity_score": 85,
            "market_regime": "NORMAL VOLATILITY",
            "vol_signal": "FAIR",
        }

        mock_create_analysis.return_value = {
            "decision": "NO_TRADE",
            "confidence": 0,
            "status": "RATE_LIMITED",
            "ai_status": "RATE_LIMITED",
            "thesis": "Gemini analysis temporarily unavailable due to API quota.",
            "key_reasons": [],
            "risks": ["GEMINI_RATE_LIMITED"],
        }

        res = self.service.get_ai_analysis("SPY")
        self.assertEqual(res["decision"], "NO_TRADE")
        self.assertEqual(res["confidence"], 0)
        self.assertEqual(res["status"], "RATE_LIMITED")
        self.assertEqual(res["ai_status"], "RATE_LIMITED")
        self.assertEqual(res["thesis"], "Gemini analysis temporarily unavailable due to API quota.")
        self.assertEqual(res["key_reasons"], [])
        self.assertEqual(res["risks"], ["GEMINI_RATE_LIMITED"])

        # Check get_agent_state pipeline reflects rate limiting
        with patch.object(self.service, "get_risk_status") as mock_risk, \
             patch.object(self.service, "get_account_summary") as mock_acc:
            mock_risk.return_value = {"overall_status": "APPROVED", "gates": []}
            mock_acc.return_value = {"equity": 100000.0, "portfolio_value": 100000.0}

            state = self.service.get_agent_state("SPY")
            self.assertEqual(state["ai_status"], "RATE_LIMITED")
            analyze_stage = next(s for s in state["pipeline"] if s["stage"] == "ANALYZE")
            self.assertEqual(analyze_stage["status"], "RATE_LIMITED")
            self.assertIn("Confidence: 0%", analyze_stage["reason"])


if __name__ == "__main__":
    unittest.main()
