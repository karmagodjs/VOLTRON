import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();
  const expiration = searchParams.get("expiration");

  const spot = symbol === "SPY" ? 591.42 : symbol === "QQQ" ? 498.75 : symbol === "IWM" ? 222.18 : 128.40;
  const expirations = ["2026-09-04", "2026-09-11", "2026-09-25", "2026-10-17", "2026-11-20"];
  const active_exp = expiration || expirations[3];
  
  const baseStrike = Math.round(spot / 5) * 5;
  const strikes = Array.from({ length: 9 }).map((_, i) => baseStrike + (i - 4) * 5);

  const chain = strikes.map((strike) => {
    const is_atm = Math.abs(strike - spot) <= 3;
    const callDiff = spot - strike;
    const putDiff = strike - spot;
    const callMid = Math.max(0.15, +(callDiff + 5.2).toFixed(2));
    const putMid = Math.max(0.15, +(putDiff + 5.1).toFixed(2));

    return {
      strike,
      is_atm,
      call: {
        contract: `${symbol}261017C${strike}`,
        bid: +(callMid - 0.05).toFixed(2),
        ask: +(callMid + 0.05).toFixed(2),
        last: callMid,
        iv: 16.8,
        delta: +(0.5 + (spot - strike) * 0.015).toFixed(3),
        gamma: 0.024,
        theta: -0.045,
        vega: 0.185,
        volume: 2450,
        open_interest: 18400,
      },
      put: {
        contract: `${symbol}261017P${strike}`,
        bid: +(putMid - 0.05).toFixed(2),
        ask: +(putMid + 0.05).toFixed(2),
        last: putMid,
        iv: 17.5,
        delta: +(-0.5 + (spot - strike) * 0.015).toFixed(3),
        gamma: 0.024,
        theta: -0.042,
        vega: 0.182,
        volume: 3100,
        open_interest: 22100,
      },
    };
  });

  return NextResponse.json({
    symbol,
    spot_price: spot,
    expirations,
    selected_expiration: active_exp,
    days_to_expiration: 45,
    chain,
  });
}
