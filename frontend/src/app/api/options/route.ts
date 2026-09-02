import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();
  const expiration = searchParams.get("expiration");

  const isSPY = symbol === "SPY";
  const spot = isSPY ? 591.42 : symbol === "QQQ" ? 498.75 : symbol === "IWM" ? 222.18 : 128.40;
  const change = isSPY ? 4.82 : 2.15;
  const changePct = isSPY ? 0.82 : 0.54;
  const iv = isSPY ? 16.85 : 22.40;
  const rv = isSPY ? 10.42 : 14.80;
  const ivRvRatio = Number((iv / rv).toFixed(2));
  const ivPremium = Number((((iv - rv) / rv) * 100).toFixed(1));
  const oppScore = isSPY ? 94 : 82;

  const expirations = [
    { date: "2026-09-04", label: "04 SEP 2026", dte: 2, iv: 15.2 },
    { date: "2026-09-11", label: "11 SEP 2026", dte: 9, iv: 15.8 },
    { date: "2026-09-25", label: "25 SEP 2026", dte: 23, iv: 16.4 },
    { date: "2026-10-17", label: "17 OCT 2026", dte: 45, iv: 16.85 },
    { date: "2026-11-20", label: "20 NOV 2026", dte: 79, iv: 17.5 },
    { date: "2026-12-18", label: "18 DEC 2026", dte: 107, iv: 18.2 },
  ];

  const selectedExpObj = expirations.find((e) => e.date === expiration) || expirations[3];
  const activeExp = selectedExpObj.date;
  const dte = selectedExpObj.dte;
  const expIv = selectedExpObj.iv;

  const baseStrike = Math.round(spot / 5) * 5;
  const strikes = Array.from({ length: 15 }).map((_, i) => baseStrike + (i - 7) * 5);

  const chain = strikes.map((strike) => {
    const isAtm = Math.abs(strike - spot) <= 2.5;
    const moneyness = spot / strike;
    const diff = spot - strike;

    // Call Greeks & Pricing
    const callIv = Number((expIv + (strike - spot) * 0.02).toFixed(2));
    const callDelta = Number(Math.max(0.01, Math.min(0.99, 0.5 + (diff / 25) * 0.45)).toFixed(3));
    const callGamma = Number((0.028 * Math.exp(-Math.pow(diff / 20, 2))).toFixed(4));
    const callTheta = Number((-0.038 - Math.abs(diff / 50) * 0.01).toFixed(3));
    const callVega = Number((0.185 * Math.exp(-Math.pow(diff / 30, 2))).toFixed(3));

    const intrinsicCall = Math.max(0, spot - strike);
    const timeValCall = Math.max(0.15, +(5.4 * Math.exp(-Math.pow(diff / 35, 2))).toFixed(2));
    const callMid = Number((intrinsicCall + timeValCall).toFixed(2));
    const callBid = Math.max(0.01, Number((callMid - 0.05).toFixed(2)));
    const callAsk = Number((callMid + 0.05).toFixed(2));
    const callSpreadPct = Number((((callAsk - callBid) / callMid) * 100).toFixed(2));

    // Put Greeks & Pricing
    const putIv = Number((expIv - (strike - spot) * 0.03).toFixed(2));
    const putDelta = Number((callDelta - 1.0).toFixed(3));
    const putGamma = callGamma;
    const putTheta = Number((callTheta + 0.005).toFixed(3));
    const putVega = callVega;

    const intrinsicPut = Math.max(0, strike - spot);
    const timeValPut = Math.max(0.15, +(5.2 * Math.exp(-Math.pow(diff / 35, 2))).toFixed(2));
    const putMid = Number((intrinsicPut + timeValPut).toFixed(2));
    const putBid = Math.max(0.01, Number((putMid - 0.05).toFixed(2)));
    const putAsk = Number((putMid + 0.05).toFixed(2));
    const putSpreadPct = Number((((putAsk - putBid) / putMid) * 100).toFixed(2));

    const distFromAtm = Math.abs(strike - spot);
    const vol = Math.max(120, Math.floor(4500 - distFromAtm * 80));
    const oi = Math.max(800, Math.floor(28000 - distFromAtm * 350));

    return {
      strike,
      is_atm: isAtm,
      call: {
        contract: `${symbol}${activeExp.replace(/-/g, "").slice(2)}C${String(strike * 1000).padStart(8, "0")}`,
        type: "CALL",
        strike,
        expiration: activeExp,
        bid: callBid,
        ask: callAsk,
        last: callMid,
        mid: callMid,
        spread: Number((callAsk - callBid).toFixed(2)),
        spread_percent: callSpreadPct,
        iv: callIv,
        delta: callDelta,
        gamma: callGamma,
        theta: callTheta,
        vega: callVega,
        volume: vol,
        open_interest: oi,
        liquidity_status: callSpreadPct <= 5.0 ? "LIQUID" : callSpreadPct <= 10.0 ? "ACCEPTABLE" : "WIDE SPREAD",
      },
      put: {
        contract: `${symbol}${activeExp.replace(/-/g, "").slice(2)}P${String(strike * 1000).padStart(8, "0")}`,
        type: "PUT",
        strike,
        expiration: activeExp,
        bid: putBid,
        ask: putAsk,
        last: putMid,
        mid: putMid,
        spread: Number((putAsk - putBid).toFixed(2)),
        spread_percent: putSpreadPct,
        iv: putIv,
        delta: putDelta,
        gamma: putGamma,
        theta: putTheta,
        vega: putVega,
        volume: Math.floor(vol * 1.15),
        open_interest: Math.floor(oi * 1.2),
        liquidity_status: putSpreadPct <= 5.0 ? "LIQUID" : putSpreadPct <= 10.0 ? "ACCEPTABLE" : "WIDE SPREAD",
      },
    };
  });

  const termStructure = expirations.map((e) => ({
    date: e.label,
    dte: e.dte,
    iv: e.iv,
  }));

  const strategy = {
    name: "IRON CONDOR",
    symbol,
    expiration: activeExp,
    dte,
    sentiment: "NEUTRAL",
    volatility_view: "EXPENSIVE",
    iv_rv_ratio: ivRvRatio,
    confidence: 88,
    legs: [
      { action: "SELL", type: "PUT", strike: baseStrike - 10, bid: 2.15, ask: 2.25, mid: 2.20, iv: 17.5, delta: -0.22 },
      { action: "BUY", type: "PUT", strike: baseStrike - 15, bid: 1.20, ask: 1.30, mid: 1.25, iv: 18.2, delta: -0.12 },
      { action: "SELL", type: "CALL", strike: baseStrike + 10, bid: 2.05, ask: 2.15, mid: 2.10, iv: 16.8, delta: 0.20 },
      { action: "BUY", type: "CALL", strike: baseStrike + 15, bid: 1.15, ask: 1.25, mid: 1.20, iv: 16.2, delta: 0.11 },
    ],
    net_credit: 1.85,
    max_profit: 185.0,
    max_loss: 315.0,
    breakeven_lower: Number((baseStrike - 10 - 1.85).toFixed(2)),
    breakeven_upper: Number((baseStrike + 10 + 1.85).toFixed(2)),
    capital_required: 500.0,
    risk_reward_ratio: 0.59,
    rationale: "Elevated variance risk premium (IV/RV 1.62x) combined with low realized drift makes Iron Condor optimal for defined-risk credit harvesting.",
  };

  const payoffPoints = Array.from({ length: 41 }).map((_, i) => {
    const p = Number((spot - 30 + i * 1.5).toFixed(2));
    let pnl = 0;
    if (p <= baseStrike - 15) pnl = -315;
    else if (p > baseStrike - 15 && p < baseStrike - 10) pnl = -315 + (p - (baseStrike - 15)) * 100;
    else if (p >= baseStrike - 10 && p <= baseStrike + 10) pnl = 185;
    else if (p > baseStrike + 10 && p < baseStrike + 15) pnl = 185 - (p - (baseStrike + 10)) * 100;
    else pnl = -315;

    return {
      price: p,
      pnl: Number(pnl.toFixed(2)),
      is_spot: Math.abs(p - spot) < 0.8,
    };
  });

  return NextResponse.json({
    symbol,
    spot_price: spot,
    change,
    change_percent: changePct,
    market_status: "OPEN",
    implied_volatility: iv,
    realized_volatility: rv,
    iv_rv_ratio: ivRvRatio,
    iv_premium: ivPremium,
    opportunity_score: oppScore,
    vol_signal: "IV EXPENSIVE",
    expirations: expirations.map((e) => e.date),
    expiration_labels: expirations,
    selected_expiration: activeExp,
    days_to_expiration: dte,
    term_structure: termStructure,
    chain,
    strategy,
    payoff_curve: payoffPoints,
  });
}
