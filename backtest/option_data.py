import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from alpaca.data.historical.option import OptionHistoricalDataClient
from alpaca.data.requests import OptionBarsRequest
from alpaca.data.timeframe import TimeFrame

load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

client = OptionHistoricalDataClient(
    API_KEY,
    SECRET_KEY
)


def get_option_bars(symbol, days=30):

    end = datetime.now(timezone.utc) - timedelta(minutes=20)
    start = end - timedelta(days=days)

    request = OptionBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start,
        end=end
    )

    return client.get_option_bars(request)


def get_option_history_dataframe(symbol, days=30):

    bars = get_option_bars(
        symbol=symbol,
        days=days
    )

    df = bars.df.copy()

    if df.empty:
        return df

    return df.reset_index()