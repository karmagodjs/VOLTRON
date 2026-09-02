import unittest
from unittest.mock import patch, MagicMock

from execution.order_builder import build_option_buy_order
from execution.multileg import build_iron_condor
from execution.client import trading_client


class TestOptionsExecutionMLeg(unittest.TestCase):

    def test_build_option_buy_order(self):
        req = build_option_buy_order(
            symbol="SPY260918C00580000",
            quantity=1,
            limit_price=2.45
        )
        self.assertEqual(req.symbol, "SPY260918C00580000")
        self.assertEqual(req.qty, 1)
        self.assertEqual(req.limit_price, 2.45)

    def test_build_iron_condor_4_legs(self):
        req = build_iron_condor(
            long_put="SPY260918P00570000",
            short_put="SPY260918P00575000",
            short_call="SPY260918C00595000",
            long_call="SPY260918C00600000",
            quantity=1,
            limit_price=1.85
        )
        self.assertEqual(req.order_class, "mleg")
        self.assertEqual(len(req.legs), 4)
        self.assertEqual(req.limit_price, 1.85)

    def test_build_iron_condor_invalid_quantity(self):
        with self.assertRaises(ValueError):
            build_iron_condor(
                long_put="SPY260918P00570000",
                short_put="SPY260918P00575000",
                short_call="SPY260918C00595000",
                long_call="SPY260918C00600000",
                quantity=0,
                limit_price=1.85
            )

    def test_paper_only_domain_enforcement(self):
        if trading_client:
            raw_url = getattr(trading_client, "_base_url", "")
            base_url_str = str(getattr(raw_url, "value", raw_url))
            self.assertTrue("paper-api.alpaca.markets" in base_url_str or "paper" in base_url_str.lower())


if __name__ == "__main__":
    unittest.main()
