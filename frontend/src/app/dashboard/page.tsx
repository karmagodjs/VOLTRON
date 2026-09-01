"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import MarketHeroCard from "@/components/dashboard/MarketHeroCard";
import FinancialChart from "@/components/dashboard/FinancialChart";
import VolatilityAlphaCard from "@/components/dashboard/VolatilityAlphaCard";
import AIAnalystCard from "@/components/dashboard/AIAnalystCard";
import AgentTimelineCard from "@/components/dashboard/AgentTimelineCard";
import RiskSummaryCard from "@/components/dashboard/RiskSummaryCard";
import AutonomousControlCard from "@/components/dashboard/AutonomousControlCard";
import {
  fetchMarket,
  fetchAIAnalysis,
  fetchTimeline,
  fetchRisk,
} from "@/lib/api";
import { MarketData, AIAnalysis, TimelineEvent, RiskStatus } from "@/types";

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [market, setMarket] = useState<MarketData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [timeline, setTimeline] = useState<{ events: TimelineEvent[]; cycle: number; status: string } | null>(null);
  const [risk, setRisk] = useState<RiskStatus | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const [m, a, t, r] = await Promise.all([
        fetchMarket(symbol),
        fetchAIAnalysis(symbol),
        fetchTimeline(),
        fetchRisk(),
      ]);
      setMarket(m);
      setAnalysis(a);
      setTimeline(t);
      setRisk(r);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading || !market || !analysis || !timeline || !risk) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>INITIALIZING VOLTRON TERMINAL STATE...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Top Market Hero Banner */}
        <MarketHeroCard market={market} />

        {/* 3-Column / 2-Column Responsive Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Center Workspace (8 columns on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            {/* Financial Chart */}
            <FinancialChart history={market.history} symbol={market.symbol} />

            {/* Volatility Alpha & Autonomous Controls 2-Column */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <VolatilityAlphaCard market={market} />
              <AutonomousControlCard
                cycle={timeline.cycle}
                onRefreshTimeline={loadData}
              />
            </div>

            {/* Risk Summary Bar */}
            <RiskSummaryCard risk={risk} onOpenKillSwitch={() => {}} />
          </div>

          {/* Right Intelligence Panel (5/4 columns on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            {/* AI Analyst Card */}
            <AIAnalystCard analysis={analysis} />

            {/* Autonomous Agent Timeline */}
            <AgentTimelineCard events={timeline.events} cycle={timeline.cycle} />
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
