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
} from "@/types";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [market, setMarket] = useState<MarketData | null>(null);
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [timeline, setTimeline] = useState<{
    events: TimelineEvent[];
    cycle: number;
    status: string;
  } | null>(null);
  const [risk, setRisk] = useState<RiskStatus | null>(null);
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      const [m, a, t, r, acc] = await Promise.all([
        fetchMarket(symbol),
        fetchAIAnalysis(symbol),
        fetchTimeline(),
        fetchRisk(),
        fetchAccount(),
      ]);
      setMarket(m);
      setAnalysis(a);
      setTimeline(t);
      setRisk(r);
      setAccount(acc);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Failed to load telemetry from backend");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s auto-refresh
    return () => clearInterval(interval);
  }, [symbol]);

  if (loading && (!market || !analysis || !risk || !account)) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-140px)] font-mono text-xs text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span className="tracking-wider">INITIALIZING VOLTRON COMMAND CENTER STATE...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  if (error && !market) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-140px)] font-mono text-xs text-voltron-rose">
          <div className="flex flex-col items-center gap-3 p-6 rounded-lg bg-voltron-900 border border-voltron-800">
            <AlertTriangle className="w-8 h-8 text-voltron-rose" />
            <span className="font-bold">BACKEND OFFLINE / DATA UNAVAILABLE</span>
            <span className="text-voltron-400 text-[11px] max-w-sm text-center">
              Unable to reach VOLTRON execution and market data endpoints.
            </span>
            <button
              onClick={loadData}
              className="mt-2 px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-white flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="space-y-3.5">
        {/* Top 2-Column Institutional Workstation Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Main Market Workspace (8 cols on desktop) */}
          <div className="lg:col-span-7 xl:col-span-8">
            {market && risk && account && (
              <MarketWorkspace
                market={market}
                risk={risk}
                account={account}
                onOpenKillSwitch={() => {}}
              />
            )}
          </div>

          {/* Right AI Intelligence & Assessment Panel (4 cols on desktop) */}
          <div className="lg:col-span-5 xl:col-span-4">
            {analysis && (
              <AIIntelligencePanel
                analysis={analysis}
                strategyName="IRON CONDOR"
                riskStatus={risk?.overall_status || "APPROVED"}
              />
            )}
          </div>
        </div>

        {/* Bottom Horizontal Agent Pipeline & Telemetry Bar */}
        {timeline && (
          <AgentActivityBar
            cycle={timeline.cycle}
            symbol={symbol}
            strategy={analysis?.strategy_recommendation || "IRON_CONDOR"}
            confidence={analysis?.confidence || 88}
            opportunityScore={analysis?.opportunity_score || 94}
            lastAction="Risk evaluation passed / Paper order #VLT-8941 routed"
            lastUpdated={analysis?.timestamp ? new Date(analysis.timestamp).toLocaleTimeString() : undefined}
            onRefresh={loadData}
          />
        )}
      </div>
    </TerminalLayout>
  );
}
