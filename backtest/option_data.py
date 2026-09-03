import os
from datetime import datetime, timedelta, timezone

from dotenv import load_dotenv

from alpaca.data.historical.option import OptionHistoricalDataClient
from alpaca.data.requests import OptionBarsRequest
from alpaca.data.timeframe import TimeFrame

load_dotenv()

def _get_backtest_alpaca_credentials():
    api_key = os.getenv("ALPACA_API_KEY") or os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("ALPACA_SECRET_KEY") or os.getenv("APCA_API_SECRET_KEY")
    if api_key:
        api_key = api_key.strip().strip("'").strip('"')
    if secret_key:
        secret_key = secret_key.strip().strip("'").strip('"')
    return api_key, secret_key

API_KEY, SECRET_KEY = _get_backtest_alpaca_credentials()

client = None
if API_KEY and SECRET_KEY:
    try:
        client = OptionHistoricalDataClient(API_KEY, SECRET_KEY)
    except Exception as e:
        print(f"[VOLTRON] OptionHistoricalDataClient initialization warning: {e}")
        client = None


def get_option_client():
    global client
    if client is None:
        key, sec = _get_backtest_alpaca_credentials()
        if key and sec:
            try:
                client = OptionHistoricalDataClient(key, sec)
            except Exception:
                client = None
    return client


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