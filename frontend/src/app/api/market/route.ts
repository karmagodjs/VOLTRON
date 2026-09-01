import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  const price = symbol === "SPY" ? 591.42 : symbol === "QQQ" ? 498.75 : symbol === "IWM" ? 222.18 : symbol === "NVDA" ? 128.40 : 228.60;
  const rv = symbol === "NVDA" ? 34.5 : symbol === "IWM" ? 16.2 : symbol === "QQQ" ? 13.85 : 10.42;
  const iv = symbol === "NVDA" ? 48.2 : symbol === "IWM" ? 23.5 : symbol === "QQQ" ? 20.4 : 16.85;
  const iv_rv = +(iv / rv).toFixed(2);
  const premium = +(((iv - rv) / rv) * 100).toFixed(1);
  const score = Math.min(98, Math.max(45, Math.round(iv_rv * 58)));

  const history = Array.from({ length: 30 }).map((_, i) => ({
    date: `Aug ${i + 1}`,
    price: +(price * 0.96 + (i / 29) * (price * 0.04) + Math.sin(i * 0.7) * 2.5).toFixed(2),
    rv: +(rv * 0.92 + (i / 29) * (rv * 0.08) + Math.cos(i * 0.5) * 0.4).toFixed(2),
    iv: +(iv * 0.94 + (i / 29) * (iv * 0.06) + Math.sin(i * 0.6) * 0.8).toFixed(2),
    iv_rv: +(iv_rv * 0.95 + (i / 29) * (iv_rv * 0.05)).toFixed(2),
    volume: Math.floor(52000000 + Math.sin(i) * 10000000),
  }));

  return NextResponse.json({
    symbol,
    name: symbol === "SPY" ? "SPDR S&P 500 ETF Trust" : symbol === "QQQ" ? "Invesco QQQ Trust" : `${symbol} Asset`,
    price,
    change: 4.82,
    change_percent: 0.82,
    high: +(price + 1.25).toFixed(2),
    low: +(price - 3.40).toFixed(2),
    volume: 64230100,
    realized_volatility: rv,
    implied_volatility: iv,
    iv_rv_ratio: iv_rv,
    iv_premium: premium,
    opportunity_score: score,
    market_regime: iv_rv >= 1.4 ? "HIGH IV SPREAD" : "NORMAL VOLATILITY",
    vol_signal: iv_rv >= 1.4 ? "IV EXPENSIVE" : iv_rv <= 0.85 ? "IV CHEAP" : "IV FAIR",
    market_status: "OPEN",
    last_updated: new Date().toISOString(),
    history,
  });
}
