import unittest
from unittest.mock import MagicMock, patch
from alpaca.data.requests import OptionChainRequest
from backend.service import VoltronService


class TestOptionsServerSideFiltering(unittest.TestCase):
    """
    Tests for server-side options filtering to protect Render Free 512 MB RAM limit:
    A. OptionChainRequest contains expiration_date, strike_price_gte, strike_price_lte.
    B. Full unfiltered OptionChainRequest is never used by production get_options_chain().
    C. Options response > 500 contracts fails closed.
    D. Cache stores only formatted bounded result, never raw snapshots.
    E. get_market_data() does not trigger an unfiltered options request.
    F. VOLTRON_TRADING_ENABLED remains false.
    """

    def setUp(self):
        self.service = VoltronService()
        self.service._chain_cache = {}
        self.service._market_cache = {}
        self.service._expirations_cache = {}

    def test_a_option_chain_request_contains_filters(self):
        """A. OptionChainRequest contains expiration_date, strike_price_gte, strike_price_lte."""
        captured_requests = []

        def mock_get_option_chain(req):
            captured_requests.append(req)
            return {}

        self.service.option_data_client = MagicMock()
        self.service.option_data_client.get_option_chain.side_effect = mock_get_option_chain

        with patch.object(self.service, "get_market_data") as mock_mkt, \
             patch.object(self.service, "_discover_candidate_expirations") as mock_exps:
            mock_mkt.return_value = {"price": 600.0, "change": 0.0, "change_percent": 0.0}
            mock_exps.return_value = ["2026-09-18", "2026-09-25"]

            self.service.get_options_chain("SPY")

            self.assertEqual(len(captured_requests), 1)
            req = captured_requests[0]
            self.assertIsInstance(req, OptionChainRequest)
            self.assertIsNotNone(req.expiration_date)
            self.assertEqual(str(req.expiration_date), "2026-09-18")
            self.assertIsNotNone(req.strike_price_gte)
            self.assertIsNotNone(req.strike_price_lte)
            # Strike range +-8% of 600.0 is 552.0 to 648.0
            self.assertAlmostEqual(req.strike_price_gte, 552.0, places=1)
            self.assertAlmostEqual(req.strike_price_lte, 648.0, places=1)

    def test_b_unfiltered_option_chain_request_never_used(self):
        """B. Full unfiltered OptionChainRequest is never used by production get_options_chain()."""
        captured_requests = []

        def mock_get_option_chain(req):
            captured_requests.append(req)
            return {}

        self.service.option_data_client = MagicMock()
        self.service.option_data_client.get_option_chain.side_effect = mock_get_option_chain

        with patch.object(self.service, "get_market_data") as mock_mkt, \
             patch.object(self.service, "_discover_candidate_expirations") as mock_exps:
            mock_mkt.return_value = {"price": 500.0, "change": 0.0, "change_percent": 0.0}
            mock_exps.return_value = ["2026-09-18"]

            # Test default call
            self.service.get_options_chain("SPY")
            # Test with explicit expiration
            self.service.get_options_chain("SPY", expiration="2026-10-16")

            for req in captured_requests:
                # Must NEVER be an unfiltered request
                self.assertIsNotNone(req.expiration_date, "OptionChainRequest missing expiration_date filter!")
                self.assertIsNotNone(req.strike_price_gte, "OptionChainRequest missing strike_price_gte filter!")
                self.assertIsNotNone(req.strike_price_lte, "OptionChainRequest missing strike_price_lte filter!")

    def test_c_options_response_over_500_fails_closed(self):
        """C. Options response > 500 contracts fails closed with controlled error."""
        # Create a mock chain with 501 contracts
        huge_chain = {f"SPY260918C00{500 + i}000": MagicMock() for i in range(501)}

        self.service.option_data_client = MagicMock()
        self.service.option_data_client.get_option_chain.return_value = huge_chain

        with patch.object(self.service, "get_market_data") as mock_mkt, \
             patch.object(self.service, "_discover_candidate_expirations") as mock_exps:
            mock_mkt.return_value = {"price": 600.0, "change": 0.0, "change_percent": 0.0}
            mock_exps.return_value = ["2026-09-18"]

            res = self.service.get_options_chain("SPY")

            self.assertEqual(res.get("error"), "OPTIONS_CHAIN_TOO_LARGE")
            self.assertEqual(res.get("chain"), [])
            self.assertEqual(len(self.service._chain_cache), 0, "Huge response must never be cached!")

    def test_d_cache_stores_only_formatted_bounded_result(self):
        """D. Cache stores only formatted bounded result and never raw Alpaca snapshots."""
        mock_snapshot = MagicMock()
        mock_quote = MagicMock()
        mock_quote.bid_price = 5.0
        mock_quote.ask_price = 5.5
        mock_snapshot.latest_quote = mock_quote
        mock_snapshot.implied_volatility = 0.25
        mock_snapshot.volume = 100
        mock_snapshot.open_interest = 500

        mock_chain = {"SPY260918C00600000": mock_snapshot}

        self.service.option_data_client = MagicMock()
        self.service.option_data_client.get_option_chain.return_value = mock_chain

        with patch.object(self.service, "get_market_data") as mock_mkt, \
             patch.object(self.service, "_discover_candidate_expirations") as mock_exps:
            mock_mkt.return_value = {"price": 600.0, "change": 0.0, "change_percent": 0.0}
            mock_exps.return_value = ["2026-09-18"]

            res = self.service.get_options_chain("SPY")

            # Check cache content
            self.assertIn("SPY_default", self.service._chain_cache)
            cached_data = self.service._chain_cache["SPY_default"]

            # Must contain structured result dict, not raw snapshots
            self.assertIn("chain", cached_data)
            self.assertIn("expirations", cached_data)
            self.assertIn("selected_expiration", cached_data)
            self.assertEqual(cached_data["symbol"], "SPY")

            for row in cached_data["chain"]:
                self.assertIsInstance(row, dict)
                self.assertIsInstance(row["call"], dict)
                # Raw snapshot should NOT be in cached dict
                self.assertNotIsInstance(row["call"], MagicMock)

    def test_e_get_market_data_does_not_trigger_unfiltered_options_request(self):
        """E. get_market_data() does not trigger an unfiltered options request."""
        captured_requests = []

        def mock_get_option_chain(req):
            captured_requests.append(req)
            return {}

        self.service.option_data_client = MagicMock()
        self.service.option_data_client.get_option_chain.side_effect = mock_get_option_chain

        with patch.object(self.service, "stock_data_client") as mock_stock, \
             patch.object(self.service, "_discover_candidate_expirations") as mock_exps, \
             patch.object(self.service, "get_market_clock") as mock_clock:

            # Mock stock daily bars and latest trade
            mock_stock.get_stock_bars.return_value = MagicMock()
            mock_stock.get_stock_latest_trade.return_value = {"SPY": MagicMock(price=600.0)}
            mock_exps.return_value = ["2026-09-18"]
            mock_clock.return_value = {"market_status": "OPEN", "is_open": True}

            self.service.get_market_data("SPY", timeframe="1D")

            if captured_requests:
                for req in captured_requests:
                    self.assertIsNotNone(req.expiration_date, "ATM scan triggered unfiltered request!")
                    self.assertIsNotNone(req.strike_price_gte, "ATM scan missing strike_price_gte!")
                    self.assertIsNotNone(req.strike_price_lte, "ATM scan missing strike_price_lte!")

    def test_f_trading_safety_invariant(self):
        """F. VOLTRON_TRADING_ENABLED must strictly remain false."""
        import os
        from backend.main import voltron_service
        self.assertFalse(os.getenv("VOLTRON_TRADING_ENABLED", "false").lower() in ("true", "1"))
        self.assertFalse(getattr(voltron_service, "trading_enabled", False))


if __name__ == "__main__":
    unittest.main()
