import os
import unittest
from unittest.mock import patch, MagicMock

from agent.analyst import create_analysis


class TestAISafetyFailures(unittest.TestCase):

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


if __name__ == "__main__":
    unittest.main()
