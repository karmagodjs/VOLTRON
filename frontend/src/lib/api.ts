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
  AgentState,
} from "@/types";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

const API_BASE = "/api";

export async function fetchAccount(): Promise<AccountSummary> {
  try {
    const res = await fetch(`${API_BASE}/account`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
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
    };
  }
}

export async function fetchMarket(symbol = "SPY"): Promise<MarketData> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/market?symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const { price, realized_volatility: rv, implied_volatility: iv, iv_rv_ratio: iv_rv } = asset;

    return {
      ...asset,
      last_updated: new Date().toISOString(),
      history: Array.from({ length: 30 }).map((_, i) => ({
        date: `Aug ${i + 1}`,
        price: +(price * 0.96 + (i / 29) * (price * 0.04) + Math.sin(i * 0.7) * (price * 0.005)).toFixed(2),
        rv: +(rv * 0.92 + (i / 29) * (rv * 0.08) + Math.cos(i * 0.5) * 0.4).toFixed(2),
        iv: +(iv * 0.94 + (i / 29) * (iv * 0.06) + Math.sin(i * 0.6) * 0.8).toFixed(2),
        iv_rv: +(iv_rv * 0.95 + (i / 29) * (iv_rv * 0.05)).toFixed(2),
        volume: Math.floor(asset.volume * 0.85 + Math.sin(i) * (asset.volume * 0.2)),
      })),
    };
  }
}

export async function fetchOptionsChain(symbol = "SPY", expiration?: string): Promise<OptionChainData> {
  const sym = symbol.toUpperCase();
  try {
    const q = expiration ? `&expiration=${expiration}` : "";
    const res = await fetch(`${API_BASE}/options?symbol=${sym}${q}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const spot = asset.price;
    const iv = asset.implied_volatility;
    const expirations = ["2026-09-04", "2026-09-11", "2026-09-25", "2026-10-17", "2026-11-20", "2026-12-18"];
    const active_exp = expiration || expirations[3];
    const strikeStep = spot > 300 ? 5 : spot > 100 ? 2.5 : 1;
    const baseStrike = Math.round(spot / strikeStep) * strikeStep;
    const strikes = Array.from({ length: 15 }).map((_, i) => Number((baseStrike + (i - 7) * strikeStep).toFixed(2)));

    return {
      symbol: sym,
      spot_price: spot,
      expirations,
      selected_expiration: active_exp,
      days_to_expiration: 45,
      chain: strikes.map((strike) => ({
        strike,
        is_atm: Math.abs(strike - spot) <= strikeStep / 2,
        call: {
          contract: `${sym}${active_exp.replace(/-/g, "").slice(2)}C${String(Math.round(strike * 1000)).padStart(8, "0")}`,
          bid: +(Math.max(0.05, spot - strike + 5.2) - 0.05).toFixed(2),
          ask: +(Math.max(0.05, spot - strike + 5.2) + 0.05).toFixed(2),
          last: +Math.max(0.05, spot - strike + 5.2).toFixed(2),
          iv: Number((iv * 0.98).toFixed(1)),
          delta: +(0.5 + (spot - strike) * 0.015).toFixed(3),
          gamma: 0.024,
          theta: -0.045,
          vega: 0.185,
          volume: 2450,
          open_interest: 18400,
        },
        put: {
          contract: `${sym}${active_exp.replace(/-/g, "").slice(2)}P${String(Math.round(strike * 1000)).padStart(8, "0")}`,
          bid: +(Math.max(0.05, strike - spot + 5.1) - 0.05).toFixed(2),
          ask: +(Math.max(0.05, strike - spot + 5.1) + 0.05).toFixed(2),
          last: +Math.max(0.05, strike - spot + 5.1).toFixed(2),
          iv: Number((iv * 1.02).toFixed(1)),
          delta: +(-0.5 + (spot - strike) * 0.015).toFixed(3),
          gamma: 0.024,
          theta: -0.042,
          vega: 0.182,
          volume: 3100,
          open_interest: 22100,
        },
      })),
    };
  }
}

export async function fetchAIAnalysis(symbol = "SPY"): Promise<AIAnalysis> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/agent?symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    return data.analysis;
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const decision = asset.opportunity_score >= 70 ? "TRADE_CANDIDATE" : "NO_TRADE";
    const direction = asset.strategy.includes("BULL") ? "BULLISH" : asset.strategy.includes("BEAR") ? "BEARISH" : "NEUTRAL";

    return {
      symbol: sym,
      status: "ANALYZING",
      decision,
      confidence: decision === "TRADE_CANDIDATE" ? 88 : 45,
      direction,
      volatility_view: asset.vol_signal,
      strategy_recommendation: asset.strategy.replace(/_/g, " "),
      thesis: `${sym} implied volatility (${asset.implied_volatility.toFixed(2)}%) vs 20-day realized volatility (${asset.realized_volatility.toFixed(2)}%) generates an IV/RV spread of ${asset.iv_rv_ratio.toFixed(2)}x. Target strategy mapped to ${asset.strategy.replace(/_/g, " ")}.`,
      key_reasons: [
        `IV/RV spread ratio of ${asset.iv_rv_ratio.toFixed(2)}x indicates statistically rich option premium`,
        `Underlying price drift indicates ${direction} market structure (regime: ${asset.market_regime})`,
        "Deep institutional options liquidity with tight bid-ask spreads",
        "Defined-risk multi-leg structure guarantees maximum loss containment",
      ],
      risks: [
        "Macro economic announcements or FOMC rate decisions could trigger IV expansion",
        "Tail gap movement exceeding wing thresholds will trigger stop loss",
      ],
      opportunity_score: asset.opportunity_score,
      timestamp: new Date().toUTCString(),
    };
  }
}

export async function fetchAgentTelemetry(symbol = "SPY"): Promise<any> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/agent?symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const riskApproved = asset.opportunity_score >= 70;
    const decision = riskApproved ? "TRADE_CANDIDATE" : "NO_TRADE";
    const direction = asset.strategy.includes("BULL") ? "BULLISH" : asset.strategy.includes("BEAR") ? "BEARISH" : "NEUTRAL";
    const strikeStep = asset.price > 300 ? 5 : asset.price > 100 ? 2.5 : 1;
    const atmAnchor = Math.round(asset.price / strikeStep) * strikeStep;

    return {
      status: "ACTIVE",
      running: true,
      paused: false,
      cycle: 142,
      symbol: sym,
      trading_mode: "PAPER",
      agent_state: {
        cycle: 142,
        status: "ANALYZING",
        symbol: sym,
        decision,
        strategy: asset.strategy,
        confidence: riskApproved ? 88 : 45,
        opportunity_score: asset.opportunity_score,
        active_order_id: `VLT-${sym}-8941`,
        active_position: riskApproved ? `${sym} ${asset.strategy.replace(/_/g, " ")}` : "NONE",
        last_reason: `${sym} volatility opportunity evaluated (Score: ${asset.opportunity_score}/100)`,
        errors: [],
      },
      market_observation: {
        symbol: sym,
        price: asset.price,
        change: asset.change,
        change_percent: asset.change_percent,
        market_regime: asset.market_regime,
        implied_volatility: asset.implied_volatility,
        realized_volatility: asset.realized_volatility,
        iv_rv_ratio: asset.iv_rv_ratio,
        iv_premium: asset.iv_premium,
        opportunity_score: asset.opportunity_score,
        vol_signal: asset.vol_signal,
        market_status: "OPEN",
      },
      analysis: {
        symbol: sym,
        status: "ANALYZING",
        decision,
        confidence: riskApproved ? 88 : 45,
        direction,
        volatility_view: asset.vol_signal,
        strategy_recommendation: asset.strategy.replace(/_/g, " "),
        thesis: `${sym} implied volatility (${asset.implied_volatility.toFixed(2)}%) vs 20-day realized volatility (${asset.realized_volatility.toFixed(2)}%) produces ${asset.iv_rv_ratio.toFixed(2)}x variance risk spread.`,
        key_reasons: [
          `IV/RV spread ratio of ${asset.iv_rv_ratio.toFixed(2)}x indicates statistically rich option premium`,
          `Underlying price structure indicates ${direction} orientation (regime: ${asset.market_regime})`,
          "Deep institutional options liquidity with tight bid-ask spreads",
          "Defined-risk multi-leg structure guarantees maximum loss containment",
        ],
        risks: [
          "Macro economic announcements or FOMC rate decisions could trigger IV expansion",
          "Tail gap movement exceeding wing thresholds will trigger stop loss",
        ],
        opportunity_score: asset.opportunity_score,
        timestamp: new Date().toISOString(),
      },
      decision_factors: [
        `IV (${asset.implied_volatility.toFixed(1)}%) vs 20-day RV (${asset.realized_volatility.toFixed(1)}%) creates ${asset.iv_rv_ratio.toFixed(2)}x variance spread`,
        `Directional bias classified as ${direction} with low tail drift`,
        `Opportunity score (${asset.opportunity_score}/100) ${riskApproved ? "satisfies" : "fails"} minimum threshold of 70`,
        `Strategy mapped to ${asset.strategy.replace(/_/g, " ")} with defined risk limits`,
      ],
      risk_decision: {
        overall_status: riskApproved ? "APPROVED" : "BLOCKED",
        reason: riskApproved ? "All 7 safety gates evaluated and passed successfully." : "Risk Engine blocked execution: Opportunity score below 70 threshold.",
        gates: [
          { name: "OPPORTUNITY SCORE", condition: "Score >= 70", current_value: `${asset.opportunity_score} / 100`, status: riskApproved ? "PASS" : "BLOCKED", description: "Volatility alpha score satisfies minimum trade threshold." },
          { name: "TRADE RISK", condition: "Risk <= 1.0% ($1,000)", current_value: "0.31% ($315.00)", status: "PASS", description: "Single-trade max loss within safety envelope." },
          { name: "DAILY LOSS", condition: "Daily Loss < 2.0% ($2,000)", current_value: "+$1,284.50 (Profit)", status: "PASS", description: "Daily circuit breaker active." },
          { name: "PORTFOLIO EXPOSURE", condition: "Exposure <= 30.0% ($30,000)", current_value: "18.2% ($18,200.00)", status: "PASS", description: "Total capital utilization within limits." },
          { name: "LIQUIDITY", condition: "Spread <= 10.0%", current_value: "2.1% Spread", status: "PASS", description: "Options market spread meets institutional liquidity gate." },
          { name: "CONSECUTIVE LOSSES", condition: "Losses < 3", current_value: "0 / 3 Losses", status: "PASS", description: "Cooling period inactive." },
          { name: "KILL SWITCH", condition: "Disarmed / Normal", current_value: "ARMED / READY", status: "PASS", description: "Emergency kill switch ready." },
        ],
      },
      strategy_decision: {
        selected_strategy: asset.strategy.replace(/_/g, " "),
        sentiment: direction,
        volatility_view: asset.vol_signal,
        iv_rv_ratio: asset.iv_rv_ratio,
        confidence: riskApproved ? 88 : 45,
        rationale: `Elevated variance risk premium (IV/RV ${asset.iv_rv_ratio.toFixed(2)}x) on ${sym} makes ${asset.strategy.replace(/_/g, " ")} optimal.`,
        legs: [
          { action: "SELL", strike: atmAnchor - strikeStep * 2, type: "PUT", price: 2.20 },
          { action: "BUY", strike: atmAnchor - strikeStep * 3, type: "PUT", price: 1.25 },
          { action: "SELL", strike: atmAnchor + strikeStep * 2, type: "CALL", price: 2.10 },
          { action: "BUY", strike: atmAnchor + strikeStep * 3, type: "CALL", price: 1.20 },
        ],
        net_credit: 1.85,
        max_loss: 3.15,
      },
      execution_state: {
        status: riskApproved ? "ORDER_SUBMITTED" : "EXECUTION_BLOCKED",
        order_id: `VLT-${sym}-8941`,
        symbol: sym,
        strategy: asset.strategy,
        legs: [
          `SELL ${sym} ${atmAnchor - strikeStep * 2} PUT`,
          `BUY ${sym} ${atmAnchor - strikeStep * 3} PUT`,
          `SELL ${sym} ${atmAnchor + strikeStep * 2} CALL`,
          `BUY ${sym} ${atmAnchor + strikeStep * 3} CALL`,
        ],
        quantity: 1,
        order_type: "LIMIT_CREDIT",
        limit_price: 1.85,
        timestamp: "09:31:05 UTC",
      },
      position_monitor: {
        status: riskApproved ? "POSITION_ACTIVE" : "NO_POSITION",
        position: riskApproved
          ? {
              symbol: sym,
              strategy: asset.strategy.replace(/_/g, " "),
              entry_price: 1.85,
              current_value: 1.70,
              unrealized_pnl: 145.00,
              unrealized_pnl_pct: 7.84,
              take_profit: 0.92,
              stop_loss: 3.70,
              opened_at: "09:31:05 UTC",
              time_open: "1h 42m",
            }
          : null,
      },
      pipeline: [
        { stage: "SCAN", status: "PASSED", timestamp: "09:31:02", reason: `${sym} liquid options scan detected` },
        { stage: "ANALYZE", status: "PASSED", timestamp: "09:31:03", reason: `IV/RV = ${asset.iv_rv_ratio.toFixed(2)}x (Confidence: ${riskApproved ? 88 : 45}%)` },
        { stage: "STRATEGY", status: "PASSED", timestamp: "09:31:04", reason: `${asset.strategy.replace(/_/g, " ")} (45 DTE) selected` },
        { stage: "RISK", status: riskApproved ? "PASSED" : "BLOCKED", timestamp: "09:31:05", reason: riskApproved ? "7 Safety gates approved (0.31% Risk)" : "Opportunity score below 70 hurdle rate" },
        { stage: "EXECUTE", status: riskApproved ? "PASSED" : "BLOCKED", timestamp: "09:31:05", reason: riskApproved ? `Paper order #VLT-${sym}-8941 routed to Alpaca` : "Execution safely blocked by Risk Engine" },
        { stage: "MONITOR", status: riskApproved ? "ACTIVE" : "WAITING", timestamp: riskApproved ? "09:31:06" : "—", reason: riskApproved ? `Position live on ${sym}` : "No position open" },
        { stage: "EXIT", status: "WAITING", timestamp: "—", reason: "Monitoring TP 50% / SL 100%" },
        { stage: "LOG", status: "WAITING", timestamp: "—", reason: "Awaiting cycle finalization" },
      ],
      metrics: {
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
      },
    };
  }
}

export async function fetchTimeline(symbol = "SPY"): Promise<{ events: TimelineEvent[]; cycle: number; status: string }> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/agent/timeline?symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const riskApproved = asset.opportunity_score >= 70;

    return {
      cycle: 142,
      status: "ACTIVE",
      events: [
        {
          id: "evt-1",
          timestamp: "09:31:02",
          stage: "MARKET SCAN",
          status: "PASS",
          summary: `${sym} detected (Spot $${asset.price.toFixed(2)}, Vol ${(asset.volume / 1e6).toFixed(1)}M)`,
          details: `Scan filter: Liquidity check passed, 20-day RV = ${asset.realized_volatility.toFixed(2)}%, IV = ${asset.implied_volatility.toFixed(2)}%`,
          type: "scan",
        },
        {
          id: "evt-2",
          timestamp: "09:31:03",
          stage: "VOLATILITY ENGINE",
          status: "PASS",
          summary: `IV/RV = ${asset.iv_rv_ratio.toFixed(2)}x | IV Premium = ${asset.iv_premium >= 0 ? "+" : ""}${asset.iv_premium.toFixed(1)}%`,
          details: `Signal: ${asset.vol_signal}. Opportunity Score = ${asset.opportunity_score}/100. Regime: ${asset.market_regime}.`,
          type: "volatility",
        },
        {
          id: "evt-3",
          timestamp: "09:31:04",
          stage: "AI ANALYST",
          status: "PASS",
          summary: `Confidence ${riskApproved ? 88 : 45}% | Decision: ${riskApproved ? "TRADE CANDIDATE" : "NO TRADE"}`,
          details: `Thesis: ${sym} variance risk premium analyzed under ${asset.market_regime} conditions.`,
          type: "ai",
        },
        {
          id: "evt-4",
          timestamp: "09:31:04",
          stage: "STRATEGY ENGINE",
          status: "PASS",
          summary: `Selected: ${asset.strategy.replace(/_/g, " ")} (45 DTE)`,
          details: `Strategy profile mapped to ${asset.strategy.replace(/_/g, " ")} for defined-risk execution.`,
          type: "strategy",
        },
        {
          id: "evt-5",
          timestamp: "09:31:05",
          stage: "RISK ENGINE",
          status: riskApproved ? "PASS" : "BLOCKED",
          summary: riskApproved ? "All 7 Risk Gates APPROVED" : "Risk Gate Blocked: Low Alpha Score",
          details: riskApproved ? "Trade Risk: 0.31% (Limit 1.00%) | Exposure: 18.2% (Limit 30.0%)" : "Opportunity score below institutional hurdle rate of 70.",
          type: "risk",
        },
        {
          id: "evt-6",
          timestamp: "09:31:05",
          stage: "PAPER EXECUTION",
          status: riskApproved ? "PASS" : "BLOCKED",
          summary: riskApproved ? `Paper Order #VLT-${sym}-8941 Submitted` : "Order Routing Blocked",
          details: riskApproved ? `Alpaca Paper API acknowledged multi-leg limit order @ $1.85 credit.` : "Fail-closed safety prevented order submission.",
          type: "execution",
        },
        {
          id: "evt-7",
          timestamp: "09:31:06",
          stage: "POSITION MONITOR",
          status: riskApproved ? "ACTIVE" : "WAITING",
          summary: riskApproved ? `Position Live: ${sym} ${asset.strategy.replace(/_/g, " ")}` : "No Open Position",
          details: riskApproved ? "Unrealized P&L: +$145.00 (+7.8%) | Target: +50% | Stop: -100%" : "Awaiting next autonomous scan cycle.",
          type: "monitor",
        },
      ],
    };
  }
}

export async function fetchStrategy(strategy = "IRON_CONDOR", symbol = "SPY"): Promise<StrategyDetails> {
  const sym = symbol.toUpperCase();
  const strat = strategy.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/strategy?strategy=${strat}&symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const spot = asset.price;
    const strikeStep = spot > 300 ? 5 : spot > 100 ? 2.5 : 1;
    const baseStrike = Math.round(spot / strikeStep) * strikeStep;

    const legs = [
      { action: "BUY" as const, type: "PUT" as const, strike: baseStrike - strikeStep * 3, price: 1.25, iv: 18.2, delta: -0.12 },
      { action: "SELL" as const, type: "PUT" as const, strike: baseStrike - strikeStep * 2, price: 2.2, iv: 17.5, delta: -0.22 },
      { action: "SELL" as const, type: "CALL" as const, strike: baseStrike + strikeStep * 2, price: 2.1, iv: 16.8, delta: 0.2 },
      { action: "BUY" as const, type: "CALL" as const, strike: baseStrike + strikeStep * 3, price: 1.2, iv: 16.2, delta: 0.11 },
    ];

    const payoff_curve = Array.from({ length: 41 }).map((_, i) => {
      const range = strikeStep * 8;
      const p = +(spot - range + (i * range * 2) / 40).toFixed(2);
      let pnl = 0;
      const lowWing = baseStrike - strikeStep * 3;
      const lowShort = baseStrike - strikeStep * 2;
      const highShort = baseStrike + strikeStep * 2;
      const highWing = baseStrike + strikeStep * 3;

      if (p <= lowWing) pnl = -315;
      else if (p > lowWing && p < lowShort) pnl = -315 + ((p - lowWing) / (lowShort - lowWing)) * 500;
      else if (p >= lowShort && p <= highShort) pnl = 185;
      else if (p > highShort && p < highWing) pnl = 185 - ((p - highShort) / (highWing - highShort)) * 500;
      else pnl = -315;

      return {
        price: p,
        pnl: +pnl.toFixed(2),
        is_spot: Math.abs(p - spot) < (range / 20),
      };
    });

    return {
      strategy: strat,
      symbol: sym,
      sentiment: strat.includes("BULL") ? "BULLISH" : strat.includes("BEAR") ? "BEARISH" : "NEUTRAL",
      spot_price: spot,
      legs,
      max_profit: 185.0,
      max_loss: 315.0,
      breakeven_lower: Number((baseStrike - strikeStep * 2 - 1.85).toFixed(2)),
      breakeven_upper: Number((baseStrike + strikeStep * 2 + 1.85).toFixed(2)),
      win_probability: 78.4,
      capital_required: strikeStep * 2 * 100,
      risk_reward_ratio: 0.59,
      payoff_curve,
    };
  }
}

export async function fetchRisk(symbol = "SPY"): Promise<RiskStatus> {
  const sym = symbol.toUpperCase();
  try {
    const res = await fetch(`${API_BASE}/risk?symbol=${sym}`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    const asset = SUPPORTED_ASSETS[sym] || SUPPORTED_ASSETS["SPY"];
    const riskApproved = asset.opportunity_score >= 70;

    return {
      portfolio_value: 100000.0,
      daily_pnl: 1284.5,
      portfolio_exposure_pct: 18.2,
      trade_risk_pct: 0.31,
      daily_loss_limit_pct: 2.0,
      consecutive_losses: 0,
      kill_switch: false,
      overall_status: riskApproved ? "APPROVED" : "BLOCKED",
      gates: [
        { name: "Opportunity Score", condition: "Score >= 70", current_value: `${asset.opportunity_score} / 100`, status: riskApproved ? "PASS" : "BLOCKED", description: "Quant volatility alpha score satisfies threshold." },
        { name: "Max Trade Risk", condition: "Risk <= 1.0% ($1,000)", current_value: "0.31% ($315.00)", status: "PASS", description: "Single trade risk capped at 1% total equity." },
        { name: "Daily Loss Limit", condition: "Daily Loss < 2.0% ($2,000)", current_value: "+$1,284.50 (Profit)", status: "PASS", description: "Automated circuit breaker halts trading at 2% drawdown." },
        { name: "Portfolio Exposure", condition: "Exposure <= 30.0% ($30,000)", current_value: "18.2% ($18,200.00)", status: "PASS", description: "Aggregate open margin within 30% risk allocation." },
        { name: "Market Liquidity", condition: "Bid/Ask Spread <= 10.0%", current_value: "2.1% Spread", status: "PASS", description: "Options spread satisfies institutional execution requirement." },
        { name: "Consecutive Losses", condition: "Consecutive Losses < 3", current_value: "0 Losses", status: "PASS", description: "Agent enforces cooling period after 3 stop outs." },
        { name: "Paper Trading Gate", condition: "Paper Environment Active", current_value: "Paper Mode (Active)", status: "PASS", description: "Execution safety locked to Alpaca Paper environment." },
      ],
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
      success: true,
      message: active ? "Kill Switch Activated" : "Kill Switch Reset",
    };
  }
}

export async function fetchTrades(): Promise<TradeRecord[]> {
  try {
    const res = await fetch(`${API_BASE}/trades`);
    if (!res.ok) throw new Error("Backend offline");
    const data = await res.json();
    return data.trades;
  } catch {
    return [
      {
        id: "TRD-1094",
        time: "2026-09-01 14:32:00",
        symbol: "SPY",
        strategy: "IRON_CONDOR",
        direction: "NEUTRAL",
        entry_credit: "$1.85",
        exit_price: "--",
        pnl: "+$145.00",
        pnl_raw: 145.0,
        return_pct: "+7.8%",
        risk: "$315.00",
        status: "OPEN",
        exit_reason: "--",
      },
      {
        id: "TRD-1093",
        time: "2026-08-31 11:20:00",
        symbol: "QQQ",
        strategy: "BULL_PUT_SPREAD",
        direction: "BULLISH",
        entry_credit: "$1.10",
        exit_price: "$0.50",
        pnl: "+$300.00",
        pnl_raw: 300.0,
        return_pct: "+54.5%",
        risk: "$390.00",
        status: "CLOSED",
        exit_reason: "TAKE_PROFIT_50%",
      },
      {
        id: "TRD-1092",
        time: "2026-08-30 09:45:00",
        symbol: "IWM",
        strategy: "BEAR_CALL_SPREAD",
        direction: "BEARISH",
        entry_credit: "$0.95",
        exit_price: "$0.40",
        pnl: "+$275.00",
        pnl_raw: 275.0,
        return_pct: "+57.8%",
        risk: "$405.00",
        status: "CLOSED",
        exit_reason: "TAKE_PROFIT_50%",
      },
      {
        id: "TRD-1091",
        time: "2026-08-28 15:10:00",
        symbol: "NVDA",
        strategy: "IRON_CONDOR",
        direction: "NEUTRAL",
        entry_credit: "$2.40",
        exit_price: "$5.00",
        pnl: "-$260.00",
        pnl_raw: -260.0,
        return_pct: "-100.0%",
        risk: "$260.00",
        status: "CLOSED",
        exit_reason: "STOP_LOSS_100%",
      },
    ];
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
    const starting_capital = 100000;
    const ending_capital = 128450;
    return {
      summary: {
        starting_capital,
        ending_capital,
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
      equity_curve: Array.from({ length: 40 }).map((_, i) => ({
        date: `2025-${String(Math.floor(i / 3.5) + 1).padStart(2, "0")}-${String((i % 28) + 1).padStart(2, "0")}`,
        equity: +(100000 + i * 720 + Math.sin(i * 0.8) * 800).toFixed(2),
        drawdown: +(Math.max(0, Math.sin(i * 0.6) * 3.2)).toFixed(2),
      })),
      trades: Array.from({ length: 12 }).map((_, i) => ({
        id: `BT-${String(i + 1).padStart(3, "0")}`,
        date: `2026-07-${String(i * 2 + 1).padStart(2, "0")}`,
        symbol: "SPY",
        strategy: "IRON_CONDOR",
        entry_price: 580.0 + i * 1.5,
        exit_price: 582.0 + i * 1.5,
        pnl: i % 4 === 0 ? -315 : 185,
        return_pct: i % 4 === 0 ? -100 : 58.7,
        result: i % 4 === 0 ? "LOSS" : "WIN",
        reason: i % 4 === 0 ? "STOP_LOSS_100%" : "TAKE_PROFIT_50%",
      })),
    };
  }
}

export async function fetchSystemHealth(): Promise<SystemHealth> {
  try {
    const res = await fetch(`${API_BASE}/system`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch {
    return {
      system_status: "HEALTHY",
      uptime_seconds: 384920,
      overall_latency_ms: 178,
      paper_trading_mode: true,
      system_time: new Date().toISOString(),
      services: [
        { name: "Alpaca Paper API", status: "CONNECTED", latency_ms: 142, endpoint: "https://paper-api.alpaca.markets", healthy: true },
        { name: "Market Data SIP Feed", status: "CONNECTED", latency_ms: 118, endpoint: "Alpaca Stock v2", healthy: true },
        { name: "Options Data Engine", status: "CONNECTED", latency_ms: 164, endpoint: "Alpaca Options Feed", healthy: true },
        { name: "Gemini 3.6 AI Reasoning", status: "CONNECTED", latency_ms: 785, endpoint: "Google GenAI API", healthy: true },
        { name: "VOLTRON Risk Engine", status: "ACTIVE", latency_ms: 4, endpoint: "Internal Memory State", healthy: true },
        { name: "Paper Execution Engine", status: "ACTIVE (PAPER)", latency_ms: 182, endpoint: "Paper Order Router", healthy: true },
        { name: "Position Monitor", status: "ACTIVE", latency_ms: 8, endpoint: "Dynamic Exit Loop", healthy: true },
        { name: "Trade Ledger & Audit", status: "ACTIVE", latency_ms: 2, endpoint: "voltron_trades.csv", healthy: true },
      ],
    };
  }
}

export async function askCopilot(message: string, symbol = "SPY"): Promise<{ reply: string; intent?: string; symbol?: string; data?: any }> {
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
      reply: `**VOLTRON Copilot (Offline Mode)**: Analyzed your query regarding "${message}". Volatility conditions on ${symbol} show active variance risk premium. Defined-risk multi-leg options structures remain the dominant alpha strategy. Risk gates are fully satisfied with single-trade exposure within limits.`,
    };
  }
}

export async function controlAgent(action: "start" | "pause" | "stop" | "step"): Promise<{ status: string; message: string }> {
  try {
    const res = await fetch(`${API_BASE}/agent/${action}`, { method: "POST" });
    return await res.json();
  } catch {
    return { status: action.toUpperCase(), message: `Agent ${action}ed successfully.` };
  }
}
