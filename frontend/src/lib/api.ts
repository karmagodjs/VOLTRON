import {
  AccountSummary,
  MarketData,
  OptionChainData,
  AIAnalysis,
  TimelineEvent,
  StrategyDetails,
  RiskStatus,
  TradeRecord,
  BacktestResult,
  SystemHealth,
} from "@/types";

const API_BASE = "/api";

export async function fetchAccount(): Promise<AccountSummary> {
  try {
    const res = await fetch(`${API_BASE}/account`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (err) {
    return {
      equity: 0.0,
      cash: 0.0,
      buying_power: 0.0,
      portfolio_value: 0.0,
      daily_pnl: 0.0,
      daily_pnl_percent: 0.0,
      unrealized_pnl: 0.0,
      realized_pnl: 0.0,
      portfolio_exposure_pct: 0.0,
      open_positions_count: 0,
      status: "DISCONNECTED",
      trading_blocked: true,
      paper_mode: true,
      kill_switch_active: false,
    };
  }
}

export async function fetchMarket(symbol = "SPY", timeframe = "1M"): Promise<MarketData> {
  const sym = symbol.toUpperCase();
  const tf = (timeframe || "1M").toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/market?symbol=${sym}&timeframe=${tf}`, { cache: "no-store" });
    if (!res.ok) throw new Error(`Backend error for ${sym} (${tf})`);
    return await res.json();
  } catch (err) {
    return {
      symbol: sym,
      name: `${sym} Market Asset`,
      price: 0.0,
      change: 0.0,
      change_percent: 0.0,
      high: 0.0,
      low: 0.0,
      volume: 0,
      realized_volatility: 0.0,
      implied_volatility: 0.0,
      iv_rv_ratio: 0.0,
      iv_premium: 0.0,
      opportunity_score: 0,
      market_regime: "DATA UNAVAILABLE",
      vol_signal: "FAIR",
      market_status: "CLOSED",
      last_updated: new Date().toISOString(),
      history: [],
    };
  }
}

export async function fetchOptionsChain(symbol = "SPY", expiration?: string): Promise<OptionChainData> {
  const sym = symbol.toUpperCase();
  try {
    const q = expiration ? `&expiration=${expiration}` : "";
    const res = await fetch(`${API_BASE}/options?symbol=${sym}${q}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      symbol: sym,
      spot_price: 0.0,
      expirations: [],
      selected_expiration: "",
      days_to_expiration: 0,
      chain: [],
    };
  }
}

export async function fetchAIAnalysis(symbol = "SPY"): Promise<AIAnalysis> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/agent?symbol=${sym}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    if (data.analysis) {
      if (!data.analysis.ai_status && data.ai_status) {
        data.analysis.ai_status = data.ai_status;
      }
      return data.analysis;
    }
    return {
      symbol: sym,
      status: "IDLE",
      ai_status: "ERROR",
      decision: "NO_TRADE",
      confidence: 0,
      direction: "NEUTRAL",
      volatility_view: "FAIR",
      strategy_recommendation: "NO_TRADE",
      thesis: "Awaiting backend analysis.",
      key_reasons: [],
      risks: [],
      opportunity_score: 0,
      timestamp: new Date().toISOString(),
    };
  } catch {
    return {
      symbol: sym,
      status: "NO_TRADE",
      ai_status: "ERROR",
      decision: "NO_TRADE",
      confidence: 0,
      direction: "NEUTRAL",
      volatility_view: "FAIR",
      strategy_recommendation: "NO_TRADE",
      thesis: "Unable to connect to VOLTRON AI Analyst.",
      key_reasons: [],
      risks: ["Backend connection offline."],
      opportunity_score: 0,
      timestamp: new Date().toISOString(),
    };
  }
}

export async function fetchAgentTelemetry(symbol = "SPY"): Promise<any> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/agent?symbol=${sym}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      status: "OFFLINE",
      running: false,
      paused: false,
      cycle: 0,
      symbol: sym,
      trading_mode: "PAPER",
      agent_state: {
        cycle: 0,
        status: "OFFLINE",
        symbol: sym,
        decision: "NO_TRADE",
        strategy: "NONE",
        confidence: 0,
        opportunity_score: 0,
        active_order_id: null,
        active_position: null,
        last_reason: "Backend offline",
        errors: ["Backend offline"],
      },
      market_observation: {
        symbol: sym,
        price: 0,
        change: 0,
        change_percent: 0,
        market_regime: "OFFLINE",
        implied_volatility: 0,
        realized_volatility: 0,
        iv_rv_ratio: 0,
        iv_premium: 0,
        opportunity_score: 0,
        vol_signal: "FAIR",
        market_status: "CLOSED",
      },
      analysis: {
        symbol: sym,
        status: "NO_TRADE",
        decision: "NO_TRADE",
        confidence: 0,
        direction: "NEUTRAL",
        volatility_view: "FAIR",
        strategy_recommendation: "NONE",
        thesis: "Backend offline.",
        key_reasons: [],
        risks: [],
        opportunity_score: 0,
        timestamp: new Date().toISOString(),
      },
      risk_decision: {
        overall_status: "BLOCKED",
        reason: "Backend offline",
        gates: [],
      },
      strategy_decision: {
        selected_strategy: "NONE",
        sentiment: "NEUTRAL",
        volatility_view: "FAIR",
        iv_rv_ratio: 0,
        confidence: 0,
        rationale: "Backend offline",
        legs: [],
      },
      execution_state: {
        status: "DISABLED",
        mode: "PAPER",
        trading_enabled: false,
        reason: "Backend offline",
      },
      position_monitor: {
        status: "NO_POSITION",
        position: null,
        message: "Offline",
      },
      metrics: {
        cycles_today: 0,
        trades_today: 0,
        win_rate_pct: 0,
        orders_submitted: 0,
      },
      pipeline: [],
    };
  }
}

export async function fetchTimeline(symbol = "SPY"): Promise<{
  events: TimelineEvent[];
  cycle: number;
  status: string;
}> {
  try {
    const res = await fetch(`${API_BASE}/agent/timeline?symbol=${symbol}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      events: [],
      cycle: 0,
      status: "OFFLINE",
    };
  }
}

export async function fetchStrategy(strategy = "IRON_CONDOR", symbol = "SPY"): Promise<StrategyDetails> {
  const sym = symbol.toUpperCase();
  const strat = strategy.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/strategy?strategy=${strat}&symbol=${sym}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      strategy: strat,
      symbol: sym,
      sentiment: "NEUTRAL",
      spot_price: 0,
      legs: [],
      max_profit: 0,
      max_loss: 0,
      breakeven_lower: null,
      breakeven_upper: null,
      win_probability: 0,
      capital_required: 0,
      risk_reward_ratio: 0,
      payoff_curve: [],
    };
  }
}

export async function fetchRisk(symbol = "SPY"): Promise<RiskStatus> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/risk?symbol=${sym}`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      portfolio_value: 0,
      daily_pnl: 0,
      portfolio_exposure_pct: 0,
      trade_risk_pct: 0,
      daily_loss_limit_pct: 2.0,
      consecutive_losses: 0,
      kill_switch: false,
      overall_status: "BLOCKED",
      gates: [],
    };
  }
}

export async function toggleKillSwitch(active: boolean): Promise<{ success: boolean; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/risk/kill-switch`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active }),
    });
    return await res.json();
  } catch {
    return {
      success: false,
      message: "Failed to communicate with backend kill switch.",
    };
  }
}

export async function fetchTrades(): Promise<TradeRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/trades`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    return data.trades || data.orders || [];
  } catch {
    return [];
  }
}

export async function runBacktest(params?: Record<string, any>): Promise<BacktestResult> {
  try {
    const res = await fetch(`${API_BASE}/backtest/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params || {}),
    });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      summary: {
        starting_capital: 100000,
        ending_capital: 100000,
        total_return_pct: 0,
        cagr: 0,
        sharpe_ratio: 0,
        sortino_ratio: 0,
        max_drawdown_pct: 0,
        win_rate_pct: 0,
        profit_factor: 0,
        total_trades: 0,
        winning_trades: 0,
        losing_trades: 0,
        avg_trade_pnl: 0,
        largest_win: 0,
        largest_loss: 0,
      },
      parameters: {
        strategy: params?.strategy || "IRON_CONDOR",
        symbol: params?.symbol || "SPY",
        start_date: params?.start_date || "2025-01-01",
        end_date: params?.end_date || "2026-08-31",
        iv_rv_threshold: params?.iv_rv_threshold || 1.4,
        confidence_threshold: params?.confidence_threshold || 70,
        risk_per_trade_pct: params?.risk_per_trade_pct || 1.0,
        max_exposure_pct: params?.max_exposure_pct || 30.0,
      },
      equity_curve: [],
      trades: [],
    };
  }
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch(`${API_BASE}/system`, { cache: "no-store" });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      system_status: "DEGRADED",
      uptime_seconds: 0,
      overall_latency_ms: 0,
      paper_trading_mode: true,
      system_time: new Date().toISOString(),
      services: [
        { name: "Alpaca Paper REST API", status: "OFFLINE", latency_ms: 0, endpoint: "https://paper-api.alpaca.markets", healthy: false },
        { name: "Market Data IEX Feed", status: "OFFLINE", latency_ms: 0, endpoint: "Alpaca Stock v2 (IEX)", healthy: false },
        { name: "Options Data Indicative Feed", status: "OFFLINE", latency_ms: 0, endpoint: "Alpaca Options Feed", healthy: false },
        { name: "Google Gemini 3.6 Pro API", status: "OFFLINE", latency_ms: 0, endpoint: "Google GenAI API", healthy: false },
        { name: "VOLTRON Risk Engine", status: "OFFLINE", latency_ms: 0, endpoint: "risk.risk_engine", healthy: false },
        { name: "Paper Execution Engine", status: "DISABLED", latency_ms: 0, endpoint: "VOLTRON_TRADING_ENABLED=false", healthy: true },
        { name: "WebSocket Stream", status: "NOT_DEPLOYED", latency_ms: 0, endpoint: "HTTP REST Polling", healthy: true },
      ],
    };
  }
}

export async function askCopilot(
  message: string,
  symbol = "SPY"
): Promise<{ reply: string; intent?: string; symbol?: string; data?: any }> {
  try {
    const res = await fetch(`${API_BASE}/copilot/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, symbol }),
    });
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      reply: "VOLTRON Backend is offline. Please start the Python backend to use Gemini AI Copilot.",
    };
  }
}

export async function controlAgent(action: "start" | "pause" | "stop" | "step"): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/agent/${action}`, { method: "POST" });
    return await res.json();
  } catch {
    return { status: action.toUpperCase(), message: `Agent ${action} executed.` };
  }
}
