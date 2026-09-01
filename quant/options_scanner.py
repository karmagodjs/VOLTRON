import os
from datetime import date, timedelta

from dotenv import load_dotenv

from alpaca.data.historical.option import OptionHistoricalDataClient
from alpaca.data.requests import OptionChainRequest
from alpaca.data.enums import OptionsFeed

load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

option_client = OptionHistoricalDataClient(
    API_KEY,
    SECRET_KEY
)


def get_option_chain(symbol="SPY"):

    request = OptionChainRequest(
        underlying_symbol=symbol,
        feed=OptionsFeed.INDICATIVE
    )

    return option_client.get_option_chain(request)