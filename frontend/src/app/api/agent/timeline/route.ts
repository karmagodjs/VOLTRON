import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    cycle: 142,
    status: "ACTIVE",
    events: [
      {
        id: "evt-1",
        timestamp: "09:31:02",
        stage: "MARKET SCAN",
        status: "PASS",
        summary: "SPY detected (Spot $591.42, Vol 64.2M)",
        details: "Scan filter: S&P 500 liquidity, 20-day RV = 10.42%, IV = 16.85%",
        type: "scan",
      },
      {
        id: "evt-2",
        timestamp: "09:31:03",
        stage: "VOLATILITY ENGINE",
        status: "PASS",
        summary: "IV/RV = 1.62x | IV Premium = +61.7%",
        details: "Signal: IV EXPENSIVE. Opportunity Score = 94/100. Regime: NEUTRAL.",
        type: "volatility",
      },
      {
        id: "evt-3",
        timestamp: "09:31:04",
        stage: "AI ANALYST",
        status: "PASS",
        summary: "Confidence 88% | Decision: TRADE CANDIDATE",
        details: "Thesis: Elevated implied volatility skew against compressed realized drift.",
        type: "ai",
      },
      {
        id: "evt-4",
        timestamp: "09:31:04",
        stage: "STRATEGY ENGINE",
        status: "PASS",
        summary: "Selected: IRON CONDOR (45 DTE)",
        details: "Legs: Sell 580P / Buy 575P / Sell 605C / Buy 610C | Net Credit: $1.85",
        type: "strategy",
      },
      {
        id: "evt-5",
        timestamp: "09:31:05",
        stage: "RISK ENGINE",
        status: "PASS",
        summary: "All 7 Risk Gates APPROVED",
        details: "Trade Risk: 0.31% (Limit 1.00%) | Exposure: 18.2% (Limit 30.0%)",
        type: "risk",
      },
      {
        id: "evt-6",
        timestamp: "09:31:05",
        stage: "PAPER EXECUTION",
        status: "PASS",
        summary: "Paper Order #VLT-8941 Submitted",
        details: "Alpaca Paper API acknowledged multi-leg limit order @ $1.85 credit.",
        type: "execution",
      },
      {
        id: "evt-7",
        timestamp: "09:31:06",
        stage: "POSITION MONITOR",
        status: "ACTIVE",
        summary: "Position Live: SPY IRON CONDOR",
        details: "Unrealized P&L: +$145.00 (+7.8%) | Target: +50% | Stop: -100%",
        type: "monitor",
      },
    ],
  });
}
