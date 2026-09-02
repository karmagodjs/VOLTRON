export type MarketStatus = "OPEN" | "CLOSED" | "PRE_MARKET" | "AFTER_HOURS";

export interface MarketHistoryPoint {
  date: string;
  price: number;
  rv: number;
  iv: number;
  iv_rv: number;
  volume: number;
}

export interface MarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  high: number;
  low: number;
  volume: number;
  realized_volatility: number;
  implied_volatility: number;
  iv_rv_ratio: number;
  iv_premium: number;
  opportunity_score: number;
  market_regime: string;
  vol_signal: "IV EXPENSIVE" | "IV CHEAP" | "IV FAIR";
  market_status: MarketStatus;
  last_updated: string;
  history: MarketHistoryPoint[];
}

export interface OptionGreek {
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
}

export interface OptionContract {
  contract: string;
  bid: number;
  ask: number;
  last: number;
  iv: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  volume: number;
  open_interest: number;
}

export interface OptionChainRow {
  strike: number;
  is_atm: boolean;
  call: OptionContract;
  put: OptionContract;
}

export interface OptionChainData {
  symbol: string;
  spot_price: number;
  expirations: string[];
  selected_expiration: string;
  days_to_expiration: number;
  chain: OptionChainRow[];
}

export interface AIAnalysis {
  symbol: string;
  status: "ANALYZING" | "IDLE" | "COMPLETE" | "TRADE_CANDIDATE" | "NO_TRADE";
  decision: "TRADE_CANDIDATE" | "NO_TRADE";
  confidence: number;
  direction: "BULLISH" | "BEARISH" | "NEUTRAL";
  volatility_view: "EXPENSIVE" | "CHEAP" | "FAIR";
  strategy_recommendation: string;
  thesis: string;
  key_reasons: string[];
  risks: string[];
  opportunity_score: number;
  timestamp: string;
}

export interface AgentState {
  cycle: number;
  status: "IDLE" | "ANALYZING" | "COMPLETE" | "PAUSED" | "STOPPED";
  symbol: string | null;
  decision: "TRADE_CANDIDATE" | "NO_TRADE" | null;
  strategy: string | null;
  confidence: number;
  opportunity_score: number;
  active_order_id: string | null;
  active_position: string | null;
  last_reason: string | null;
  errors: string[];
}

export interface TimelineEvent {
  id: string;
  timestamp: string;
  stage: string;
  status: "PASS" | "FAIL" | "ACTIVE" | "BLOCKED" | "PENDING";
  summary: string;
  details: string;
  type: "scan" | "volatility" | "ai" | "strategy" | "risk" | "execution" | "monitor";
}

export interface StrategyLeg {
  action: "BUY" | "SELL";
  type: "CALL" | "PUT";
  strike: number;
  price: number;
  iv: number;
  delta: number;
}

export interface PayoffPoint {
  price: number;
  pnl: number;
  is_spot?: boolean;
}

export interface StrategyDetails {
  strategy: string;
  symbol: string;
  sentiment: string;
  spot_price: number;
  legs: StrategyLeg[];
  max_profit: number;
  max_loss: number;
  breakeven_lower: number | null;
  breakeven_upper: number | null;
  win_probability: number;
  capital_required: number;
  risk_reward_ratio: number;
  payoff_curve: PayoffPoint[];
}

export interface RiskGate {
  name: string;
  condition: string;
  current_value: string;
  status: "PASS" | "BLOCKED";
  description: string;
}

export interface RiskStatus {
  portfolio_value: number;
  daily_pnl: number;
  portfolio_exposure_pct: number;
  trade_risk_pct: number;
  daily_loss_limit_pct: number;
  consecutive_losses: number;
  kill_switch: boolean;
  overall_status: "APPROVED" | "BLOCKED";
  gates: RiskGate[];
}

export interface AccountSummary {
  equity: number;
  cash: number;
  buying_power: number;
  portfolio_value: number;
  daily_pnl: number;
  daily_pnl_percent: number;
  unrealized_pnl: number;
  realized_pnl: number;
  portfolio_exposure_pct: number;
  open_positions_count: number;
  status: string;
  trading_blocked: boolean;
  paper_mode: boolean;
  kill_switch_active: boolean;
}

export interface PositionLeg {
  type: string;
  strike: number;
  price: number;
  current: number;
  delta: number;
}

export interface OpenPosition {
  id: string;
  symbol: string;
  strategy: string;
  opened_at: string;
  expiration: string;
  spot_at_entry: number;
  current_spot: number;
  net_credit: number;
  current_cost_to_close: number;
  unrealized_pnl: number;
  unrealized_pnl_pct: number;
  max_profit: number;
  max_loss: number;
  take_profit_target: number;
  stop_loss_limit: number;
  delta: number;
  theta: number;
  vega: number;
  legs: PositionLeg[];
}

export interface TradeRecord {
  id: string;
  time: string;
  symbol: string;
  strategy: string;
  direction: "NEUTRAL" | "BULLISH" | "BEARISH";
  entry_credit: string;
  exit_price: string;
  pnl: string;
  pnl_raw: number;
  return_pct: string;
  risk: string;
  status: "OPEN" | "CLOSED" | "REJECTED" | "CANCELLED";
  exit_reason: string;
}

export interface BacktestSummary {
  starting_capital: number;
  ending_capital: number;
  total_return_pct: number;
  cagr: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  avg_trade_pnl: number;
  largest_win: number;
  largest_loss: number;
}

export interface BacktestTrade {
  id: string;
  date: string;
  symbol: string;
  strategy: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  return_pct: number;
  result: "WIN" | "LOSS";
  reason: string;
}

export interface BacktestResult {
  summary: BacktestSummary;
  parameters: {
    strategy: string;
    symbol: string;
    start_date: string;
    end_date: string;
    iv_rv_threshold: number;
    confidence_threshold: number;
    risk_per_trade_pct: number;
    max_exposure_pct: number;
  };
  equity_curve: { date: string; equity: number; drawdown: number }[];
  trades: BacktestTrade[];
}

export interface ServiceHealth {
  name: string;
  status: string;
  latency_ms: number;
  endpoint: string;
  healthy: boolean;
}

export interface SystemHealth {
  system_status: "HEALTHY" | "KILL_SWITCH_ENGAGED" | "DEGRADED";
  uptime_seconds: number;
  overall_latency_ms: number;
  paper_trading_mode: boolean;
  services: ServiceHealth[];
  system_time: string;
}
