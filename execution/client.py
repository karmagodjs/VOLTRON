import os

from dotenv import load_dotenv
from alpaca.trading.client import TradingClient


load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")


if not API_KEY or not SECRET_KEY:
    raise RuntimeError(
        "ALPACA_API_KEY or ALPACA_SECRET_KEY is missing"
    )


trading_client = TradingClient(
    API_KEY,
    SECRET_KEY,
    paper=True
)


def get_account():
    return trading_client.get_account()