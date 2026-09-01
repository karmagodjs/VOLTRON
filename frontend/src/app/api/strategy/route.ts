import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const strategy = (searchParams.get("strategy") || "IRON_CONDOR").toUpperCase();
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  const spot = symbol === "SPY" ? 591.42 : symbol === "QQQ" ? 498.75 : symbol === "IWM" ? 222.18 : 128.40;

  const legs = [
    { action: "BUY", type: "PUT", strike: Math.round(spot - 15), price: 1.25, iv: 18.2, delta: -0.12 },
    { action: "SELL", type: "PUT", strike: Math.round(spot - 10), price: 2.20, iv: 17.5, delta: -0.22 },
    { action: "SELL", type: "CALL", strike: Math.round(spot + 10), price: 2.10, iv: 16.8, delta: 0.20 },
    { action: "BUY", type: "CALL", strike: Math.round(spot + 15), price: 1.20, iv: 16.2, delta: 0.11 },
  ];

  const payoff_curve = Array.from({ length: 41 }).map((_, i) => {
    const p = +(spot * 0.90 + i * (spot * 0.20 / 40)).toFixed(2);
    let pnl = 0;
    if (p <= spot - 15) pnl = -315;
    else if (p > spot - 15 && p < spot - 10) pnl = -315 + (p - (spot - 15)) * 100;
    else if (p >= spot - 10 && p <= spot + 10) pnl = 185;
    else if (p > spot + 10 && p < spot + 15) pnl = 185 - (p - (spot + 10)) * 100;
    else pnl = -315;

    return {
      price: p,
      pnl: +pnl.toFixed(2),
      is_spot: Math.abs(p - spot) < (spot * 0.20 / 80),
    };
  });

  return NextResponse.json({
    strategy,
    symbol,
    sentiment: "NEUTRAL",
    spot_price: spot,
    legs,
    max_profit: 185.0,
    max_loss: 315.0,
    breakeven_lower: +(spot - 10 - 1.85).toFixed(2),
    breakeven_upper: +(spot + 10 + 1.85).toFixed(2),
    win_probability: 78.4,
    capital_required: 500.0,
    risk_reward_ratio: 0.59,
    payoff_curve,
  });
}
