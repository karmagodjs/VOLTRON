import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    metrics: {
      starting_capital: 100000.0,
      ending_capital: 128450.0,
      total_return_pct: 28.45,
      cagr: 22.8,
      sharpe_ratio: 2.18,
      sortino_ratio: 2.92,
      max_drawdown_pct: 6.42,
      win_rate_pct: 78.4,
      profit_factor: 2.65,
      total_trades: 68,
      winning_trades: 53,
      losing_trades: 15,
      avg_trade_pnl: 418.38,
      largest_win: 680.0,
      largest_loss: -520.0,
    },
    strategies_breakdown: [
      { strategy: "IRON_CONDOR", win_rate: 78.4, pnl: 5820.0, trades: 34, sharpe: 2.14 },
      { strategy: "BULL_PUT_SPREAD", win_rate: 81.2, pnl: 4120.0, trades: 22, sharpe: 2.45 },
      { strategy: "BEAR_CALL_SPREAD", win_rate: 75.0, pnl: 1950.0, trades: 12, sharpe: 1.88 },
      { strategy: "LONG_STRADDLE", win_rate: 45.0, pnl: -450.0, trades: 4, sharpe: 0.85 },
    ],
    monthly_pnl: [
      { month: "Jan", pnl: 1420.0 },
      { month: "Feb", pnl: 980.0 },
      { month: "Mar", pnl: 2150.0 },
      { month: "Apr", pnl: -420.0 },
      { month: "May", pnl: 1840.0 },
      { month: "Jun", pnl: 2310.0 },
      { month: "Jul", pnl: 1650.0 },
      { month: "Aug", pnl: 1510.0 },
    ],
  });
}
