import { NextResponse } from "next/server";

export async function GET() {
  const account = {
    equity: 100000.0,
    cash: 81800.0,
    buying_power: 180000.0,
    portfolio_value: 100000.0,
    daily_pnl: 1284.5,
    daily_pnl_percent: 1.3,
    unrealized_pnl: 2435.0,
    realized_pnl: 8640.0,
    portfolio_exposure_pct: 18.2,
    open_positions_count: 2,
    status: "ACTIVE",
    trading_blocked: false,
    paper_mode: true,
    kill_switch_active: false,
    currency: "USD",
    account_number: "PA391058291",
  };

  const positions = [
    {
      id: "POS-001",
      symbol: "SPY",
      strategy: "IRON_CONDOR",
      opened_at: "2026-09-01 14:32:00 UTC",
      expiration: "2026-10-17 (45 DTE)",
      spot_at_entry: 590.2,
      current_spot: 591.42,
      net_credit: 1.85,
      current_cost_to_close: 1.48,
      unrealized_pnl: 145.0,
      unrealized_pnl_pct: 7.84,
      max_profit: 185.0,
      max_loss: 315.0,
      breakeven_lower: 578.15,
      breakeven_upper: 606.85,
      take_profit_target: 0.92,
      stop_loss_limit: 3.7,
      distance_to_tp: "+42.2%",
      distance_to_sl: "+60.0%",
      delta: 0.02,
      theta: 4.85,
      vega: -14.2,
      gamma: 0.008,
      status: "OPEN",
      legs: [
        { contract: "SPY261017P00575000", type: "LONG PUT", strike: 575, side: "BUY", price: 1.25, current: 1.1, delta: -0.12, qty: 1 },
        { contract: "SPY261017P00580000", type: "SHORT PUT", strike: 580, side: "SELL", price: 2.2, current: 1.9, delta: -0.22, qty: 1 },
        { contract: "SPY261017C00605000", type: "SHORT CALL", strike: 605, side: "SELL", price: 2.1, current: 1.75, delta: 0.2, qty: 1 },
        { contract: "SPY261017C00610000", type: "LONG CALL", strike: 610, side: "BUY", price: 1.2, current: 1.07, delta: 0.11, qty: 1 },
      ],
    },
    {
      id: "POS-002",
      symbol: "QQQ",
      strategy: "BULL_PUT_SPREAD",
      opened_at: "2026-08-28 10:15:00 UTC",
      expiration: "2026-10-02 (30 DTE)",
      spot_at_entry: 492.1,
      current_spot: 498.75,
      net_credit: 1.15,
      current_cost_to_close: 0.42,
      unrealized_pnl: 365.0,
      unrealized_pnl_pct: 63.48,
      max_profit: 575.0,
      max_loss: 1925.0,
      breakeven_lower: 488.85,
      breakeven_upper: 490.0,
      take_profit_target: 0.57,
      stop_loss_limit: 2.3,
      distance_to_tp: "+85.0%",
      distance_to_sl: "+81.7%",
      delta: 0.08,
      theta: 6.1,
      vega: -9.4,
      gamma: 0.005,
      status: "OPEN",
      legs: [
        { contract: "QQQ261002P00485000", type: "LONG PUT", strike: 485, side: "BUY", price: 1.85, current: 0.7, delta: -0.09, qty: 5 },
        { contract: "QQQ261002P00490000", type: "SHORT PUT", strike: 490, side: "SELL", price: 3.0, current: 1.12, delta: -0.17, qty: 5 },
      ],
    },
  ];

  const pnlHistory = {
    "1D": Array.from({ length: 24 }).map((_, i) => ({
      time: `${String(i).padStart(2, "0")}:00`,
      equity: +(99200 + i * 35 + Math.sin(i * 0.8) * 120).toFixed(2),
      pnl: +(i * 35 + Math.sin(i * 0.8) * 120).toFixed(2),
    })),
    "1M": Array.from({ length: 30 }).map((_, i) => ({
      time: `Day ${i + 1}`,
      equity: +(93000 + i * 235 + Math.sin(i * 0.5) * 400).toFixed(2),
      pnl: +(i * 235 + Math.sin(i * 0.5) * 400).toFixed(2),
    })),
    "ALL": Array.from({ length: 40 }).map((_, i) => ({
      time: `Wk ${i + 1}`,
      equity: +(85000 + i * 375 + Math.sin(i * 0.4) * 600).toFixed(2),
      pnl: +(i * 375 + Math.sin(i * 0.4) * 600).toFixed(2),
    })),
  };

  const reconciliation = {
    status: "SYNCHRONIZED",
    last_verified: new Date().toISOString(),
    voltron_state: {
      portfolio_value: 100000.0,
      open_positions: 2,
      open_orders: 1,
      unrealized_pnl: 2435.0,
    },
    alpaca_state: {
      portfolio_value: 100000.0,
      open_positions: 2,
      open_orders: 1,
      unrealized_pnl: 2435.0,
    },
    mismatches: [],
  };

  return NextResponse.json({
    account,
    positions,
    pnl_history: pnlHistory,
    reconciliation,
  });
}
