import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

client = StockHistoricalDataClient(
    API_KEY,
    SECRET_KEY
)


def get_daily_bars(symbol="SPY", days=60):

    now = datetime.now(timezone.utc)

    # Free Basic plan:
    # Keep the SIP historical query older than 15 minutes.
    end = now - timedelta(minutes=20)

    start = end - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start,
        end=end,
        feed="sip"
    )

    bars = client.get_stock_bars(request)

    return bars.df