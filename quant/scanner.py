import math
import os
from datetime import datetime, timedelta, timezone

import numpy as np
import pandas as pd
from dotenv import load_dotenv
from scipy.optimize import brentq
from scipy.stats import norm

from alpaca.data.historical.stock import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame

from quant.volatility import calculate_realized_volatility
from quant.alpha import (
    calculate_iv_rv_ratio,
    calculate_iv_premium,
)
from quant.options_scanner import get_option_chain


load_dotenv()

API_KEY = os.getenv("ALPACA_API_KEY")
SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")

stock_client = StockHistoricalDataClient(
    API_KEY,
    SECRET_KEY
)


def _get_value(obj, key, default=None):
    if obj is None:
        return default

    if isinstance(obj, dict):
        return obj.get(key, default)

    return getattr(obj, key, default)


def get_stock_prices(symbol="SPY", days=90):
    """
    Get daily stock prices.

    Uses a 20-minute-old end time so we don't request
    recent SIP data on the free Alpaca plan.
    """

    end = datetime.now(timezone.utc) - timedelta(minutes=20)
    start = end - timedelta(days=days)

    request = StockBarsRequest(
        symbol_or_symbols=[symbol],
        timeframe=TimeFrame.Day,
        start=start,
        end=end,
    )

    response = stock_client.get_stock_bars(request)

    try:
        bars = response[symbol]
    except Exception:
        bars = []

    if not bars:
        return pd.Series(dtype=float)

    return pd.Series(
        [float(bar.close) for bar in bars]
    )


def parse_option_symbol(option_symbol):
    """
    Parse OCC option symbol.

    Example:
    SPY260903C00727000

    Returns:
        strike
        option_type
        expiration
    """

    try:
        strike = int(option_symbol[-8:]) / 1000.0

        option_type = option_symbol[-9]

        expiration_raw = option_symbol[-15:-9]

        expiration = datetime.strptime(
            expiration_raw,
            "%y%m%d"
        ).date()

        return (
            strike,
            option_type,
            expiration,
        )

    except Exception:
        return None


def black_scholes_price(
    stock_price,
    strike,
    time_to_expiry,
    risk_free_rate,
    volatility,
    option_type
):
    """
    Black-Scholes theoretical option price.
    """

    if time_to_expiry <= 0:
        if option_type == "C":
            return max(stock_price - strike, 0)

        return max(strike - stock_price, 0)

    if volatility <= 0:
        return 0.0

    sqrt_t = math.sqrt(time_to_expiry)

    d1 = (
        math.log(stock_price / strike)
        + (
            risk_free_rate
            + 0.5 * volatility ** 2
        ) * time_to_expiry
    ) / (volatility * sqrt_t)

    d2 = d1 - volatility * sqrt_t

    if option_type == "C":

        return (
            stock_price * norm.cdf(d1)
            - strike
            * math.exp(
                -risk_free_rate * time_to_expiry
            )
            * norm.cdf(d2)
        )

    return (
        strike
        * math.exp(
            -risk_free_rate * time_to_expiry
        )
        * norm.cdf(-d2)
        - stock_price * norm.cdf(-d1)
    )


def calculate_implied_volatility(
    option_price,
    stock_price,
    strike,
    time_to_expiry,
    option_type,
    risk_free_rate=0.04
):
    """
    Calculate IV from the option market price.

    Returns annualized implied volatility.
    """

    if option_price <= 0:
        return None

    if stock_price <= 0 or strike <= 0:
        return None

    if time_to_expiry <= 0:
        return None

    def objective(volatility):
        theoretical_price = black_scholes_price(
            stock_price=stock_price,
            strike=strike,
            time_to_expiry=time_to_expiry,
            risk_free_rate=risk_free_rate,
            volatility=volatility,
            option_type=option_type,
        )

        return theoretical_price - option_price

    try:
        low = 0.0001
        high = 5.0

        low_value = objective(low)
        high_value = objective(high)

        if low_value * high_value > 0:
            return None

        iv = brentq(
            objective,
            low,
            high,
            maxiter=100
        )

        return float(iv)

    except Exception:
        return None


def _find_atm_option(
    chain,
    stock_price
):
    """
    Find a liquid option close to ATM.

    Since free indicative data may not provide IV,
    IV is calculated from bid/ask midpoint.
    """

    candidates = []

    today = datetime.now(
        timezone.utc
    ).date()

    for option_symbol, snapshot in chain.items():

        parsed = parse_option_symbol(
            option_symbol
        )

        if parsed is None:
            continue

        strike, option_type, expiration = parsed

        # Ignore expired contracts.
        if expiration <= today:
            continue

        # Prefer calls for the initial volatility scan.
        if option_type != "C":
            continue

        quote = _get_value(
            snapshot,
            "latest_quote"
        )

        if quote is None:
            continue

        bid = _get_value(
            quote,
            "bid_price"
        )

        ask = _get_value(
            quote,
            "ask_price"
        )

        if bid is None or ask is None:
            continue

        try:
            bid = float(bid)
            ask = float(ask)
        except (TypeError, ValueError):
            continue

        if bid <= 0 or ask <= 0:
            continue

        if ask < bid:
            continue

        mid_price = (bid + ask) / 2.0

        # Avoid extremely wide spreads.
        spread_percent = (
            (ask - bid) / mid_price
        )

        if spread_percent > 0.20:
            continue

        days_to_expiry = (
            expiration - today
        ).days

        time_to_expiry = (
            days_to_expiry / 365.0
        )

        iv = calculate_implied_volatility(
            option_price=mid_price,
            stock_price=stock_price,
            strike=strike,
            time_to_expiry=time_to_expiry,
            option_type=option_type,
        )

        if iv is None:
            continue

        # Ignore unrealistic IV values.
        if iv <= 0.01 or iv > 5.0:
            continue

        distance = abs(
            strike - stock_price
        )

        candidates.append(
            {
                "symbol": option_symbol,
                "strike": strike,
                "option_type": option_type,
                "expiration": expiration,
                "bid": bid,
                "ask": ask,
                "mid": mid_price,
                "iv": iv,
                "spread_percent": spread_percent,
                "distance": distance,
            }
        )

    if not candidates:
        return None

    # First prefer closest-to-ATM contract.
    candidates.sort(
        key=lambda x: (
            x["distance"],
            x["spread_percent"]
        )
    )

    return candidates[0]


def calculate_opportunity_score(
    iv_rv_ratio,
    iv_premium
):
    """
    Convert volatility dislocation into
    a 0-100 opportunity score.
    """

    if (
        iv_rv_ratio is None
        or iv_premium is None
    ):
        return 0

    score = 50

    if iv_rv_ratio >= 1.50:
        score += 30

    elif iv_rv_ratio >= 1.30:
        score += 20

    elif iv_rv_ratio >= 1.15:
        score += 10

    elif iv_rv_ratio <= 0.70:
        score += 30

    elif iv_rv_ratio <= 0.80:
        score += 20

    elif iv_rv_ratio <= 0.90:
        score += 10

    if abs(iv_premium) >= 0.40:
        score += 15

    elif abs(iv_premium) >= 0.25:
        score += 10

    elif abs(iv_premium) >= 0.15:
        score += 5

    return min(score, 100)


def scan_symbol(symbol="SPY"):
    """
    Scan one underlying.
    """

    prices = get_stock_prices(symbol)

    if len(prices) < 21:
        print(
            f"[VOLTRON] Not enough price data for {symbol}"
        )
        return None

    realized_volatility = (
        calculate_realized_volatility(
            prices,
            window=20
        )
    )

    if realized_volatility <= 0:
        return None

    stock_price = float(
        prices.iloc[-1]
    )

    chain = get_option_chain(symbol)

    if not chain:
        print(
            f"[VOLTRON] Empty option chain for {symbol}"
        )
        return None

    atm_option = _find_atm_option(
        chain,
        stock_price
    )

    if atm_option is None:
        print(
            f"[VOLTRON] No usable ATM option for {symbol}"
        )
        return None

    implied_volatility = atm_option["iv"]

    iv_rv_ratio = calculate_iv_rv_ratio(
        implied_volatility,
        realized_volatility
    )

    iv_premium = calculate_iv_premium(
        implied_volatility,
        realized_volatility
    )

    opportunity_score = (
        calculate_opportunity_score(
            iv_rv_ratio,
            iv_premium
        )
    )

    if iv_rv_ratio >= 1.15:
        volatility_signal = "IV_EXPENSIVE"

    elif iv_rv_ratio <= 0.90:
        volatility_signal = "IV_CHEAP"

    else:
        volatility_signal = "NEUTRAL"

    return {
        "symbol": symbol,

        "underlying_price": stock_price,

        "option_symbol": atm_option["symbol"],
        "option_strike": atm_option["strike"],
        "option_type": atm_option["option_type"],
        "expiration": str(
            atm_option["expiration"]
        ),

        "bid": atm_option["bid"],
        "ask": atm_option["ask"],
        "mid_price": atm_option["mid"],

        "spread_percent": (
            atm_option["spread_percent"]
        ),

        "implied_volatility": (
            implied_volatility
        ),

        "realized_volatility": (
            realized_volatility
        ),

        "iv_rv_ratio": iv_rv_ratio,

        "iv_premium": iv_premium,

        "opportunity_score": (
            opportunity_score
        ),

        "volatility_signal": (
            volatility_signal
        ),

        # Conservative values for
        # the current risk-engine stage.
        "max_loss": 300.0,
        "proposed_exposure": 1000.0,

        "market_direction": "NEUTRAL",
    }


def scan():
    """
    Scan the configured universe.
    """

    symbols = [
        "SPY"
    ]

    opportunities = []

    for symbol in symbols:

        try:

            result = scan_symbol(
                symbol
            )

            if result is not None:
                opportunities.append(
                    result
                )

        except Exception as exc:

            print(
                f"[VOLTRON] Scanner error "
                f"for {symbol}: {exc}"
            )

    opportunities.sort(
        key=lambda x: x[
            "opportunity_score"
        ],
        reverse=True
    )

    return opportunities


if __name__ == "__main__":

    print("\n================================")
    print("      VOLTRON MARKET SCANNER")
    print("================================\n")

    results = scan()

    if not results:

        print(
            "\nNo opportunities found."
        )

    else:

        for opportunity in results:

            print(
                f"\nSymbol: "
                f"{opportunity['symbol']}"
            )

            print(
                f"Price: "
                f"${opportunity['underlying_price']:.2f}"
            )

            print(
                f"Option: "
                f"{opportunity['option_symbol']}"
            )

            print(
                f"Strike: "
                f"{opportunity['option_strike']:.2f}"
            )

            print(
                f"Expiration: "
                f"{opportunity['expiration']}"
            )

            print(
                f"Bid/Ask: "
                f"${opportunity['bid']:.2f} / "
                f"${opportunity['ask']:.2f}"
            )

            print(
                f"IV: "
                f"{opportunity['implied_volatility']:.2%}"
            )

            print(
                f"RV: "
                f"{opportunity['realized_volatility']:.2%}"
            )

            print(
                f"IV/RV: "
                f"{opportunity['iv_rv_ratio']:.2f}"
            )

            print(
                f"IV Premium: "
                f"{opportunity['iv_premium']:.2%}"
            )

            print(
                f"Opportunity Score: "
                f"{opportunity['opportunity_score']}"
            )

            print(
                f"Signal: "
                f"{opportunity['volatility_signal']}"
            )

            print(
                "\n================================"
            )
            print("        SCAN COMPLETE")
            print("================================")