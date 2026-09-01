import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();

  return NextResponse.json({
    status: "ACTIVE",
    running: true,
    paused: false,
    cycle: 142,
    symbol,
    analysis: {
      symbol,
      status: "ANALYZING",
      decision: "TRADE_CANDIDATE",
      confidence: 88,
      direction: "NEUTRAL",
      volatility_view: "EXPENSIVE",
      strategy_recommendation: "IRON CONDOR",
      thesis: `${symbol} implied volatility (16.85%) is materially elevated above 20-day realized volatility (10.42%), generating an IV/RV spread of 1.62x. This indicates substantial variance risk premium and optimal conditions for defined-risk credit harvesting.`,
      key_reasons: [
        "IV/RV spread ratio of 1.62x indicates statistically rich option premium",
        "Underlying index realized price velocity shows low directional drift (regime: NEUTRAL)",
        "Deep institutional options liquidity with tight bid-ask spreads (< 2.5%)",
        "Defined-risk multi-leg structure guarantees maximum loss containment",
      ],
      risks: [
        "Macro economic announcements or FOMC rate decisions could trigger IV expansion",
        "Tail gap movement exceeding wing thresholds will trigger stop loss",
        "Theta decay decelerates if realized volatility spikes above 20%",
      ],
      opportunity_score: 94,
      timestamp: new Date().toUTCString(),
    },
    active_order: "VLT-8941",
    kill_switch: false,
    paper_connected: true,
    portfolio_value: 100000.0,
  });
}
