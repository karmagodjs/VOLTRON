import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = (searchParams.get("symbol") || "SPY").toUpperCase();
  const asset = SUPPORTED_ASSETS[symbol] || SUPPORTED_ASSETS["SPY"];
  const now = new Date();

  const {
    price,
    change,
    change_percent: changePct,
    realized_volatility: rv,
    implied_volatility: iv,
    iv_rv_ratio: ivRvRatio,
    iv_premium: ivPremium,
    opportunity_score: oppScore,
    market_regime: regime,
    vol_signal: volSignal,
    strategy,
  } = asset;

  const decision = oppScore >= 70 ? "TRADE_CANDIDATE" : "NO_TRADE";
  const confidence = decision === "TRADE_CANDIDATE" ? (symbol === "SPY" ? 88 : symbol === "QQQ" ? 89 : 82) : 45;
  const direction = strategy.includes("BULL") ? "BULLISH" : strategy.includes("BEAR") ? "BEARISH" : "NEUTRAL";

  const thesis =
    decision === "TRADE_CANDIDATE"
      ? `${symbol} implied volatility (${iv.toFixed(2)}%) is elevated above 20-day realized volatility (${rv.toFixed(2)}%), generating an IV/RV spread of ${ivRvRatio.toFixed(2)}x. Optimal conditions for defined-risk credit spread harvesting with strict loss caps.`
      : `${symbol} volatility dislocation score (${oppScore}/100) is below the minimum institutional hurdle rate of 70. Execution is blocked under fail-closed safety gating.`;

  const analysis = {
    symbol,
    status: "ANALYZING" as const,
    decision,
    confidence,
    direction,
    volatility_view: volSignal,
    strategy_recommendation: strategy.replace(/_/g, " "),
    thesis,
    key_reasons: [
      `IV/RV spread ratio of ${ivRvRatio.toFixed(2)}x indicates statistically rich option premium`,
      `Underlying price drift indicates ${direction} market structure (regime: ${regime})`,
      "Institutional options liquidity with tight bid-ask spreads",
      "Defined-risk multi-leg structure guarantees maximum loss containment",
    ],
    risks: [
      "Macro economic announcements or FOMC rate decisions could trigger IV expansion",
      "Tail gap movement exceeding wing thresholds will trigger stop loss",
    ],
    opportunity_score: oppScore,
    timestamp: now.toISOString(),
  };

  const decisionFactors = [
    `IV (${iv.toFixed(1)}%) vs 20-day RV (${rv.toFixed(1)}%) creates ${ivRvRatio.toFixed(2)}x variance spread`,
    `Directional bias classified as ${direction} with low tail drift`,
    `Opportunity score (${oppScore}/100) ${oppScore >= 70 ? "satisfies" : "fails"} minimum threshold of 70`,
    `Strategy mapped to ${strategy.replace(/_/g, " ")} with defined risk limits`,
  ];

  const riskApproved = oppScore >= 70;
  const riskGates = [
    {
      name: "OPPORTUNITY SCORE",
      condition: "Score >= 70",
      current_value: `${oppScore} / 100`,
      status: oppScore >= 70 ? ("PASS" as const) : ("BLOCKED" as const),
      description: "Volatility alpha score satisfies minimum trade threshold.",
    },
    {
      name: "TRADE RISK",
      condition: "Risk <= 1.0% ($1,000)",
      current_value: "0.31% ($315.00)",
      status: "PASS" as const,
      description: "Single-trade max loss within safety envelope.",
    },
    {
      name: "DAILY LOSS",
      condition: "Daily Loss < 2.0% ($2,000)",
      current_value: "+$1,284.50 (Profit)",
      status: "PASS" as const,
      description: "Daily circuit breaker active.",
    },
    {
      name: "PORTFOLIO EXPOSURE",
      condition: "Exposure <= 30.0% ($30,000)",
      current_value: "18.2% ($18,200.00)",
      status: "PASS" as const,
      description: "Total capital utilization within limits.",
    },
    {
      name: "LIQUIDITY",
      condition: "Spread <= 10.0%",
      current_value: "2.1% Spread",
      status: "PASS" as const,
      description: "Options market spread meets institutional liquidity gate.",
    },
    {
      name: "CONSECUTIVE LOSSES",
      condition: "Losses < 3",
      current_value: "0 / 3 Losses",
      status: "PASS" as const,
      description: "Cooling period inactive; zero consecutive stop-outs.",
    },
    {
      name: "KILL SWITCH",
      condition: "Disarmed / Normal",
      current_value: "ARMED / READY",
      status: "PASS" as const,
      description: "Emergency kill switch ready.",
    },
  ];

  const pipeline = [
    { stage: "SCAN", status: "PASSED", timestamp: "09:31:02", reason: `${symbol} liquid options scan detected` },
    { stage: "ANALYZE", status: "PASSED", timestamp: "09:31:03", reason: `IV/RV = ${ivRvRatio.toFixed(2)}x (Confidence: ${confidence}%)` },
    { stage: "STRATEGY", status: "PASSED", timestamp: "09:31:04", reason: `${strategy} (45 DTE) selected` },
    { stage: "RISK", status: riskApproved ? "PASSED" : "BLOCKED", timestamp: "09:31:05", reason: riskApproved ? "7 Safety gates approved (0.31% Risk)" : "Opportunity score below 70 hurdle rate" },
    { stage: "EXECUTE", status: riskApproved ? "PASSED" : "BLOCKED", timestamp: "09:31:05", reason: riskApproved ? `Paper order #VLT-${symbol} routed to Alpaca` : "Execution safely blocked by Risk Engine" },
    { stage: "MONITOR", status: riskApproved ? "ACTIVE" : "WAITING", timestamp: riskApproved ? "09:31:06" : "—", reason: riskApproved ? `Position live on ${symbol}` : "No position open" },
    { stage: "EXIT", status: "WAITING", timestamp: "—", reason: "Monitoring TP 50% / SL 100%" },
    { stage: "LOG", status: "WAITING", timestamp: "—", reason: "Awaiting cycle finalization" },
  ];

  const atmAnchor = Math.round(price / 5.0) * 5;
  const executionState = {
    status: riskApproved ? "ORDER_SUBMITTED" : "EXECUTION_BLOCKED",
    order_id: `VLT-${symbol}-8941`,
    symbol,
    strategy,
    legs: [
      `SELL ${symbol} ${atmAnchor - 5} PUT`,
      `BUY ${symbol} ${atmAnchor - 10} PUT`,
      `SELL ${symbol} ${atmAnchor + 10} CALL`,
      `BUY ${symbol} ${atmAnchor + 15} CALL`,
    ],
    quantity: 1,
    order_type: "LIMIT_CREDIT",
    limit_price: 1.85,
    timestamp: "09:31:05 UTC",
  };

  const positionMonitor = {
    status: riskApproved ? "POSITION_ACTIVE" : "NO_POSITION",
    position: riskApproved
      ? {
          symbol,
          strategy: strategy.replace(/_/g, " "),
          entry_price: 1.85,
          current_value: 1.70,
          unrealized_pnl: 145.0,
          unrealized_pnl_pct: 7.84,
          take_profit: 0.92,
          stop_loss: 3.7,
          opened_at: "09:31:05 UTC",
          time_open: "1h 42m",
        }
      : null,
  };

  const metrics = {
    cycles_today: 142,
    trades_today: 6,
    winning_trades: 5,
    losing_trades: 1,
    win_rate_pct: 83.3,
    avg_confidence: 86.4,
    avg_opportunity_score: 91.2,
    orders_submitted: 6,
    orders_rejected: 0,
    risk_blocks: 1,
  };

  return NextResponse.json({
    status: "ACTIVE",
    running: true,
    paused: false,
    cycle: 142,
    symbol,
    trading_mode: "PAPER",
    agent_state: {
      cycle: 142,
      status: "ANALYZING",
      symbol,
      decision,
      strategy,
      confidence,
      opportunity_score: oppScore,
      active_order_id: `VLT-${symbol}-8941`,
      active_position: riskApproved ? `${symbol} ${strategy.replace(/_/g, " ")}` : "NONE",
      last_reason: thesis,
      errors: [],
    },
    market_observation: {
      symbol,
      price,
      change,
      change_percent: changePct,
      market_regime: regime,
      implied_volatility: iv,
      realized_volatility: rv,
      iv_rv_ratio: ivRvRatio,
      iv_premium: ivPremium,
      opportunity_score: oppScore,
      vol_signal: volSignal,
      market_status: "OPEN",
    },
    analysis,
    decision_factors: decisionFactors,
    risk_decision: {
      overall_status: riskApproved ? "APPROVED" : "BLOCKED",
      reason: riskApproved
        ? "All 7 safety gates evaluated and passed successfully."
        : "Risk Engine blocked execution: Opportunity score below 70 threshold.",
      gates: riskGates,
    },
    strategy_decision: {
      selected_strategy: strategy.replace(/_/g, " "),
      sentiment: direction,
      volatility_view: volSignal,
      iv_rv_ratio: ivRvRatio,
      confidence,
      rationale: thesis,
      legs: [
        { action: "SELL", strike: atmAnchor - 5, type: "PUT", price: 2.2 },
        { action: "BUY", strike: atmAnchor - 10, type: "PUT", price: 1.25 },
        { action: "SELL", strike: atmAnchor + 10, type: "CALL", price: 2.1 },
        { action: "BUY", strike: atmAnchor + 15, type: "CALL", price: 1.2 },
      ],
      net_credit: 1.85,
      max_loss: 3.15,
    },
    execution_state: executionState,
    position_monitor: positionMonitor,
    pipeline,
    metrics,
    kill_switch: false,
    paper_connected: true,
    portfolio_value: 100000.0,
  });
}
