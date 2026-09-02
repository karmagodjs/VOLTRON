"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  fetchAgentTelemetry,
  fetchTimeline,
  controlAgent,
  toggleKillSwitch,
} from "@/lib/api";
import {
  Play,
  Pause,
  Square,
  ChevronDown,
  X,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

const symbols = ["SPY", "QQQ", "IWM", "NVDA", "AAPL", "TSLA", "MSFT", "AMZN"];

import { useMarket } from "@/context/MarketContext";

function AgentCommandCenterContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedSymbol, setSelectedSymbol } = useMarket();
  const querySymbol = searchParams.get("symbol")?.toUpperCase() || selectedSymbol || "SPY";

  const [symbol, setSymbol] = useState(querySymbol);
  const [data, setData] = useState<any>(null);
  const [timeline, setTimeline] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [symbolDropdown, setSymbolDropdown] = useState(false);
  const [killModalOpen, setKillModalOpen] = useState(false);
  const [secondsToNext, setSecondsToNext] = useState(24);

  // Sync if query param or context changes externally
  useEffect(() => {
    if (querySymbol && querySymbol !== symbol && symbols.includes(querySymbol)) {
      setSymbol(querySymbol);
      setData(null);
      setLoading(true);
    }
  }, [querySymbol]);

  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== symbol && symbols.includes(selectedSymbol)) {
      setSymbol(selectedSymbol);
      setData(null);
      setLoading(true);
    }
  }, [selectedSymbol]);

  const loadData = async (targetSymbol = symbol) => {
    try {
      const [tel, t] = await Promise.all([
        fetchAgentTelemetry(targetSymbol),
        fetchTimeline(targetSymbol),
      ]);
      setData(tel);
      setTimeline(t);
      setError(null);
    } catch (err: any) {
      setError(err?.message || `Failed to fetch telemetry for ${targetSymbol}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectSymbol = (newSymbol: string) => {
    setSymbol(newSymbol);
    setSelectedSymbol(newSymbol, true);
    setSymbolDropdown(false);
    setData(null); // CRITICAL DATA ISOLATION: Clear previous symbol data during loading
    setLoading(true);
    router.replace(`/agent?symbol=${newSymbol}`);
    loadData(newSymbol);
  };

  useEffect(() => {
    loadData(symbol);
    const interval = setInterval(() => loadData(symbol), 6000);
    return () => clearInterval(interval);
  }, [symbol]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNext((prev) => {
        if (prev <= 1) {
          loadData(symbol);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [symbol]);

  const handleControl = async (action: "start" | "pause" | "stop" | "step") => {
    await controlAgent(action);
    loadData(symbol);
  };

  const handleEmergencyStop = async () => {
    await toggleKillSwitch(true);
    await controlAgent("stop");
    setKillModalOpen(false);
    loadData(symbol);
  };

  const agentState = data?.agent_state;
  const observation = data?.market_observation;
  const analysis = data?.analysis;
  const factors = data?.decision_factors || [];
  const riskDec = data?.risk_decision;
  const stratDec = data?.strategy_decision;
  const execState = data?.execution_state;
  const posMon = data?.position_monitor;
  const metrics = data?.metrics;
  const pipeline = data?.pipeline || [];

  const statusLabel = agentState?.status || "ANALYZING";
  const isRiskApproved = riskDec?.overall_status === "APPROVED";
  const isNoTrade = analysis?.decision === "NO_TRADE" || !isRiskApproved;
  const hasActivePosition = posMon?.status === "POSITION_ACTIVE" && posMon?.position;

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono text-xs">
        {/* 1. TOP HEADER: VOLTRON INTELLIGENCE — AUTONOMOUS OPTIONS AGENT */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider">
                  VOLTRON INTELLIGENCE
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold uppercase">
                  AUTONOMOUS OPTIONS AGENT
                </span>
              </div>
              <div className="text-[11px] text-voltron-400 mt-0.5">
                Targeting Variance Risk Premium on {symbol} via Alpaca Paper Environment
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            {/* Symbol Selector */}
            <div className="relative">
              <button
                onClick={() => setSymbolDropdown(!symbolDropdown)}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-950 border border-voltron-750 text-white font-bold hover:bg-voltron-800 transition-colors"
              >
                <span className="text-voltron-400 text-[10px] uppercase">Symbol:</span>
                <span className="text-voltron-cyan font-bold">{symbol}</span>
                <ChevronDown className="w-3 h-3 text-voltron-400" />
              </button>
              {symbolDropdown && (
                <div className="absolute right-0 mt-1 w-32 bg-voltron-850 border border-voltron-700 rounded-md shadow-terminal p-1 z-50">
                  {symbols.map((s) => (
                    <button
                      key={s}
                      onClick={() => handleSelectSymbol(s)}
                      className={clsx(
                        "w-full text-left px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                        symbol === s
                          ? "bg-voltron-cyan/15 text-voltron-cyan"
                          : "text-voltron-200 hover:bg-voltron-750"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Current Cycle */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-950 border border-voltron-750">
              <span className="text-voltron-400 text-[10px] uppercase">Cycle:</span>
              <span className="font-bold text-white font-tabular">
                #{agentState?.cycle || timeline?.cycle || 142}
              </span>
            </div>

            {/* Trading Mode */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold">
              <span className="text-voltron-400 text-[10px] uppercase">Mode:</span>
              <span>PAPER</span>
            </div>

            {/* Agent Status */}
            <div
              className={clsx(
                "flex items-center gap-1.5 px-2.5 py-1 rounded font-bold uppercase",
                statusLabel === "ACTIVE" || statusLabel === "ANALYZING"
                  ? "bg-voltron-emerald/15 border border-voltron-emerald/30 text-voltron-emerald"
                  : statusLabel === "PAUSED"
                  ? "bg-voltron-amber/15 border border-voltron-amber/30 text-voltron-amber"
                  : "bg-voltron-rose/15 border border-voltron-rose/30 text-voltron-rose"
              )}
            >
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full inline-block",
                  statusLabel === "ACTIVE" || statusLabel === "ANALYZING"
                    ? "bg-voltron-emerald animate-pulse"
                    : statusLabel === "PAUSED"
                    ? "bg-voltron-amber"
                    : "bg-voltron-rose"
                )}
              ></span>
              ● {statusLabel}
            </div>
          </div>
        </div>

        {/* Loading / Error Banner */}
        {loading && !data && (
          <div className="p-4 rounded-lg bg-voltron-900 border border-voltron-cyan/40 text-voltron-cyan text-xs font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{symbol}: LOADING MARKET DATA & QUANT STATE...</span>
          </div>
        )}

        {error && (
          <div className="p-3 rounded-lg bg-voltron-rose/15 border border-voltron-rose/30 text-voltron-rose text-xs font-mono">
            <span>{symbol}: MARKET DATA UNAVAILABLE — {error}</span>
          </div>
        )}

        {/* 2. AGENT CONTROL CENTER */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-voltron-800 pb-2">
            <div className="flex items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                AGENT CONTROL CENTER
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleControl("start")}
                className="px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-bold text-voltron-emerald border border-voltron-700/80 transition-colors flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-voltron-emerald" />
                <span>START</span>
              </button>

              <button
                onClick={() => handleControl("pause")}
                className="px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-bold text-voltron-amber border border-voltron-700/80 transition-colors flex items-center gap-1.5"
              >
                <Pause className="w-3.5 h-3.5 fill-voltron-amber" />
                <span>PAUSE</span>
              </button>

              <button
                onClick={() => handleControl("stop")}
                className="px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-bold text-voltron-rose border border-voltron-700/80 transition-colors flex items-center gap-1.5"
              >
                <Square className="w-3.5 h-3.5 fill-voltron-rose" />
                <span>STOP</span>
              </button>

              <button
                onClick={() => setKillModalOpen(true)}
                className="px-3 py-1.5 rounded bg-voltron-rose/15 hover:bg-voltron-rose/25 text-[11px] font-bold text-voltron-rose border border-voltron-rose/40 transition-colors"
              >
                <span>EMERGENCY KILL SWITCH</span>
              </button>
            </div>
          </div>

          {/* Telemetry Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Status</span>
              <span className="font-bold text-voltron-emerald">{statusLabel}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Current Cycle</span>
              <span className="font-bold text-white font-tabular">#{agentState?.cycle || 142}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Last Scan</span>
              <span className="font-bold text-white font-tabular">09:31:02 UTC</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Next Scan</span>
              <span className="font-bold text-voltron-cyan font-tabular">{secondsToNext}s</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Current Symbol</span>
              <span className="font-bold text-voltron-cyan">{symbol}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Active Strategy</span>
              <span className="font-bold text-white truncate block">{stratDec?.selected_strategy || "IRON CONDOR"}</span>
            </div>
          </div>
        </div>

        {/* 3. AUTONOMOUS PIPELINE: SCAN → ANALYZE → STRATEGY → RISK → EXECUTE → MONITOR → EXIT → LOG */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
          <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
            <span>AUTONOMOUS EXECUTION PIPELINE</span>
            <span className="text-[10px] text-voltron-emerald font-semibold">8 STAGE ENVELOPE</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {pipeline.map((step: any) => {
              const isPass = step.status === "PASSED";
              const isActive = step.status === "ACTIVE";
              const isBlocked = step.status === "BLOCKED";

              return (
                <div
                  key={step.stage}
                  className={clsx(
                    "p-2 rounded border flex flex-col justify-between transition-all",
                    isActive
                      ? "bg-voltron-950 border-voltron-cyan"
                      : isBlocked
                      ? "bg-voltron-rose/10 border-voltron-rose/40"
                      : isPass
                      ? "bg-voltron-950/80 border-voltron-800"
                      : "bg-voltron-950/40 border-voltron-850 opacity-60"
                  )}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{step.stage}</span>
                    <span
                      className={clsx(
                        "text-[9px] font-bold px-1 rounded",
                        isActive
                          ? "text-voltron-cyan bg-voltron-cyan/15 animate-pulse"
                          : isBlocked
                          ? "text-voltron-rose bg-voltron-rose/15"
                          : isPass
                          ? "text-voltron-emerald bg-voltron-emerald/15"
                          : "text-voltron-400"
                      )}
                    >
                      {isPass ? "PASS" : isBlocked ? "BLOCKED" : isActive ? "LIVE" : "WAIT"}
                    </span>
                  </div>
                  <div className="text-[10px] text-voltron-400 font-tabular">{step.timestamp}</div>
                  <div className="text-[10px] text-voltron-300 truncate mt-1">{step.reason}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 4. VISUAL CENTERPIECE: VOLTRON DECISION CARD */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-800">
          <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-2.5">
            <div className="flex items-center">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                VOLTRON DECISION CENTER
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan font-bold uppercase">
              {symbol} TARGET STATE
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 text-xs">
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Symbol</span>
              <span className="font-bold text-white text-xs">{symbol}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Volatility</span>
              <span className="font-bold text-voltron-emerald text-xs">{observation?.vol_signal || analysis?.volatility_view || "EXPENSIVE"}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Direction</span>
              <span className="font-bold text-voltron-cyan text-xs">{analysis?.direction || "NEUTRAL"}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Confidence</span>
              <span className="font-bold text-voltron-cyan text-xs font-tabular">{analysis?.confidence || 88}%</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Opportunity</span>
              <span className="font-bold text-voltron-emerald text-xs font-tabular">{observation?.opportunity_score ?? 94}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Strategy</span>
              <span className="font-bold text-white text-xs truncate block">{stratDec?.selected_strategy || "IRON CONDOR"}</span>
            </div>
            <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Risk Status</span>
              <span className={clsx("font-bold text-xs", isRiskApproved ? "text-voltron-emerald" : "text-voltron-rose")}>
                {riskDec?.overall_status || "APPROVED"}
              </span>
            </div>
            <div className="p-2 rounded bg-voltron-cyan/15 border border-voltron-cyan/40">
              <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Action</span>
              <span className="font-bold text-voltron-cyan text-xs truncate block">
                {isNoTrade ? "NO TRADE" : "PAPER EXEC"}
              </span>
            </div>
          </div>
        </div>

        {/* 5. 2-COLUMN OPERATIONS WORKSPACE: ROW 1 (MARKET OBSERVATION + AI ANALYST) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Market Observation (5 cols) */}
          <div className="lg:col-span-5 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>MARKET OBSERVATION ({symbol})</span>
              <span className="text-[10px] text-voltron-cyan">{observation?.market_status || "OPEN"}</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Spot Price</span>
                <span className="font-bold text-white text-xs font-tabular">
                  {observation?.price ? `$${observation.price.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Change</span>
                <span className={clsx("font-bold text-xs font-tabular", (observation?.change ?? 0) >= 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                  {observation?.change !== undefined ? `${observation.change >= 0 ? "+" : ""}${observation.change.toFixed(2)} (${observation.change_percent >= 0 ? "+" : ""}${observation.change_percent.toFixed(2)}%)` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Regime</span>
                <span className="font-bold text-white text-xs truncate block">{observation?.market_regime || "HIGH IV SPREAD"}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Implied Vol (IV)</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">
                  {observation?.implied_volatility ? `${observation.implied_volatility.toFixed(2)}%` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Realized Vol (RV)</span>
                <span className="font-bold text-white text-xs font-tabular">
                  {observation?.realized_volatility ? `${observation.realized_volatility.toFixed(2)}%` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">IV / RV Ratio</span>
                <span className="font-bold text-voltron-emerald text-xs font-tabular">
                  {observation?.iv_rv_ratio ? `${observation.iv_rv_ratio.toFixed(2)}x` : "—"}
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center justify-between">
              <div>
                <span className="text-[9px] text-voltron-400 uppercase block">Alpha Edge Signal</span>
                <span className="font-bold text-voltron-emerald text-xs">{observation?.vol_signal || "IV EXPENSIVE"}</span>
              </div>
              <div className="text-right">
                <span className="text-[9px] text-voltron-400 uppercase block">Opportunity Score</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">{observation?.opportunity_score ?? 94} / 100</span>
              </div>
            </div>
          </div>

          {/* AI Analyst & Decision Factors (7 cols) */}
          <div className="lg:col-span-7 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>VOLTRON AI ANALYST & THESIS ({symbol})</span>
              <span className="text-[10px] text-voltron-emerald font-bold">
                CONFIDENCE: {analysis?.confidence || 88}%
              </span>
            </div>

            {/* Core Thesis Box */}
            <div className="p-3 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-cyan font-bold block mb-1">
                Quantitative Thesis
              </span>
              <p className="text-xs text-voltron-200 leading-relaxed font-sans font-normal">
                &ldquo;{analysis?.thesis || `Analyzing variance risk premium and options skew for ${symbol}...`}&rdquo;
              </p>
            </div>

            {/* Structured Decision Factors */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-voltron-emerald font-bold block">
                DECISION FACTORS
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {factors.map((factor: string, i: number) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-voltron-950/70 border border-voltron-800 flex items-start gap-2"
                  >
                    <span className="text-[10px] font-bold text-voltron-emerald px-1 py-0.2 rounded bg-voltron-emerald/10 border border-voltron-emerald/20 flex-shrink-0">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-voltron-200 text-[11px] leading-snug">{factor}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 6. 2-COLUMN OPERATIONS WORKSPACE: ROW 2 (STRATEGY ENGINE + RISK GATES) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Strategy Engine (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>STRATEGY ENGINE</span>
              <span className="text-[10px] text-voltron-cyan font-bold">
                {stratDec?.selected_strategy || "IRON CONDOR"}
              </span>
            </div>

            <div className="grid grid-cols-4 gap-2 text-xs">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Direction</span>
                <span className="font-bold text-white text-xs">{stratDec?.sentiment || "NEUTRAL"}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Volatility</span>
                <span className="font-bold text-voltron-emerald text-xs">{stratDec?.volatility_view || "EXPENSIVE"}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">IV / RV</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">{stratDec?.iv_rv_ratio || observation?.iv_rv_ratio || "1.62"}x</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Net Credit</span>
                <span className="font-bold text-voltron-emerald text-xs font-tabular">${stratDec?.net_credit?.toFixed(2) || "1.85"}</span>
              </div>
            </div>

            {/* Legs breakdown */}
            <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1.5">
              <span className="text-[10px] text-voltron-400 uppercase font-bold block">Selected Option Legs ({symbol})</span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1 text-[11px]">
                {stratDec?.legs?.map((leg: any, idx: number) => (
                  <div key={idx} className="p-1.5 rounded bg-voltron-900 border border-voltron-800 flex justify-between items-center">
                    <span className={leg.action === "SELL" ? "text-voltron-emerald font-bold" : "text-voltron-cyan font-bold"}>
                      {leg.action} {leg.strike}{leg.type[0]}
                    </span>
                    <span className="text-voltron-400">${leg.price}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-voltron-300 leading-relaxed font-sans">
              <strong>Rationale:</strong> {stratDec?.rationale || "Defined-risk credit harvesting optimized for variance premium."}
            </p>
          </div>

          {/* Risk Gate Engine (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>RISK GATE EVALUATION</span>
              <span
                className={clsx(
                  "text-[10px] px-2 py-0.5 rounded font-bold uppercase",
                  isRiskApproved
                    ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                    : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                )}
              >
                {isRiskApproved ? "RISK APPROVED" : "RISK BLOCKED"}
              </span>
            </div>

            {/* 7 Gates Grid */}
            <div className="space-y-1.5 max-h-[190px] overflow-y-auto">
              {riskDec?.gates?.map((gate: any, idx: number) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-voltron-950 border border-voltron-800 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-white text-[11px] block">{gate.name}</span>
                    <span className="text-[10px] text-voltron-400">{gate.condition}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-voltron-300 font-tabular">{gate.current_value}</span>
                    <span
                      className={clsx(
                        "text-[10px] font-bold px-1.5 py-0.2 rounded",
                        gate.status === "PASS"
                          ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                          : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                      )}
                    >
                      {gate.status === "PASS" ? "PASS" : "BLOCKED"}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 7. 2-COLUMN OPERATIONS WORKSPACE: ROW 3 (EXECUTION STATE + POSITION MONITOR) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Execution State (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>EXECUTION STATE</span>
              <span
                className={clsx(
                  "text-[10px] font-bold",
                  isRiskApproved ? "text-voltron-emerald" : "text-voltron-rose"
                )}
              >
                {isRiskApproved ? (execState?.status || "ORDER_SUBMITTED") : "EXECUTION BLOCKED"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Order ID</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">
                  {isRiskApproved ? (execState?.order_id || `VLT-${symbol}-8941`) : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Order Type</span>
                <span className="font-bold text-white text-xs">
                  {isRiskApproved ? (execState?.order_type || "LIMIT_CREDIT") : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Limit Price</span>
                <span className="font-bold text-voltron-emerald text-xs font-tabular">
                  {isRiskApproved ? `$${execState?.limit_price?.toFixed(2) || "1.85"}` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Quantity</span>
                <span className="font-bold text-white text-xs">
                  {isRiskApproved ? `${execState?.quantity || 1} Contract` : "0"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Strategy</span>
                <span className="font-bold text-white text-xs truncate block">
                  {isRiskApproved ? (execState?.strategy || stratDec?.selected_strategy || "IRON_CONDOR") : "NO_TRADE"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Routed Timestamp</span>
                <span className="font-bold text-white text-xs font-tabular">
                  {isRiskApproved ? (execState?.timestamp || "09:31:05 UTC") : "—"}
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-voltron-950 border border-voltron-800 space-y-1">
              <span className="text-[9px] uppercase text-voltron-400 block font-bold">Executed Legs Multi-Leg Router</span>
              <div className="grid grid-cols-2 gap-1 text-[10px] text-voltron-200">
                {isRiskApproved && execState?.legs ? (
                  execState.legs.map((l: string, i: number) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-voltron-cyan">●</span>
                      <span>{l}</span>
                    </div>
                  ))
                ) : (
                  <div className="text-voltron-400 italic">No orders executed (Risk gate blocked or inactive)</div>
                )}
              </div>
            </div>
          </div>

          {/* Position Monitor (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>POSITION MONITOR & DYNAMIC EXITS</span>
              <span className={clsx("text-[10px] font-bold", hasActivePosition ? "text-voltron-emerald" : "text-voltron-400")}>
                {hasActivePosition ? "ACTIVE POSITION" : "NO POSITION"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Unrealized P&L</span>
                <span className={clsx("font-bold text-xs font-tabular", hasActivePosition ? "text-voltron-emerald" : "text-voltron-400")}>
                  {hasActivePosition ? `+$${posMon.position.unrealized_pnl?.toFixed(2)} (+${posMon.position.unrealized_pnl_pct?.toFixed(2)}%)` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Entry Price</span>
                <span className="font-bold text-white text-xs font-tabular">
                  {hasActivePosition ? `$${posMon.position.entry_price?.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Current Cost to Close</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">
                  {hasActivePosition ? `$${posMon.position.current_value?.toFixed(2)}` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Take Profit Target</span>
                <span className="font-bold text-voltron-emerald text-xs font-tabular">
                  {hasActivePosition ? `$${posMon.position.take_profit?.toFixed(2)} (50%)` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Stop Loss Limit</span>
                <span className="font-bold text-voltron-rose text-xs font-tabular">
                  {hasActivePosition ? `$${posMon.position.stop_loss?.toFixed(2)} (100%)` : "—"}
                </span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Time in Trade</span>
                <span className="font-bold text-white text-xs font-tabular">
                  {hasActivePosition ? (posMon.position.time_open || "1h 42m") : "—"}
                </span>
              </div>
            </div>

            <div className="p-2 rounded bg-voltron-950 border border-voltron-800 flex items-center justify-between text-xs">
              <span className="text-[10px] text-voltron-400 uppercase">Exit Monitoring Status:</span>
              <span className={clsx("font-bold", hasActivePosition ? "text-voltron-emerald" : "text-voltron-400")}>
                {hasActivePosition ? "Dynamic TP/SL Enforced (Check interval: 1s)" : "Standby — Waiting for order fill"}
              </span>
            </div>
          </div>
        </div>

        {/* 8. ROW 4: AGENT METRICS & CHRONOLOGICAL ACTIVITY LOG */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Agent Performance Metrics (5 cols) */}
          <div className="lg:col-span-5 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>AGENT OPERATING METRICS</span>
              <span className="text-[10px] text-voltron-cyan">TODAY</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Cycles Today</span>
                <span className="font-bold text-white text-xs font-tabular">{metrics?.cycles_today || 142}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Trades Today</span>
                <span className="font-bold text-white text-xs font-tabular">{metrics?.trades_today || 6}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Win Rate</span>
                <span className="font-bold text-voltron-emerald text-xs font-tabular">{metrics?.win_rate_pct || 83.3}%</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Wins / Losses</span>
                <span className="font-bold text-white text-xs font-tabular">{metrics?.winning_trades || 5}W / {metrics?.losing_trades || 1}L</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Avg Confidence</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">{metrics?.avg_confidence || 86.4}%</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Orders / Blocks</span>
                <span className="font-bold text-white text-xs font-tabular">{metrics?.orders_submitted || 6} / {metrics?.risk_blocks || 1}</span>
              </div>
            </div>
          </div>

          {/* Chronological Activity Timeline (7 cols) */}
          <div className="lg:col-span-7 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>AGENT ACTIVITY STREAM</span>
              <span className="text-[10px] text-voltron-emerald">● REAL-TIME</span>
            </div>

            <div className="space-y-1.5 max-h-[175px] overflow-y-auto">
              {timeline?.events?.map((evt: any) => (
                <div
                  key={evt.id}
                  className="p-2 rounded bg-voltron-950 border border-voltron-800 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-voltron-400 text-[10px] font-tabular">{evt.timestamp}</span>
                    <span className="px-1.5 py-0.2 rounded bg-voltron-900 text-voltron-cyan font-bold text-[10px] border border-voltron-800 uppercase">
                      {evt.stage}
                    </span>
                    <span className="text-voltron-200 text-[11px] truncate max-w-md">{evt.summary}</span>
                  </div>
                  <span className="text-[10px] font-bold text-voltron-emerald bg-voltron-emerald/10 px-1 rounded">
                    {evt.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Emergency Stop Confirmation Modal */}
      {killModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
          <div className="w-full max-w-md bg-voltron-900 border-2 border-voltron-rose rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setKillModalOpen(false)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">EMERGENCY KILL SWITCH</h3>
              <span className="text-[10px] text-voltron-rose font-bold">CRITICAL SYSTEM OVERRIDE</span>
            </div>

            <p className="text-xs text-voltron-200 leading-relaxed mb-6 font-sans">
              Stop autonomous execution on {symbol}? This action will immediately engage the circuit breaker, halt all background scanning loops, and cancel active pending orders across Alpaca.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => setKillModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                CANCEL
              </button>
              <button
                onClick={handleEmergencyStop}
                className="flex-1 py-2 rounded-lg bg-voltron-rose hover:bg-voltron-rose/90 text-xs font-bold text-white transition-all"
              >
                DISARM & STOP
              </button>
            </div>
          </div>
        </div>
      )}
    </TerminalLayout>
  );
}

export default function AgentCommandCenterPage() {
  return (
    <Suspense fallback={
      <TerminalLayout>
        <div className="p-8 text-center text-voltron-cyan font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>INITIALIZING VOLTRON AGENT COMMAND CENTER...</span>
        </div>
      </TerminalLayout>
    }>
      <AgentCommandCenterContent />
    </Suspense>
  );
}
