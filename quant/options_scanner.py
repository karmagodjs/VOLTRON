import os
from datetime import date, timedelta

from dotenv import load_dotenv

from alpaca.data.historical.option import OptionHistoricalDataClient
from alpaca.data.requests import OptionChainRequest
from alpaca.data.enums import OptionsFeed

# Load .env for local development (safe no-op in production if file is absent)
load_dotenv()

def _get_alpaca_credentials():
    api_key = os.getenv("ALPACA_API_KEY") or os.getenv("APCA_API_KEY_ID")
    secret_key = os.getenv("ALPACA_SECRET_KEY") or os.getenv("APCA_API_SECRET_KEY")
    if api_key:
        api_key = api_key.strip().strip("'").strip('"')
    if secret_key:
        secret_key = secret_key.strip().strip("'").strip('"')
    return api_key, secret_key

API_KEY, SECRET_KEY = _get_alpaca_credentials()

option_client = None
if API_KEY and SECRET_KEY:
    try:
        option_client = OptionHistoricalDataClient(API_KEY, SECRET_KEY)
    except Exception as e:
        print(f"[VOLTRON] OptionHistoricalDataClient initialization warning: {e}")
        option_client = None


def get_option_client():
    global option_client
    if option_client is None:
        key, sec = _get_alpaca_credentials()
        if key and sec:
            try:
                option_client = OptionHistoricalDataClient(key, sec)
            except Exception as e:
                print(f"[VOLTRON] OptionHistoricalDataClient initialization warning: {e}")
                option_client = None
    return option_client


def get_option_chain(symbol="SPY"):
    client = get_option_client()
    if not client:
        raise ValueError("Alpaca credentials missing (ALPACA_API_KEY / ALPACA_SECRET_KEY)")

    request = OptionChainRequest(
        underlying_symbol=symbol,
        feed=OptionsFeed.INDICATIVE
    )

    return client.get_option_chain(request)