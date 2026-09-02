import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();
  const expiration = searchParams.get("expiration");

  const asset = SUPPORTED_ASSETS[symbol];
  if (!asset) {
    return NextResponse.json(
      {
        error: "OPTIONS_DATA_UNAVAILABLE",
        message: `Options data for '${symbol}' is unavailable. Supported underlyings: ${Object.keys(SUPPORTED_ASSETS).join(", ")}`,
        symbol,
      },
      { status: 404 }
    );
  }

  const spot = asset.price;
  const change = asset.change;
  const changePct = asset.change_percent;
  const iv = asset.implied_volatility;
  const rv = asset.realized_volatility;
  const ivRvRatio = asset.iv_rv_ratio;
  const ivPremium = asset.iv_premium;
  const oppScore = asset.opportunity_score;
  const volSignal = asset.vol_signal;

  const expirations = [
    { date: "2026-09-04", label: "04 SEP 2026", dte: 2, iv: Number((iv * 0.95).toFixed(2)) },
    { date: "2026-09-11", label: "11 SEP 2026", dte: 9, iv: Number((iv * 0.97).toFixed(2)) },
    { date: "2026-09-25", label: "25 SEP 2026", dte: 23, iv: Number((iv * 0.99).toFixed(2)) },
    { date: "2026-10-17", label: "17 OCT 2026", dte: 45, iv: Number(iv.toFixed(2)) },
    { date: "2026-11-20", label: "20 NOV 2026", dte: 79, iv: Number((iv * 1.04).toFixed(2)) },
    { date: "2026-12-18", label: "18 DEC 2026", dte: 107, iv: Number((iv * 1.08).toFixed(2)) },
  ];

  const selectedExpObj = expirations.find((e) => e.date === expiration) || expirations[3];
  const activeExp = selectedExpObj.date;
  const dte = selectedExpObj.dte;
  const expIv = selectedExpObj.iv;

  // Generate strike step based on underlying price magnitude ($1 for cheap, $5 for mid, $10 for high)
  const strikeStep = spot > 300 ? 5 : spot > 100 ? 2.5 : 1;
  const baseStrike = Math.round(spot / strikeStep) * strikeStep;
  const strikes = Array.from({ length: 15 }).map((_, i) => Number((baseStrike + (i - 7) * strikeStep).toFixed(2)));

  const chain = strikes.map((strike) => {
    const isAtm = Math.abs(strike - spot) <= strikeStep / 2;
    const diff = spot - strike;

    // Call Greeks & Pricing
    const callIv = Number((expIv + (strike - spot) * 0.02).toFixed(2));
    const callDelta = Number(Math.max(0.01, Math.min(0.99, 0.5 + (diff / (spot * 0.1)) * 0.45)).toFixed(3));
    const callGamma = Number((0.028 * Math.exp(-Math.pow(diff / (spot * 0.05), 2))).toFixed(4));
    const callTheta = Number((-0.038 - Math.abs(diff / (spot * 0.15)) * 0.01).toFixed(3));
    const callVega = Number((0.185 * Math.exp(-Math.pow(diff / (spot * 0.08), 2))).toFixed(3));

    const intrinsicCall = Math.max(0, spot - strike);
    const timeValCall = Math.max(0.15, +(Math.max(0.2, spot * 0.01) * Math.exp(-Math.pow(diff / (spot * 0.08), 2))).toFixed(2));
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
    const timeValPut = Math.max(0.15, +(Math.max(0.2, spot * 0.01) * Math.exp(-Math.pow(diff / (spot * 0.08), 2))).toFixed(2));
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
        contract: `${symbol}${activeExp.replace(/-/g, "").slice(2)}C${String(Math.round(strike * 1000)).padStart(8, "0")}`,
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
        contract: `${symbol}${activeExp.replace(/-/g, "").slice(2)}P${String(Math.round(strike * 1000)).padStart(8, "0")}`,
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

  const spreadWidth = strikeStep * 2;
  const netCredit = Number((spreadWidth * 0.37).toFixed(2));
  const maxProfit = Number((netCredit * 100).toFixed(2));
  const maxLoss = Number(((spreadWidth - netCredit) * 100).toFixed(2));

  const strategy = {
    name: asset.strategy.replace(/_/g, " "),
    symbol,
    expiration: activeExp,
    dte,
    sentiment: asset.strategy.includes("BULL") ? "BULLISH" : asset.strategy.includes("BEAR") ? "BEARISH" : "NEUTRAL",
    volatility_view: volSignal,
    iv_rv_ratio: ivRvRatio,
    confidence: oppScore >= 70 ? 88 : 45,
    legs: [
      { action: "SELL", type: "PUT", strike: baseStrike - strikeStep * 2, bid: 2.15, ask: 2.25, mid: 2.20, iv: Number((iv * 1.05).toFixed(1)), delta: -0.22 },
      { action: "BUY", type: "PUT", strike: baseStrike - strikeStep * 3, bid: 1.20, ask: 1.30, mid: 1.25, iv: Number((iv * 1.08).toFixed(1)), delta: -0.12 },
      { action: "SELL", type: "CALL", strike: baseStrike + strikeStep * 2, bid: 2.05, ask: 2.15, mid: 2.10, iv: Number((iv * 0.98).toFixed(1)), delta: 0.20 },
      { action: "BUY", type: "CALL", strike: baseStrike + strikeStep * 3, bid: 1.15, ask: 1.25, mid: 1.20, iv: Number((iv * 0.95).toFixed(1)), delta: 0.11 },
    ],
    net_credit: netCredit,
    max_profit: maxProfit,
    max_loss: maxLoss,
    breakeven_lower: Number((baseStrike - strikeStep * 2 - netCredit).toFixed(2)),
    breakeven_upper: Number((baseStrike + strikeStep * 2 + netCredit).toFixed(2)),
    capital_required: spreadWidth * 100,
    risk_reward_ratio: Number((maxProfit / maxLoss).toFixed(2)),
    rationale: `Elevated variance risk premium (IV/RV ${ivRvRatio.toFixed(2)}x) on ${symbol} creates rich defined-risk credit opportunities.`,
  };

  const payoffPoints = Array.from({ length: 41 }).map((_, i) => {
    const range = strikeStep * 8;
    const p = Number((spot - range + (i * range * 2) / 40).toFixed(2));
    let pnl = 0;
    const lowWing = baseStrike - strikeStep * 3;
    const lowShort = baseStrike - strikeStep * 2;
    const highShort = baseStrike + strikeStep * 2;
    const highWing = baseStrike + strikeStep * 3;

    if (p <= lowWing) pnl = -maxLoss;
    else if (p > lowWing && p < lowShort) pnl = -maxLoss + ((p - lowWing) / (lowShort - lowWing)) * (maxProfit + maxLoss);
    else if (p >= lowShort && p <= highShort) pnl = maxProfit;
    else if (p > highShort && p < highWing) pnl = maxProfit - ((p - highShort) / (highWing - highShort)) * (maxProfit + maxLoss);
    else pnl = -maxLoss;

    return {
      price: p,
      pnl: Number(pnl.toFixed(2)),
      is_spot: Math.abs(p - spot) < (range / 20),
    };
  });

  return NextResponse.json({
    symbol,
    name: asset.name,
    spot_price: spot,
    change,
    change_percent: changePct,
    market_status: "OPEN",
    implied_volatility: iv,
    realized_volatility: rv,
    iv_rv_ratio: ivRvRatio,
    iv_premium: ivPremium,
    opportunity_score: oppScore,
    vol_signal: volSignal,
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

