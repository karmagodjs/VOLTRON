import unittest
from unittest.mock import MagicMock, patch
from backend.service import VoltronService


class TestMarketClock(unittest.TestCase):

    def setUp(self):
        self.service = VoltronService()
        self.service._clock_cache = {}

    def test_market_clock_closed(self):
        mock_clock = MagicMock()
        mock_clock.is_open = False
        mock_clock.next_open = "2026-09-04T09:30:00-04:00"
        mock_clock.next_close = "2026-09-04T16:00:00-04:00"

        with patch.object(self.service, "_ensure_clients"):
            self.service.trading_client = MagicMock()
            self.service.trading_client.get_clock.return_value = mock_clock

            clock = self.service.get_market_clock()
            self.assertFalse(clock["is_open"])
            self.assertEqual(clock["market_status"], "CLOSED")
            self.assertEqual(clock["source"], "ALPACA_CLOCK")

    def test_market_clock_open(self):
        mock_clock = MagicMock()
        mock_clock.is_open = True
        mock_clock.next_open = "2026-09-04T09:30:00-04:00"
        mock_clock.next_close = "2026-09-04T16:00:00-04:00"

        with patch.object(self.service, "_ensure_clients"):
            self.service.trading_client = MagicMock()
            self.service.trading_client.get_clock.return_value = mock_clock

            clock = self.service.get_market_clock()
            self.assertTrue(clock["is_open"])
            self.assertEqual(clock["market_status"], "OPEN")
            self.assertEqual(clock["source"], "ALPACA_CLOCK")

    def test_market_clock_fail_closed_unknown(self):
        with patch.object(self.service, "_ensure_clients"):
            self.service.trading_client = MagicMock()
            self.service.trading_client.get_clock.side_effect = Exception("Alpaca Gateway 503")

            with patch("urllib.request.urlopen", side_effect=Exception("Network Error")):
                clock = self.service.get_market_clock()
                self.assertFalse(clock["is_open"])
                self.assertEqual(clock["market_status"], "UNKNOWN")
                self.assertEqual(clock["source"], "UNAVAILABLE")

    def test_get_market_data_reflects_market_clock(self):
        with patch.object(self.service, "get_market_clock") as mock_get_clock:
            mock_get_clock.return_value = {
                "is_open": False,
                "market_status": "CLOSED",
                "next_open": "2026-09-04T09:30:00-04:00",
                "next_close": "2026-09-04T16:00:00-04:00",
                "source": "ALPACA_CLOCK",
            }

            self.service._market_cache = {}
            market_data = self.service.get_market_data("SPY")
            self.assertEqual(market_data["market_status"], "CLOSED")
            self.assertFalse(market_data["is_market_open"])
            self.assertEqual(market_data["market_clock"]["market_status"], "CLOSED")


if __name__ == "__main__":
    unittest.main()
