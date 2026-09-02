import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const componentFilter = searchParams.get("component");
  const severityFilter = searchParams.get("severity");

  const systemHealth = {
    system_status: "HEALTHY",
    uptime_seconds: 384920,
    overall_latency_ms: 178,
    p95_latency_ms: 420,
    events_per_minute: 42,
    paper_trading_mode: true,
    agent_status: "ACTIVE",
    system_time: new Date().toISOString(),
    stream_status: "CONNECTED",
    subscribed_stream: "trade_updates",
    audit_logger_status: "HEALTHY",
    active_alerts_count: 0,
    errors_today: 0,
    warnings_today: 1,

    components: [
      { id: "CMP-01", name: "Frontend Interface", status: "HEALTHY", latency_ms: 2, endpoint: "Next.js 14 App Router", version: "1.0.0", last_check: "2026-09-02 00:44:00 UTC", last_success: "2026-09-02 00:44:00 UTC", last_error: "--" },
      { id: "CMP-02", name: "API Layer", status: "HEALTHY", latency_ms: 14, endpoint: "FastAPI / Next.js API Routes", version: "0.110.0", last_check: "2026-09-02 00:44:01 UTC", last_success: "2026-09-02 00:44:01 UTC", last_error: "--" },
      { id: "CMP-03", name: "VOLTRON Agent", status: "HEALTHY", latency_ms: 8, endpoint: "Autonomous Agent Loop", version: "2.4.0", last_check: "2026-09-02 00:44:01 UTC", last_success: "2026-09-02 00:44:01 UTC", last_error: "--" },
      { id: "CMP-04", name: "Market Data SIP Feed", status: "HEALTHY", latency_ms: 118, endpoint: "Alpaca Stock v2 SIP", version: "v2", last_check: "2026-09-02 00:44:02 UTC", last_success: "2026-09-02 00:44:02 UTC", last_error: "--" },
      { id: "CMP-05", name: "Options Data Engine", status: "HEALTHY", latency_ms: 164, endpoint: "Alpaca Options Feed", version: "v1beta1", last_check: "2026-09-02 00:44:02 UTC", last_success: "2026-09-02 00:44:02 UTC", last_error: "--" },
      { id: "CMP-06", name: "Gemini 3.6 AI Reasoning", status: "HEALTHY", latency_ms: 785, endpoint: "Google GenAI API (pro)", version: "gemini-3.6", last_check: "2026-09-02 00:44:03 UTC", last_success: "2026-09-02 00:44:03 UTC", last_error: "--" },
      { id: "CMP-07", name: "VOLTRON Risk Engine", status: "HEALTHY", latency_ms: 4, endpoint: "risk.risk_engine (7 Gates)", version: "1.2.0", last_check: "2026-09-02 00:44:03 UTC", last_success: "2026-09-02 00:44:03 UTC", last_error: "--" },
      { id: "CMP-08", name: "Paper Execution Engine", status: "HEALTHY", latency_ms: 182, endpoint: "execution.executor (Paper)", version: "1.1.0", last_check: "2026-09-02 00:44:04 UTC", last_success: "2026-09-02 00:44:04 UTC", last_error: "--" },
      { id: "CMP-09", name: "Alpaca REST & WebSocket", status: "HEALTHY", latency_ms: 142, endpoint: "paper-api.alpaca.markets", version: "v2", last_check: "2026-09-02 00:44:04 UTC", last_success: "2026-09-02 00:44:04 UTC", last_error: "--" },
      { id: "CMP-10", name: "Position Monitor", status: "HEALTHY", latency_ms: 8, endpoint: "agent.monitor (TP/SL Loop)", version: "1.0.0", last_check: "2026-09-02 00:44:05 UTC", last_success: "2026-09-02 00:44:05 UTC", last_error: "--" },
      { id: "CMP-11", name: "Audit Logger", status: "HEALTHY", latency_ms: 2, endpoint: "Append-only Telemetry Store", version: "1.0.0", last_check: "2026-09-02 00:44:05 UTC", last_success: "2026-09-02 00:44:05 UTC", last_error: "--" },
    ],

    agent_telemetry: {
      cycle: 148,
      previous_state: "RISK",
      current_state: "MONITOR",
      next_state: "EXIT",
      transition_latency_ms: 142,
      transition_reason: "Position POS-001 active; tracking 50% Take-Profit target",
      last_scan: "2026-09-02 00:35:00 UTC",
      last_analysis: "2026-09-02 00:35:05 UTC",
      last_strategy_decision: "2026-09-02 00:35:08 UTC",
      last_risk_decision: "2026-09-02 00:35:10 UTC",
      last_execution: "2026-09-02 00:35:12 UTC",
      last_monitor_update: "2026-09-02 00:44:00 UTC",
    },

    trade_reconstruction: {
      trace_id: "VOL-2026-000128",
      order_id: "ORD-9841",
      trade_id: "TRD-1094",
      symbol: "SPY",
      strategy: "IRON_CONDOR",
      stages: [
        { name: "MARKET SIGNAL", timestamp: "14:32:00.100", status: "DONE", detail: "SPY IV/RV=1.62x triggered Short Vol signal" },
        { name: "AI DECISION", timestamp: "14:32:00.220", status: "DONE", detail: "Gemini 3.6 synthesized delta-neutral thesis (Confidence: 88%)" },
        { name: "STRATEGY SELECTION", timestamp: "14:32:00.250", status: "DONE", detail: "Quant engine selected 45 DTE Iron Condor (575P/580P/605C/610C)" },
        { name: "RISK GATE APPROVAL", timestamp: "14:32:00.280", status: "DONE", detail: "RiskEngine approved 7/7 gates (Max loss $315 within 1% limit)" },
        { name: "ORDER SUBMISSION", timestamp: "14:32:00.320", status: "DONE", detail: "Submitted MLeg limit order @ $1.85 to Alpaca Paper" },
        { name: "BROKER FILL", timestamp: "14:32:01.050", status: "DONE", detail: "Filled @ $1.85 (Latency: 320ms, ClientID: vlt-mleg-8941-01)" },
        { name: "POSITION ACTIVE", timestamp: "14:32:01.100", status: "DONE", detail: "Position POS-001 opened; Dynamic TP $0.92 / SL $3.70 set" },
        { name: "MONITORING", timestamp: "14:35:00.000", status: "DONE", detail: "Current P&L +$145.00 (+7.84%); Position Healthy" },
      ],
    },

    events: [
      { id: "EVT-901", timestamp: "00:44:00 UTC", trace_id: "VOL-2026-000128", component: "MONITOR", event_type: "POSITION_CHECK", severity: "INFO", symbol: "SPY", strategy: "IRON_CONDOR", message: "SPY Iron Condor unrealized P&L +$145.00 (+7.84%). Exit condition HOLD.", duration_ms: 8 },
      { id: "EVT-900", timestamp: "00:40:12 UTC", trace_id: "VOL-2026-000127", component: "ALPACA", event_type: "STREAM_HEARTBEAT", severity: "INFO", symbol: "--", strategy: "--", message: "WebSocket trade_updates heartbeat received. Latency: 142ms.", duration_ms: 2 },
      { id: "EVT-899", timestamp: "00:35:12 UTC", trace_id: "VOL-2026-000128", component: "EXECUTION", event_type: "ORDER_FILLED", severity: "INFO", symbol: "SPY", strategy: "IRON_CONDOR", message: "Order ORD-9841 filled 1 contract @ $1.85 credit.", duration_ms: 182 },
      { id: "EVT-898", timestamp: "00:35:10 UTC", trace_id: "VOL-2026-000128", component: "RISK", event_type: "RISK_APPROVED", severity: "INFO", symbol: "SPY", strategy: "IRON_CONDOR", message: "All 7 Pre-trade risk gates passed. Proposed loss $315 within budget.", duration_ms: 4 },
      { id: "EVT-897", timestamp: "00:35:08 UTC", trace_id: "VOL-2026-000128", component: "STRATEGY", event_type: "STRATEGY_SELECT", severity: "INFO", symbol: "SPY", strategy: "IRON_CONDOR", message: "Selected Iron Condor with 45 DTE expiration across 575/580/605/610 strikes.", duration_ms: 12 },
      { id: "EVT-896", timestamp: "00:35:05 UTC", trace_id: "VOL-2026-000128", component: "AI", event_type: "AI_REASONING", severity: "INFO", symbol: "SPY", strategy: "IRON_CONDOR", message: "Gemini 3.6 market analysis completed with confidence 88%.", duration_ms: 785 },
      { id: "EVT-895", timestamp: "00:35:00 UTC", trace_id: "VOL-2026-000128", component: "SCANNER", event_type: "OPPORTUNITY_DETECT", severity: "INFO", symbol: "SPY", strategy: "VOLATILITY_SCAN", message: "SPY IV/RV spread 1.62x exceeds quant hurdle threshold 1.40x.", duration_ms: 118 },
      { id: "EVT-894", timestamp: "00:20:15 UTC", trace_id: "VOL-2026-000126", component: "RISK", event_type: "RISK_BLOCKED", severity: "WARNING", symbol: "NVDA", strategy: "IRON_CONDOR", message: "Liquidity Gate blocked order: Bid-Ask spread 12.4% > 10.0% limit.", duration_ms: 4 },
    ],

    audit_trail: [
      { id: "AUD-108", timestamp: "2026-09-02 00:35:12 UTC", event: "ORDER_SUBMITTED", component: "EXECUTION_ENGINE", actor: "AGENT", symbol: "SPY", strategy: "IRON_CONDOR", order_id: "ORD-9841", decision: "EXECUTED", outcome: "SUCCESS", trace_id: "VOL-2026-000128" },
      { id: "AUD-107", timestamp: "2026-09-02 00:35:10 UTC", event: "RISK_EVALUATION", component: "RISK_ENGINE", actor: "RISK_ENGINE", symbol: "SPY", strategy: "IRON_CONDOR", order_id: "--", decision: "APPROVED", outcome: "PASS (7/7 Gates)", trace_id: "VOL-2026-000128" },
      { id: "AUD-106", timestamp: "2026-09-02 00:35:05 UTC", event: "AI_SYNTHESIS", component: "AI_ENGINE", actor: "AI", symbol: "SPY", strategy: "IRON_CONDOR", order_id: "--", decision: "TRADE_CANDIDATE", outcome: "CONFIDENCE 88%", trace_id: "VOL-2026-000128" },
      { id: "AUD-105", timestamp: "2026-09-02 00:20:15 UTC", event: "RISK_INTERCEPT", component: "RISK_ENGINE", actor: "RISK_ENGINE", symbol: "NVDA", strategy: "IRON_CONDOR", order_id: "ORD-9839", decision: "BLOCKED", outcome: "SPREAD_TOO_WIDE", trace_id: "VOL-2026-000126" },
      { id: "AUD-104", timestamp: "2026-09-01 14:32:01 UTC", event: "POSITION_OPENED", component: "MONITOR", actor: "SYSTEM", symbol: "SPY", strategy: "IRON_CONDOR", order_id: "ORD-9841", decision: "MONITORING", outcome: "ACTIVE_TRACKING", trace_id: "VOL-2026-000125" },
    ],

    alerts: [
      { id: "ALT-SYS-01", timestamp: "00:40:00 UTC", severity: "INFO", title: "WebSocket Stream Synchronized", message: "Alpaca trade_updates stream connected with zero dropped frames." },
      { id: "ALT-SYS-02", timestamp: "00:30:00 UTC", severity: "INFO", title: "Telemetry Stream Healthy", message: "Mean pipeline latency 178ms (P95: 420ms) within normal institutional SLA." },
    ],

    connections: [
      { name: "Alpaca Paper REST API", status: "CONNECTED", protocol: "HTTPS", endpoint: "paper-api.alpaca.markets", latency: "142ms", reconnects: 0 },
      { name: "Alpaca trade_updates Stream", status: "CONNECTED", protocol: "WSS", endpoint: "stream.data.alpaca.markets", latency: "142ms", reconnects: 0 },
      { name: "SIP Market Feed", status: "CONNECTED", protocol: "WSS/REST", endpoint: "data.alpaca.markets/v2", latency: "118ms", reconnects: 0 },
      { name: "Google Gemini 3.6 Pro API", status: "CONNECTED", protocol: "gRPC/HTTPS", endpoint: "generativelanguage.googleapis.com", latency: "785ms", reconnects: 0 },
      { name: "Internal Memory Event Bus", status: "CONNECTED", protocol: "In-Memory", endpoint: "agent.state", latency: "2ms", reconnects: 0 },
      { name: "Audit Trail Storage", status: "CONNECTED", protocol: "Append-Only", endpoint: "local_ledger.csv", latency: "2ms", reconnects: 0 },
    ],
  };

  let events = systemHealth.events;
  if (componentFilter && componentFilter !== "ALL") {
    events = events.filter((e) => e.component === componentFilter);
  }
  if (severityFilter && severityFilter !== "ALL") {
    events = events.filter((e) => e.severity === severityFilter);
  }

  return NextResponse.json({
    ...systemHealth,
    events,
  });
}
