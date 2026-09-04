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
        self.mock_env = patch.dict(os.environ, {"GEMINI_API_KEY": "fake_test_gemini_key"})
        self.mock_env.start()

    def tearDown(self):
        self.mock_env.stop()
        reset_rate_limit()
        reset_ai_cache()

    def _mock_successful_gemini(self, mock_genai, json_payload=None):
        """Helper to configure mock genai client to return valid JSON analysis."""
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
        """Test A: Successful Gemini response is cached."""
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        # Cache should initially be empty
        self.assertIsNone(get_cached_analysis(market_data))

        result = create_analysis(market_data)
        self.assertEqual(result["status"], "COMPLETE")
        self.assertEqual(result["ai_status"], "LIVE")
        self.assertEqual(result["decision"], "TRADE_CANDIDATE")

        # Cache should now contain the valid analysis
        cached = get_cached_analysis(market_data)
        self.assertIsNotNone(cached)
        self.assertEqual(cached["status"], "CACHED")
        self.assertEqual(cached["ai_status"], "CACHED")
        self.assertEqual(cached["decision"], "TRADE_CANDIDATE")

    @patch("agent.analyst.genai")
    def test_b_second_identical_request_does_not_call_gemini(self, mock_genai):
        """Test B: Second identical request within 180s does NOT call Gemini."""
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        # First call hits Gemini
        res1 = create_analysis(market_data)
        self.assertEqual(res1["status"], "COMPLETE")
        self.assertEqual(res1["ai_status"], "LIVE")
        self.assertEqual(mock_genai.Client.call_count, 1)

        # Second identical call must hit cache without invoking genai.Client
        mock_genai.Client.reset_mock()
        res2 = create_analysis(market_data)
        self.assertEqual(res2["status"], "CACHED")
        self.assertEqual(res2["ai_status"], "CACHED")
        self.assertEqual(res2["decision"], res1["decision"])
        mock_genai.Client.assert_not_called()

    @patch("agent.analyst.genai")
    def test_c_cache_expires_after_ttl_and_gemini_is_called_again(self, mock_genai):
        """Test C: Cache expires after 180s and Gemini is called again."""
        self._mock_successful_gemini(mock_genai)
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}

        start_time = 1000000.0
        with patch("agent.analyst.time.time", return_value=start_time):
            res1 = create_analysis(market_data)
            self.assertEqual(res1["status"], "COMPLETE")
            self.assertEqual(mock_genai.Client.call_count, 1)

        # At 179s: still cached
        with patch("agent.analyst.time.time", return_value=start_time + 179.0):
            mock_genai.Client.reset_mock()
            res_cached = create_analysis(market_data)
            self.assertEqual(res_cached["status"], "CACHED")
            mock_genai.Client.assert_not_called()

        # At 181s: expired, calls Gemini again
        with patch("agent.analyst.time.time", return_value=start_time + 181.0):
            mock_genai.Client.reset_mock()
            res_fresh = create_analysis(market_data)
            self.assertEqual(res_fresh["status"], "COMPLETE")
            self.assertEqual(res_fresh["ai_status"], "LIVE")
            self.assertEqual(mock_genai.Client.call_count, 1)

    @patch("agent.analyst.genai")
    def test_d_rate_limited_responses_are_not_cached(self, mock_genai):
        """Test D: 429 / RATE_LIMITED responses are NOT cached."""
        mock_genai.Client.side_effect = Exception("429 Quota exceeded: ResourceExhausted")
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}

        res = create_analysis(market_data)
        self.assertEqual(res["status"], "RATE_LIMITED")
        self.assertEqual(res["ai_status"], "RATE_LIMITED")
        self.assertTrue(is_rate_limited())

        # Verify rate-limited failure was NOT stored in the cache
        self.assertIsNone(get_cached_analysis(market_data))

        # Explicitly verify store_cached_analysis rejects RATE_LIMITED
        store_cached_analysis(market_data, res)
        self.assertIsNone(get_cached_analysis(market_data))

    @patch("agent.analyst.genai")
    def test_e_generic_error_responses_are_not_cached(self, mock_genai):
        """Test E: Generic ERROR responses are NOT cached."""
        mock_genai.Client.side_effect = RuntimeError("Service Unavailable 500")
        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}

        res = create_analysis(market_data)
        self.assertEqual(res["status"], "ERROR")
        self.assertEqual(res["ai_status"], "ERROR")

        # Verify error was NOT stored in cache
        self.assertIsNone(get_cached_analysis(market_data))

        # Explicitly verify store_cached_analysis rejects ERROR
        store_cached_analysis(market_data, res)
        self.assertIsNone(get_cached_analysis(market_data))

    @patch("agent.analyst.genai")
    def test_f_missing_market_data_fails_closed_without_calling_gemini_or_caching(self, mock_genai):
        """Test F: Missing market data fails closed immediately without calling Gemini or caching."""
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

    @patch("agent.analyst.genai")
    def test_g_active_cooldown_prevents_api_calls_and_returns_rate_limited(self, mock_genai):
        """Test G: Active cooldown prevents API calls and returns RATE_LIMITED fail-closed."""
        # Force active cooldown
        import agent.analyst as analyst_mod
        analyst_mod._rate_limit_until = time.time() + 60.0
        self.assertTrue(is_rate_limited())

        market_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0}
        res = create_analysis(market_data)
        self.assertEqual(res["decision"], "NO_TRADE")
        self.assertEqual(res["status"], "RATE_LIMITED")
        self.assertEqual(res["ai_status"], "RATE_LIMITED")
        mock_genai.Client.assert_not_called()

    @patch("agent.analyst.genai")
    def test_h_cache_returns_cached_labels(self, mock_genai):
        """Test H: Cache returns ai_status='CACHED' and status='CACHED'."""
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
        """Test I: Requests with different symbols or market metrics create distinct cache entries."""
        self._mock_successful_gemini(mock_genai)

        spy_data = {"symbol": "SPY", "iv": 20.0, "rv": 12.0, "price": 500.0}
        qqq_data = {"symbol": "QQQ", "iv": 20.0, "rv": 12.0, "price": 500.0}
        spy_high_iv = {"symbol": "SPY", "iv": 40.0, "rv": 12.0, "price": 500.0}

        # Analyze SPY
        create_analysis(spy_data)
        self.assertEqual(mock_genai.Client.call_count, 1)

        # Analyze QQQ - must call Gemini because different symbol
        mock_genai.Client.reset_mock()
        create_analysis(qqq_data)
        self.assertEqual(mock_genai.Client.call_count, 1)

        # Analyze SPY with high IV - must call Gemini because different metric
        mock_genai.Client.reset_mock()
        create_analysis(spy_high_iv)
        self.assertEqual(mock_genai.Client.call_count, 1)

        # Re-request original SPY - must hit cache!
        mock_genai.Client.reset_mock()
        spy_cached = create_analysis(spy_data)
        self.assertEqual(spy_cached["status"], "CACHED")
        self.assertEqual(spy_cached["ai_status"], "CACHED")
        mock_genai.Client.assert_not_called()


if __name__ == "__main__":
    unittest.main()
