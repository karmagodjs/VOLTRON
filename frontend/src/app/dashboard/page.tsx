"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import MarketWorkspace from "@/components/dashboard/MarketWorkspace";
import AIIntelligencePanel from "@/components/dashboard/AIIntelligencePanel";
import AgentActivityBar from "@/components/dashboard/AgentActivityBar";
import {
  fetchMarket,
  fetchAIAnalysis,
  fetchTimeline,
  fetchRisk,
  fetchAccount,
} from "@/lib/api";
import {
  MarketData,
  AIAnalysis,
  TimelineEvent,
  RiskStatus,
  AccountSummary,
  AgentState,
} from "@/types";
import {
  ArrowRight,
  TrendingUp,
  Bot,
  SlidersHorizontal,
  ShieldCheck,
  Send,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

import { useMarket } from "@/context/MarketContext";

export default function DashboardPage() {
  const { selectedSymbol, setSelectedSymbol } = useMarket();
  const [market, setMarket] = useState<MarketData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [timeline, setTimeline] = useState<{
    events: TimelineEvent[];
    cycle: number;
    status: string;
  } | null>(null);
  const [risk, setRisk] = useState<RiskStatus | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>("1M");
  const [timeframeLoading, setTimeframeLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadMarketData = async (sym = selectedSymbol, tf = selectedTimeframe) => {
    try {
      const [m, t, r, acc] = await Promise.all([
        fetchMarket(sym, tf),
        fetchTimeline(sym),
        fetchRisk(sym),
        fetchAccount(),
      ]);
      setMarket(m);
      setTimeline(t);
      setRisk(r);
      setAccount(acc);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load telemetry from backend");
    }
  };

  const handleTimeframeChange = async (tf: string) => {
    setSelectedTimeframe(tf);
    try {
      setTimeframeLoading(true);
      const m = await fetchMarket(selectedSymbol, tf);
      setMarket(m);
    } catch (err: any) {
      console.warn("Failed to update timeframe data", err);
    } finally {
      setTimeframeLoading(false);
    }
  };

  const loadAIData = async (sym = selectedSymbol) => {
    try {
      const a = await fetchAIAnalysis(sym);
      setAnalysis(a);
    } catch (err: any) {
      console.warn("Failed to load AI analysis", err);
    }
  };

  const loadAll = async (sym = selectedSymbol, tf = selectedTimeframe) => {
    try {
      setLoading(true);
      await Promise.all([loadMarketData(sym, tf), loadAIData(sym)]);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load telemetry from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll(selectedSymbol, selectedTimeframe);
    // Market data refreshes every 15s (frequent refresh)
    const marketInterval = setInterval(() => loadMarketData(selectedSymbol, selectedTimeframe), 15000);
    // AI Analysis refreshes every 45s (cached on backend with 180s TTL)
    const aiInterval = setInterval(() => loadAIData(selectedSymbol), 45000);

    return () => {
      clearInterval(marketInterval);
      clearInterval(aiInterval);
    };
  }, [selectedSymbol, selectedTimeframe]);

  const isRateLimited = analysis?.ai_status === "RATE_LIMITED" || analysis?.status === "RATE_LIMITED";
  const confidenceVal = analysis?.confidence != null ? analysis.confidence : 0;
  const decisionVal = isRateLimited ? "NO_TRADE" : (analysis?.decision || "NO_TRADE");
  const strategyVal = isRateLimited ? "NO TRADE" : (analysis?.strategy_recommendation || "NO TRADE");

  const agentState: AgentState = {
    cycle: timeline?.cycle || 142,
    status: isRateLimited ? "RATE_LIMITED" : (analysis?.status || "ANALYZING"),
    symbol: selectedSymbol,
    decision: decisionVal,
    strategy: strategyVal,
    confidence: confidenceVal,
    opportunity_score: market?.opportunity_score ?? analysis?.opportunity_score ?? 0,
    active_order_id: null,
    active_position: strategyVal !== "NO TRADE" ? `${selectedSymbol} ${strategyVal}` : null,
    last_reason: isRateLimited
      ? "Gemini API rate limited (429) — Autonomous trading safely disarmed"
      : (analysis?.thesis || "Market volatility analysis complete"),
    errors: analysis?.risks || [],
    ai_status: analysis?.ai_status,
  };

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono">
        {/* 1. Visual Flow Banner: MARKET → VOLATILITY → AI DECISION → STRATEGY → RISK → ACTION */}
        <div className="p-2.5 rounded-lg bg-voltron-900 border border-voltron-800 flex flex-wrap items-center justify-between gap-2 text-xs overflow-x-auto">
          {/* Step 1: Market */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">1. MARKET</span>
            <span className="px-1.5 py-0.5 rounded bg-voltron-950 border border-voltron-800 text-white font-bold text-[11px]">
              {selectedSymbol} {market?.price ? `$${market.price.toFixed(2)}` : "—"}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-voltron-600 flex-shrink-0" />

          {/* Step 2: Volatility */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">2. VOLATILITY</span>
            <span className="px-1.5 py-0.5 rounded bg-voltron-950 border border-voltron-800 text-voltron-emerald font-bold text-[11px]">
              {market?.iv_rv_ratio ? `IV/RV ${market.iv_rv_ratio.toFixed(2)}x` : "—"}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-voltron-600 flex-shrink-0" />

          {/* Step 3: AI Intelligence */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">3. AI DECISION</span>
            <span
              className={clsx(
                "px-1.5 py-0.5 rounded border font-bold text-[11px]",
                isRateLimited
                  ? "bg-voltron-amber/15 border-voltron-amber/40 text-voltron-amber"
                  : analysis?.ai_status === "CACHED"
                  ? "bg-voltron-cyan/15 border-voltron-cyan/40 text-voltron-cyan"
                  : "bg-voltron-cyan/15 border-voltron-cyan/40 text-voltron-cyan"
              )}
            >
              {isRateLimited
                ? "NO TRADE (0%)"
                : `${analysis?.decision ? analysis.decision.replace("_", " ") : "ANALYZING"} (${confidenceVal}%)`}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-voltron-600 flex-shrink-0" />

          {/* Step 4: Strategy */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">4. STRATEGY</span>
            <span className="px-1.5 py-0.5 rounded bg-voltron-950 border border-voltron-800 text-white font-bold text-[11px]">
              {strategyVal}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-voltron-600 flex-shrink-0" />

          {/* Step 5: Risk */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">5. RISK</span>
            <span
              className={clsx(
                "px-1.5 py-0.5 rounded border font-bold text-[11px]",
                risk?.overall_status === "APPROVED"
                  ? "bg-voltron-emerald/15 border-voltron-emerald/30 text-voltron-emerald"
                  : "bg-voltron-rose/15 border-voltron-rose/30 text-voltron-rose"
              )}
            >
              {risk?.overall_status === "APPROVED" ? "APPROVED" : "BLOCKED"}
            </span>
          </div>

          <ArrowRight className="w-3.5 h-3.5 text-voltron-600 flex-shrink-0" />

          {/* Step 6: Action */}
          <div className="flex items-center gap-1.5 flex-shrink-0">
            <span className="text-[10px] text-voltron-400 uppercase font-bold">6. ACTION</span>
            <span
              className={clsx(
                "px-2 py-0.5 rounded border font-bold text-[11px]",
                isRateLimited || decisionVal === "NO_TRADE"
                  ? "bg-voltron-950 border-voltron-800 text-voltron-400"
                  : "bg-voltron-cyan/20 border border-voltron-cyan text-voltron-cyan"
              )}
            >
              {isRateLimited || decisionVal === "NO_TRADE" ? "NO ACTION" : "PAPER EXECUTION"}
            </span>
          </div>
        </div>

        {/* 2. Top 2-Column Institutional Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Main Market Workspace (8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8">
            <MarketWorkspace
              market={market}
              risk={risk}
              account={account}
              isLoading={loading}
              activeTimeframe={selectedTimeframe}
              onTimeframeChange={handleTimeframeChange}
              isTimeframeLoading={timeframeLoading}
            />
          </div>

          {/* Right AI Intelligence & Assessment Panel (4 cols on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <AIIntelligencePanel
              analysis={analysis}
              strategyName={analysis?.strategy_recommendation || "IRON CONDOR"}
              riskStatus={risk?.overall_status || "APPROVED"}
              risk={risk}
            />
          </div>
        </div>

        {/* 3. Bottom Horizontal Agent Pipeline & Telemetry Bar */}
        <AgentActivityBar
          agentState={agentState}
          activeOrder="VLT-8941"
          lastUpdated={analysis?.timestamp ? new Date(analysis.timestamp).toLocaleTimeString() : undefined}
          onRefresh={loadAll}
        />
      </div>
    </TerminalLayout>
  );
}
