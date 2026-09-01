import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    equity: 100000.0,
    cash: 81800.0,
    buying_power: 180000.0,
    portfolio_value: 100000.0,
    daily_pnl: 1284.5,
    daily_pnl_percent: 1.3,
    unrealized_pnl: 2435.0,
    realized_pnl: 8640.0,
    portfolio_exposure_pct: 18.2,
    open_positions_count: 3,
    status: "ACTIVE",
    trading_blocked: false,
    paper_mode: true,
    kill_switch_active: false,
  });
}
