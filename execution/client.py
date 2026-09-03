import os

from dotenv import load_dotenv
from alpaca.trading.client import TradingClient


load_dotenv()

def _get_exec_alpaca_credentials():
    api_key = os.getenv("ALPACA_API_KEY") or os.getenv("APCA_API_KEY_ID") or os.getenv("ALPACA_KEY")
    secret_key = os.getenv("ALPACA_SECRET_KEY") or os.getenv("APCA_API_SECRET_KEY") or os.getenv("ALPACA_SECRET")
    if api_key:
        api_key = api_key.strip().strip("'").strip('"')
    if secret_key:
        secret_key = secret_key.strip().strip("'").strip('"')
    return api_key, secret_key

API_KEY, SECRET_KEY = _get_exec_alpaca_credentials()

trading_client = None
if API_KEY and SECRET_KEY:
    try:
        trading_client = TradingClient(API_KEY, SECRET_KEY, paper=True)
    except Exception as e:
        print(f"[VOLTRON] TradingClient initialization warning: {e}")
        trading_client = None


def get_trading_client():
    global trading_client
    if trading_client is None:
        key, sec = _get_exec_alpaca_credentials()
        if key and sec:
            try:
                trading_client = TradingClient(key, sec, paper=True)
            except Exception:
                trading_client = None
    return trading_client


def get_account():
    client = get_trading_client() or trading_client
    if not client:
        raise RuntimeError("ALPACA_API_KEY or ALPACA_SECRET_KEY is missing")
    return client.get_account()