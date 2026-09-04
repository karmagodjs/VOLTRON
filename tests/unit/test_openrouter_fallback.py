import json
import os
import unittest
from unittest.mock import patch, MagicMock

from agent.analyst import (
    create_analysis,
    call_openrouter_fallback,
    get_openrouter_api_key,
    reset_rate_limit,
    reset_ai_cache,
    is_rate_limited,
)


class TestOpenRouterFallback(unittest.TestCase):

    def setUp(self):
        reset_rate_limit()
        reset_ai_cache()

    def tearDown(self):
        reset_rate_limit()
        reset_ai_cache()

    @patch("agent.analyst.call_openrouter_fallback")
    @patch("agent.analyst.genai")
    def test_gemini_success_openrouter_not_called(self, mock_genai, mock_openrouter):
        mock_client = MagicMock()
        del mock_client.interactions
        mock_response = MagicMock()
        mock_response.text = json.dumps({
            "decision": "TRADE_CANDIDATE",
            "confidence": 88,
            "volatility_view": "EXPENSIVE",
            "direction": "NEUTRAL",
            "thesis": "Gemini primary analysis edge.",
            "key_reasons": ["High IV/RV"],
            "risks": ["Earnings risk"],
        })
        mock_client.models.generate_content.return_value = mock_response
        mock_genai.Client.return_value = mock_client

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 18.0, "rv": 12.0})

        self.assertEqual(result["decision"], "TRADE_CANDIDATE")
        self.assertEqual(result["confidence"], 88)
        self.assertEqual(result["ai_provider"], "GEMINI")
        self.assertEqual(result["status"], "COMPLETE")
        mock_openrouter.assert_not_called()

    @patch("agent.analyst.call_openrouter_fallback")
    @patch("agent.analyst.genai")
    def test_gemini_429_openrouter_called(self, mock_genai, mock_openrouter):
        mock_genai.Client.side_effect = Exception("429 Too Many Requests - quota exceeded")
        mock_openrouter.return_value = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 82,
            "volatility_view": "EXPENSIVE",
            "direction": "NEUTRAL",
            "thesis": "OpenRouter fallback edge identified.",
            "key_reasons": ["Vol rich"],
            "risks": ["Regime shift"],
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "ai_provider": "OPENROUTER",
        }

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})

        self.assertEqual(result["decision"], "TRADE_CANDIDATE")
        self.assertEqual(result["confidence"], 82)
        self.assertEqual(result["ai_provider"], "OPENROUTER")
        mock_openrouter.assert_called_once()

    @patch("agent.analyst.call_openrouter_fallback")
    @patch("agent.analyst.genai")
    def test_gemini_quota_error_openrouter_called(self, mock_genai, mock_openrouter):
        quota_err = "ResourceExhausted: 429 Quota exceeded for metric: generativelanguage.googleapis.com/generate_content_free_tier_requests"
        mock_genai.Client.side_effect = Exception(quota_err)
        mock_openrouter.return_value = {
            "decision": "TRADE_CANDIDATE",
            "confidence": 78,
            "volatility_view": "CHEAP",
            "direction": "BULLISH",
            "thesis": "OpenRouter quota fallback response.",
            "key_reasons": ["Positive drift"],
            "risks": ["Low gamma"],
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "ai_provider": "OPENROUTER",
        }

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 14.0, "rv": 22.0})

        self.assertEqual(result["decision"], "TRADE_CANDIDATE")
        self.assertEqual(result["ai_provider"], "OPENROUTER")
        mock_openrouter.assert_called_once()

    @patch("agent.analyst.requests.post")
    @patch("agent.analyst.genai")
    def test_openrouter_success_normalized_analysis(self, mock_genai, mock_post):
        mock_genai.Client.side_effect = Exception("429 rate limit exceeded")

        raw_content = """```json
{
    "decision": "TRADE_CANDIDATE",
    "confidence": 85,
    "volatility_view": "EXPENSIVE",
    "direction": "NEUTRAL",
    "thesis": "OpenRouter normalized JSON candidate.",
    "key_reasons": ["IV/RV elevated", "Mean-reversion expected"],
    "risks": ["Tail event"]
}
```"""
        mock_resp = MagicMock()
        mock_resp.status_code = 200
        mock_resp.json.return_value = {
            "choices": [
                {"message": {"content": raw_content}}
            ]
        }
        mock_post.return_value = mock_resp

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 22.0, "rv": 14.0})

        self.assertEqual(result["decision"], "TRADE_CANDIDATE")
        self.assertEqual(result["confidence"], 85)
        self.assertEqual(result["volatility_view"], "EXPENSIVE")
        self.assertEqual(result["direction"], "NEUTRAL")
        self.assertEqual(result["thesis"], "OpenRouter normalized JSON candidate.")
        self.assertEqual(result["key_reasons"], ["IV/RV elevated", "Mean-reversion expected"])
        self.assertEqual(result["risks"], ["Tail event"])
        self.assertEqual(result["status"], "COMPLETE")
        self.assertEqual(result["ai_status"], "LIVE")
        self.assertEqual(result["ai_provider"], "OPENROUTER")

        called_url = mock_post.call_args[0][0]
        self.assertEqual(called_url, "https://openrouter.ai/api/v1/chat/completions")
        called_payload = mock_post.call_args[1]["json"]
        self.assertEqual(called_payload["model"], "openrouter/free")

    @patch("agent.analyst.requests.post")
    @patch("agent.analyst.genai")
    def test_openrouter_failure_returns_no_trade(self, mock_genai, mock_post):
        mock_genai.Client.side_effect = Exception("429 rate limit exceeded")

        import requests
        mock_post.side_effect = requests.Timeout("OpenRouter timeout")

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 22.0, "rv": 14.0})

        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)
        self.assertEqual(result["status"], "RATE_LIMITED")
        self.assertEqual(result["ai_status"], "RATE_LIMITED")

    @patch("agent.analyst.genai")
    def test_missing_openrouter_api_key_gemini_behavior_unchanged(self, mock_genai):
        mock_genai.Client.side_effect = Exception("429 rate limit exceeded")

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": ""}):
            result = create_analysis({"symbol": "SPY", "iv": 22.0, "rv": 14.0})

        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["confidence"], 0)
        self.assertEqual(result["status"], "RATE_LIMITED")
        self.assertEqual(result["ai_provider"], "GEMINI")
        self.assertTrue(is_rate_limited())

    @patch("agent.analyst.call_openrouter_fallback")
    @patch("agent.analyst.genai")
    def test_gemini_temporary_unavailable_openrouter_called(self, mock_genai, mock_openrouter):
        mock_genai.Client.side_effect = Exception("503 Service Unavailable: server overloaded")
        mock_openrouter.return_value = {
            "decision": "NO_TRADE",
            "confidence": 0,
            "volatility_view": "FAIR",
            "direction": "NEUTRAL",
            "thesis": "OpenRouter: data insufficient.",
            "key_reasons": [],
            "risks": [],
            "status": "COMPLETE",
            "ai_status": "LIVE",
            "ai_provider": "OPENROUTER",
        }

        with patch.dict(os.environ, {"GEMINI_API_KEY": "fake_gemini", "OPENROUTER_API_KEY": "fake_or"}):
            result = create_analysis({"symbol": "SPY", "iv": 20.0, "rv": 12.0})

        self.assertEqual(result["decision"], "NO_TRADE")
        self.assertEqual(result["ai_provider"], "OPENROUTER")
        mock_openrouter.assert_called_once()

    def test_trading_remains_disabled_and_no_order_submission(self):
        from execution.executor import PaperExecutor, is_trading_enabled

        with patch.dict(os.environ, {"VOLTRON_TRADING_ENABLED": "false"}):
            self.assertFalse(is_trading_enabled())

            mock_risk_engine = MagicMock()
            mock_risk_engine.check_order_size.return_value = (True, "OK")
            mock_risk_engine.evaluate.return_value = (True, "APPROVED")
            mock_risk_engine.check_liquidity.return_value = (True, "LIQUIDITY_OK")

            executor = PaperExecutor(mock_risk_engine)

            fake_order = {
                "symbol": "SPY",
                "qty": 1,
                "legs": [
                    {"symbol": "SPY250321P00550000", "side": "BUY", "ratio_qty": 1},
                    {"symbol": "SPY250321P00555000", "side": "SELL", "ratio_qty": 1},
                ],
            }

            mock_alpaca_client = MagicMock()
            with patch("execution.executor.get_trading_client", return_value=mock_alpaca_client):
                result = executor.submit_option_order(
                    order=fake_order,
                    max_loss=250.0,
                    opportunity_score=85.0,
                    proposed_exposure=250.0,
                    spread_percent=2.0,
                )

            self.assertFalse(result.get("submitted", False))
            self.assertEqual(result.get("execution_mode"), "SAFETY_BLOCKED")
            self.assertEqual(result.get("safety_gate"), "VOLTRON_TRADING_ENABLED=false")
            mock_alpaca_client.submit_order.assert_not_called()
