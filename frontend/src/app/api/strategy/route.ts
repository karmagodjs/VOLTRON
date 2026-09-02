import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const strategy = (searchParams.get("strategy") || "IRON_CONDOR").toUpperCase();
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  const asset = SUPPORTED_ASSETS[symbol] || SUPPORTED_ASSETS["SPY"];
  const spot = asset.price;
  const iv = asset.implied_volatility;

  const strikeStep = spot > 300 ? 5 : spot > 100 ? 2.5 : 1;
  const baseStrike = Math.round(spot / strikeStep) * strikeStep;

  let legs: any[] = [];
  let sentiment = "NEUTRAL";
  let maxProfit = 185.0;
  let maxLoss = 315.0;
  let lowerBe: number | null = null;
  let upperBe: number | null = null;
  let winProb = 78.4;
  let capitalRequired = strikeStep * 2 * 100;

  if (strategy === "BULL_PUT_SPREAD") {
    sentiment = "BULLISH";
    const netCredit = Number((strikeStep * 0.28).toFixed(2));
    maxProfit = Number((netCredit * 100).toFixed(2));
    maxLoss = Number(((strikeStep - netCredit) * 100).toFixed(2));
    lowerBe = Number((baseStrike - strikeStep - netCredit).toFixed(2));
    winProb = 81.2;
    capitalRequired = strikeStep * 100;
    legs = [
      { action: "BUY", type: "PUT", strike: baseStrike - strikeStep * 2, price: 1.25, iv: Number((iv * 1.05).toFixed(1)), delta: -0.12 },
      { action: "SELL", type: "PUT", strike: baseStrike - strikeStep, price: 2.20, iv: Number((iv * 1.02).toFixed(1)), delta: -0.22 },
    ];
  } else if (strategy === "BEAR_CALL_SPREAD") {
    sentiment = "BEARISH";
    const netCredit = Number((strikeStep * 0.26).toFixed(2));
    maxProfit = Number((netCredit * 100).toFixed(2));
    maxLoss = Number(((strikeStep - netCredit) * 100).toFixed(2));
    upperBe = Number((baseStrike + strikeStep + netCredit).toFixed(2));
    winProb = 79.5;
    capitalRequired = strikeStep * 100;
    legs = [
      { action: "SELL", type: "CALL", strike: baseStrike + strikeStep, price: 2.10, iv: Number((iv * 0.98).toFixed(1)), delta: 0.20 },
      { action: "BUY", type: "CALL", strike: baseStrike + strikeStep * 2, price: 1.20, iv: Number((iv * 0.95).toFixed(1)), delta: 0.11 },
    ];
  } else if (strategy === "BULL_CALL_SPREAD") {
    sentiment = "BULLISH";
    const netDebit = Number((strikeStep * 0.45).toFixed(2));
    maxProfit = Number(((strikeStep - netDebit) * 100).toFixed(2));
    maxLoss = Number((netDebit * 100).toFixed(2));
    lowerBe = Number((baseStrike + netDebit).toFixed(2));
    winProb = 54.0;
    capitalRequired = Number((netDebit * 100).toFixed(2));
    legs = [
      { action: "BUY", type: "CALL", strike: baseStrike, price: 6.50, iv: Number(iv.toFixed(1)), delta: 0.50 },
      { action: "SELL", type: "CALL", strike: baseStrike + strikeStep, price: 2.10, iv: Number((iv * 0.95).toFixed(1)), delta: 0.20 },
    ];
  } else if (strategy === "BEAR_PUT_SPREAD") {
    sentiment = "BEARISH";
    const netDebit = Number((strikeStep * 0.46).toFixed(2));
    maxProfit = Number(((strikeStep - netDebit) * 100).toFixed(2));
    maxLoss = Number((netDebit * 100).toFixed(2));
    lowerBe = Number((baseStrike - netDebit).toFixed(2));
    winProb = 52.8;
    capitalRequired = Number((netDebit * 100).toFixed(2));
    legs = [
      { action: "BUY", type: "PUT", strike: baseStrike, price: 6.80, iv: Number((iv * 1.02).toFixed(1)), delta: -0.50 },
      { action: "SELL", type: "PUT", strike: baseStrike - strikeStep, price: 2.20, iv: Number((iv * 1.06).toFixed(1)), delta: -0.22 },
    ];
  } else if (strategy === "LONG_STRADDLE") {
    sentiment = "VOL_EXPANSION";
    const totalPremium = Number((strikeStep * 1.2).toFixed(2));
    maxProfit = 999999.0;
    maxLoss = Number((totalPremium * 100).toFixed(2));
    lowerBe = Number((baseStrike - totalPremium).toFixed(2));
    upperBe = Number((baseStrike + totalPremium).toFixed(2));
    winProb = 38.5;
    capitalRequired = Number((totalPremium * 100).toFixed(2));
    legs = [
      { action: "BUY", type: "CALL", strike: baseStrike, price: Number((totalPremium / 2).toFixed(2)), iv: Number(iv.toFixed(1)), delta: 0.50 },
      { action: "BUY", type: "PUT", strike: baseStrike, price: Number((totalPremium / 2).toFixed(2)), iv: Number(iv.toFixed(1)), delta: -0.50 },
    ];
  } else {
    // IRON_CONDOR
    sentiment = "NEUTRAL";
    const netCredit = Number((strikeStep * 0.37).toFixed(2));
    maxProfit = Number((netCredit * 100).toFixed(2));
    maxLoss = Number(((strikeStep - netCredit) * 100).toFixed(2));
    lowerBe = Number((baseStrike - strikeStep * 2 - netCredit).toFixed(2));
    upperBe = Number((baseStrike + strikeStep * 2 + netCredit).toFixed(2));
    winProb = 78.4;
    capitalRequired = strikeStep * 2 * 100;
    legs = [
      { action: "SELL", type: "PUT", strike: baseStrike - strikeStep * 2, price: 2.20, iv: Number((iv * 1.05).toFixed(1)), delta: -0.22 },
      { action: "BUY", type: "PUT", strike: baseStrike - strikeStep * 3, price: 1.25, iv: Number((iv * 1.08).toFixed(1)), delta: -0.12 },
      { action: "SELL", type: "CALL", strike: baseStrike + strikeStep * 2, price: 2.10, iv: Number((iv * 0.98).toFixed(1)), delta: 0.20 },
      { action: "BUY", type: "CALL", strike: baseStrike + strikeStep * 3, price: 1.20, iv: Number((iv * 0.95).toFixed(1)), delta: 0.11 },
    ];
  }

  const payoff_curve = Array.from({ length: 41 }).map((_, i) => {
    const range = strikeStep * 8;
    const p = Number((spot - range + (i * range * 2) / 40).toFixed(2));
    let pnl = 0.0;
    for (const leg of legs) {
      const multiplier = leg.action === "BUY" ? 1 : -1;
      if (leg.type === "CALL") {
        const intrinsic = Math.max(0, p - leg.strike);
        pnl += multiplier * (intrinsic - leg.price) * 100;
      } else {
        const intrinsic = Math.max(0, leg.strike - p);
        pnl += multiplier * (intrinsic - leg.price) * 100;
      }
    }

    return {
      price: p,
      pnl: Number(pnl.toFixed(2)),
      is_spot: Math.abs(p - spot) < (range / 20),
    };
  });

  return NextResponse.json({
    strategy,
    symbol,
    sentiment,
    spot_price: spot,
    legs,
    max_profit: maxProfit,
    max_loss: maxLoss,
    breakeven_lower: lowerBe,
    breakeven_upper: upperBe,
    win_probability: winProb,
    capital_required: capitalRequired,
    risk_reward_ratio: Number((maxProfit / Math.max(1, maxLoss)).toFixed(2)),
    payoff_curve,
  });
}

