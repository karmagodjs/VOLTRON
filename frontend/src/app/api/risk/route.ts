import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    portfolio_value: 100000.0,
    daily_pnl: 1284.5,
    portfolio_exposure_pct: 18.2,
    trade_risk_pct: 0.31,
    daily_loss_limit_pct: 2.0,
    consecutive_losses: 0,
    kill_switch: false,
    overall_status: "APPROVED",
    gates: [
      {
        name: "Opportunity Score",
        condition: "Score >= 70",
        current_value: "94 / 100",
        status: "PASS",
        description: "Quant volatility edge exceeds threshold.",
      },
      {
        name: "Max Trade Risk",
        condition: "Risk <= 1.0% ($1,000)",
        current_value: "0.31% ($315.00)",
        status: "PASS",
        description: "Single trade loss capped at 1% total equity.",
      },
      {
        name: "Daily Loss Limit",
        condition: "Daily Loss < 2.0% ($2,000)",
        current_value: "+$1,284.50 (Profit)",
        status: "PASS",
        description: "Circuit breaker halts trading at 2% drawdown.",
      },
      {
        name: "Portfolio Exposure",
        condition: "Exposure <= 30.0% ($30,000)",
        current_value: "18.2% ($18,200.00)",
        status: "PASS",
        description: "Aggregate open margin within 30% risk allocation.",
      },
      {
        name: "Market Liquidity",
        condition: "Spread <= 10.0%",
        current_value: "2.1% Spread",
        status: "PASS",
        description: "Options spread satisfies institutional execution requirement.",
      },
      {
        name: "Consecutive Losses",
        condition: "Consecutive Losses < 3",
        current_value: "0 Losses",
        status: "PASS",
        description: "Agent enforces cooling period after 3 stop outs.",
      },
      {
        name: "Paper Trading Safety",
        condition: "Paper Mode Active",
        current_value: "Paper Mode (Active)",
        status: "PASS",
        description: "Execution safety locked to Alpaca Paper environment.",
      },
    ],
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ active: false }));
  return NextResponse.json({
    success: true,
    kill_switch: !!body.active,
    message: body.active ? "Kill Switch Activated" : "Kill Switch Reset",
  });
}
