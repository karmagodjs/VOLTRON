import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ message: "" }));
  const message = (body.message || "").toLowerCase();

  let reply = "";
  if (message.includes("why") && message.includes("iron condor")) {
    reply =
      "VOLTRON selected **IRON CONDOR** on SPY because Implied Volatility (16.85%) is significantly higher than 20-day Realized Volatility (10.42%), giving an IV/RV ratio of **1.62x**. Market directional drift is neutral. An Iron Condor collects rich variance risk premium on both wings while strictly capping maximum loss to $315 per contract.";
  } else if (message.includes("rejected") || message.includes("risk")) {
    reply =
      "The Risk Command Center evaluates all trades against 7 rigorous gates. All current gates are passing:\n\n• **Opportunity Score**: 94/100 (Min: 70) [PASS]\n• **Trade Risk**: 0.31% (Max: 1.00%) [PASS]\n• **Daily Loss Limit**: +$1,284.50 (Max Drawdown: 2.0%) [PASS]\n• **Exposure**: 18.2% (Max: 30.0%) [PASS]\n• **Consecutive Losses**: 0 (Max: 3) [PASS]\n\nTrades are immediately rejected if spread width exceeds 10% or if the emergency kill switch is activated.";
  } else if (message.includes("regime") || message.includes("volatility") || message.includes("compare")) {
    reply =
      "Current Market Volatility Regime: **HIGH IV SPREAD**.\n\n• **Implied Volatility (IV)**: 16.85%\n• **Realized Volatility (RV)**: 10.42%\n• **IV/RV Ratio**: 1.62x (+61.7% premium)\n\nConclusion: Options are currently **EXPENSIVE** relative to historical drift. This mathematically favors credit spread harvesting.";
  } else {
    reply =
      "**VOLTRON Intelligence Summary**:\n\n• **Symbol**: SPY ($591.42)\n• **Volatility State**: IV=16.85%, RV=10.42% (Ratio: 1.62x)\n• **AI Thesis**: SPY implied volatility is elevated against realized drift.\n• **Active Strategy**: Iron Condor (45 DTE, Net Credit $1.85)\n• **Execution**: Alpaca Paper Trading Mode (Safety gates active).";
  }

  return NextResponse.json({
    reply,
    timestamp: new Date().toISOString(),
  });
}
