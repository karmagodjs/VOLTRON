import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

load_dotenv()

def _get_market_alpaca_credentials():
    api_key = os.getenv("ALPACA_API_KEY") or os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("ALPACA_SECRET_KEY") or os.getenv("APCA_API_SECRET_KEY")
    if api_key:
        api_key = api_key.strip().strip("'").strip('"')
    if secret_key:
        secret_key = secret_key.strip().strip("'").strip('"')
    return api_key, secret_key

API_KEY, SECRET_KEY = _get_market_alpaca_credentials()

client = None
if API_KEY and SECRET_KEY:
    try:
        client = StockHistoricalDataClient(API_KEY, SECRET_KEY)
    except Exception as e:
        print(f"[VOLTRON] StockHistoricalDataClient initialization warning: {e}")
        client = None


def get_stock_client():
    global client
    if client is None:
        key, sec = _get_market_alpaca_credentials()
        if key and sec:
            try:
                client = StockHistoricalDataClient(key, sec)
            except Exception:
                client = None
    return client


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