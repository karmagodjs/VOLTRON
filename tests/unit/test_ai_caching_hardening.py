import os
import time
import unittest
from unittest.mock import MagicMock, patch

from agent.analyst import (
    AI_CACHE_TTL,
    create_analysis,
    get_cached_analysis,
    is_rate_limited,
    reset_ai_cache,
    reset_rate_limit,
    store_cached_analysis,
)


class TestAICachingHardening(unittest.TestCase):
    def setUp(self):
        reset_rate_limit()
        reset_ai_cache()
        if "ANTIGRAVITY_SOURCE_METADATA" in os.environ and len(os.environ["ANTIGRAVITY_SOURCE_METADATA"]) > 30000:
            del os.environ["ANTIGRAVITY_SOURCE_METADATA"]
        self.mock_env = patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_gemini_key", "OPENROUTER_API_KEY": ""})
        self.mock_env.start()

    def tearDown(self):
        try:
            self.mock_env.stop()
        except Exception:
            pass
        reset_rate_limit()
        reset_ai_cache()

    def _mock_successful_gemini(self, mock_genai, json_payload=None):
        if json_payload is None:
            json_payload = (
                '{\n'
                '  "decision": "TRADE_CANDIDATE",\n'
                '  "thesis": "High volatility premium with favorable risk.",\n'
                '  "volatility_view": "EXPENSIVE",\n'
                '  "direction": "NEUTRAL",\n'
                '  "confidence": 85,\n'
                '  "key_reasons": ["IV/RV elevated at 1.45", "Defined risk setup"],\n'
                '  "risks": ["Earnings gap risk", "Regime shift"]\n'
                '}'
            )
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.text = json_payload
        mock_client.models.generate_content.return_value = mock_response
        mock_client.interactions = None
        mock_genai.Client.return_value = mock_client
        return mock_client

    @patch("agent.analyst.genai")
    def test_a_successful_gemini_response_is_cached(self, mock_genai):
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        self.assertIsNone(get_cached_analysis(market_data))

        result = create_analysis(market_data)
        self.assertEqual(result["status"], "COMPLETE")
        self.assertEqual(result["ai_status"], "LIVE")
        self.assertEqual(result["decision"], "TRADE_CANDIDATE")

        cached = get_cached_analysis(market_data)
        self.assertIsNotNone(cached)
        self.assertEqual(cached["status"], "CACHED")
        self.assertEqual(cached["ai_status"], "CACHED")
        self.assertEqual(cached["decision"], "TRADE_CANDIDATE")

    @patch("agent.analyst.genai")
    def test_b_second_identical_request_does_not_call_gemini(self, mock_genai):
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        res1 = create_analysis(market_data)
        self.assertEqual(res1["status"], "COMPLETE")
        self.assertEqual(res1["ai_status"], "LIVE")
        self.assertEqual(mock_genai.Client.call_count, 1)

        mock_genai.Client.reset_mock()
        res2 = create_analysis(market_data)
        self.assertEqual(res2["status"], "CACHED")
        self.assertEqual(res2["ai_status"], "CACHED")
        self.assertEqual(res2["decision"], res1["decision"])
        mock_genai.Client.assert_not_called()

    @patch("agent.analyst.genai")
    def test_c_cache_expires_after_ttl_and_gemini_is_called_again(self, mock_genai):
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        start_time = 1000000.0
        with patch("agent.analyst.time.time", return_value=start_time):
            res1 = create_analysis(market_data)
            self.assertEqual(res1["status"], "COMPLETE")
            self.assertEqual(mock_genai.Client.call_count, 1)

        with patch("agent.analyst.time.time", return_value=start_time + 179.0):
            mock_genai.Client.reset_mock()
            res_cached = create_analysis(market_data)
            self.assertEqual(res_cached["status"], "CACHED")
            mock_genai.Client.assert_not_called()

        with patch("agent.analyst.time.time", return_value=start_time + 181.0):
            mock_genai.Client.reset_mock()
            res_fresh = create_analysis(market_data)
            self.assertEqual(res_fresh["status"], "COMPLETE")
            self.assertEqual(res_fresh["ai_status"], "LIVE")
            self.assertEqual(mock_genai.Client.call_count, 1)

    @patch("agent.analyst.get_openrouter_api_key", return_value=None)
    @patch("agent.analyst.genai")
    def test_d_rate_limited_responses_are_not_cached(self, mock_genai, mock_or_key):
        mock_genai.Client.side_effect = Exception("429 Quota exceeded: ResourceExhausted")
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}

        res = create_analysis(market_data)
        self.assertEqual(res["status"], "RATE_LIMITED")
        self.assertEqual(res["ai_status"], "RATE_LIMITED")
        self.assertTrue(is_rate_limited())

        self.assertIsNone(get_cached_analysis(market_data))

        store_cached_analysis(market_data, res)
        self.assertIsNone(get_cached_analysis(market_data))

        reset_ai_cache()
        with patch("agent.analyst.get_openrouter_api_key", return_value="test-or-key"), \
             patch("agent.analyst.call_openrouter_fallback", return_value=None):
            res_failed_fb = create_analysis(market_data)
            self.assertEqual(res_failed_fb["status"], "RATE_LIMITED")
            self.assertIsNone(get_cached_analysis(market_data))
            store_cached_analysis(market_data, res_failed_fb)
            self.assertIsNone(get_cached_analysis(market_data))

    @patch("agent.analyst.genai")
    def test_e_generic_error_responses_are_not_cached(self, mock_genai):
        mock_genai.Client.side_effect = RuntimeError("Service Unavailable 500")
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}

        res = create_analysis(market_data)
        self.assertEqual(res["status"], "ERROR")
        self.assertEqual(res["ai_status"], "ERROR")

        self.assertIsNone(get_cached_analysis(market_data))

        store_cached_analysis(market_data, res)
        self.assertIsNone(get_cached_analysis(market_data))

    @patch("agent.analyst.genai")
    def test_f_missing_market_data_fails_closed_without_calling_gemini_or_caching(self, mock_genai):
        empty_data = {}
        res = create_analysis(empty_data)
        self.assertEqual(res["decision"], "NO_TRADE")
        self.assertEqual(res["confidence"], 0)
        self.assertEqual(res["status"], "NO_TRADE")
        mock_genai.Client.assert_not_called()
        self.assertIsNone(get_cached_analysis(empty_data))

        incomplete_data = {"symbol": "SPY", "iv": None, "rv": None}
        res2 = create_analysis(incomplete_data)
        self.assertEqual(res2["decision"], "NO_TRADE")
        mock_genai.Client.assert_not_called()
        self.assertIsNone(get_cached_analysis(incomplete_data))

    @patch("agent.analyst.get_openrouter_api_key", return_value=None)
    @patch("agent.analyst.genai")
    def test_g_active_cooldown_prevents_api_calls_and_returns_rate_limited(self, mock_genai, mock_or_key):
        import agent.analyst as analyst_mod
        analyst_mod._rate_limit_until = time.time() + 60.0
        self.assertTrue(is_rate_limited())

        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}
        res = create_analysis(market_data)
        self.assertEqual(res["decision"], "NO_TRADE")
        self.assertEqual(res["status"], "RATE_LIMITED")
        self.assertEqual(res["ai_status"], "RATE_LIMITED")
        mock_genai.Client.assert_not_called()

        mock_fb_resp = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 80,
            "volatility_view": "EXPENSIVE",
            "direction": "NEUTRAL",
            "thesis": "Fallback analysis during cooldown",
            "key_reasons": ["Vol spike"],
            "risks": ["Tail risk"],
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "ai_provider": "OPENROUTER",
        }
        with patch("agent.analyst.get_openrouter_api_key", return_value="dummy_key"), \
             patch("agent.analyst.call_openrouter_fallback", return_value=mock_fb_resp) as mock_fb:
            res_fb = create_analysis({"symbol": "QQQ", "iv": 25.0, "rv": 15.0})
            self.assertEqual(res_fb["decision"], "TRADE_CANDIDATE")
            self.assertEqual(res_fb["status"], "COMPLETE")
            self.assertEqual(res_fb["ai_provider"], "OPENROUTER")
            mock_fb.assert_called_once()
            mock_genai.Client.assert_not_called()

    @patch("agent.analyst.genai")
    def test_h_cache_returns_cached_labels(self, mock_genai):
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "NVDA", "iv": 45.0, "rv": 35.0, "price": 120.0}

        first_resp = create_analysis(market_data)
        self.assertEqual(first_resp["status"], "COMPLETE")
        self.assertEqual(first_resp["ai_status"], "LIVE")

        second_resp = create_analysis(market_data)
        self.assertEqual(second_resp["status"], "CACHED")
        self.assertEqual(second_resp["ai_status"], "CACHED")
        self.assertEqual(second_resp["thesis"], first_resp["thesis"])

    @patch("agent.analyst.genai")
    def test_i_different_symbols_or_metrics_create_distinct_cache_entries(self, mock_genai):
        self._mock_successful_gemini(mock_genai)

        spy_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}
        qqq_data = {"symbol": "QQQ", "iv": 20.0, "rv": 12.0, "price": 500.0}
        spy_high_iv = {"symbol": "SPY", "iv": 40.0, "rv": 12.0, "price": 500.0}

        create_analysis(spy_data)
        self.assertEqual(mock_genai.Client.call_count, 1)

        mock_genai.Client.reset_mock()
        create_analysis(qqq_data)
        self.assertEqual(mock_genai.Client.call_count, 1)

        mock_genai.Client.reset_mock()
        create_analysis(spy_high_iv)
        self.assertEqual(mock_genai.Client.call_count, 1)

        mock_genai.Client.reset_mock()
        spy_cached = create_analysis(spy_data)
        self.assertEqual(spy_cached["status"], "CACHED")
        self.assertEqual(spy_cached["ai_status"], "CACHED")
        mock_genai.Client.assert_not_called()


if __name__ == "__main__":
    unittest.main()
