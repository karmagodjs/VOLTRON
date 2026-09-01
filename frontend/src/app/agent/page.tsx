"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import AgentTimelineCard from "@/components/dashboard/AgentTimelineCard";
import AutonomousControlCard from "@/components/dashboard/AutonomousControlCard";
import { fetchAIAnalysis, fetchTimeline } from "@/lib/api";
import { AIAnalysis, TimelineEvent } from "@/types";
import {
  Bot,
  Sparkles,
  Terminal as TerminalIcon,
  CheckCircle2,
  AlertTriangle,
  Cpu,
  RefreshCw,
  Code2,
  Activity,
} from "lucide-react";
import clsx from "clsx";

export default function AgentCommandPage() {
  const [analysis, setAnalysis] = useState<AIAnalysis | null>(null);
  const [timeline, setTimeline] = useState<{ events: TimelineEvent[]; cycle: number; status: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"thesis" | "prompt" | "raw">("thesis");

  const loadData = async () => {
    try {
      const [a, t] = await Promise.all([fetchAIAnalysis("SPY"), fetchTimeline()]);
      setAnalysis(a);
      setTimeline(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 8000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !analysis || !timeline) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>INITIALIZING AI AGENT COMMAND CENTER...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Top Header Banner */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON AI AUTONOMOUS COMMAND CENTER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30">
                  ● GEMINI 3.6 FLASH (ACTIVE)
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Data &rarr; Intelligence &rarr; Strategy Selection &rarr; Paper Execution
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono">
            <span className="text-voltron-400">Cycle:</span>
            <span className="font-bold text-white bg-voltron-900 px-2.5 py-1 rounded border border-voltron-750 font-tabular">
              #{timeline.cycle}
            </span>
          </div>
        </div>

        {/* 2-Column Command Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: AI Reasoning Engine Workspace (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Model Card */}
            <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40">
              <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-voltron-cyan" />
                  <span className="text-xs font-mono font-bold text-white uppercase">
                    Neural Market Reasoning & Thesis
                  </span>
                </div>

                <div className="flex gap-1 bg-voltron-900 p-1 rounded-lg border border-voltron-750 text-xs font-mono">
                  {(["thesis", "prompt", "raw"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={clsx(
                        "px-2.5 py-1 rounded text-[11px] font-semibold transition-colors uppercase",
                        activeTab === tab
                          ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                          : "text-voltron-400 hover:text-white"
                      )}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "thesis" && (
                <div className="space-y-4 font-mono text-xs">
                  {/* Top Key AI Badges */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    <div className="p-2.5 rounded bg-voltron-900 border border-voltron-800">
                      <span className="text-[10px] text-voltron-400 uppercase block">Confidence</span>
                      <span className="text-sm font-bold text-voltron-cyan font-tabular">{analysis.confidence}%</span>
                    </div>
                    <div className="p-2.5 rounded bg-voltron-900 border border-voltron-800">
                      <span className="text-[10px] text-voltron-400 uppercase block">Decision</span>
                      <span className="text-sm font-bold text-voltron-emerald">{analysis.decision.replace("_", " ")}</span>
                    </div>
                    <div className="p-2.5 rounded bg-voltron-900 border border-voltron-800">
                      <span className="text-[10px] text-voltron-400 uppercase block">Direction</span>
                      <span className="text-sm font-bold text-white">{analysis.direction}</span>
                    </div>
                    <div className="p-2.5 rounded bg-voltron-900 border border-voltron-800">
                      <span className="text-[10px] text-voltron-400 uppercase block">Strategy</span>
                      <span className="text-sm font-bold text-voltron-cyan">{analysis.strategy_recommendation}</span>
                    </div>
                  </div>

                  {/* Primary Thesis */}
                  <div className="p-4 rounded-xl bg-voltron-900/90 border border-voltron-750">
                    <span className="text-[10px] text-voltron-cyan uppercase font-bold block mb-1">
                      Synthesized Core Thesis
                    </span>
                    <p className="text-sm text-voltron-100 leading-relaxed font-light">
                      &ldquo;{analysis.thesis}&rdquo;
                    </p>
                  </div>

                  {/* Reasons & Risks */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-voltron-900/40 border border-voltron-800 space-y-2">
                      <span className="text-[10px] font-bold text-voltron-emerald uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Quantitative Edge Justification
                      </span>
                      {analysis.key_reasons.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-voltron-300 text-[11px]">
                          <span className="text-voltron-emerald">✓</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3 rounded-lg bg-voltron-900/40 border border-voltron-800 space-y-2">
                      <span className="text-[10px] font-bold text-voltron-rose uppercase flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Risk Invalidation Triggers
                      </span>
                      {analysis.risks.map((r, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-voltron-300 text-[11px]">
                          <span className="text-voltron-rose">⚠</span>
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "prompt" && (
                <div className="p-3 rounded bg-voltron-950 border border-voltron-800 font-mono text-[11px] text-voltron-300 space-y-2">
                  <div className="text-voltron-cyan font-bold">SYSTEM PROMPT (agent/analyst.py):</div>
                  <p>You are VOLTRON, an autonomous options volatility analyst.</p>
                  <p>Your job is to analyze structured quantitative market signals (IV, RV, Greeks, Skew) and select defined-risk options strategies.</p>
                  <div className="text-voltron-cyan font-bold pt-2">SAFETY CONSTRAINTS:</div>
                  <p>1. Never invent market data or prices.</p>
                  <p>2. Prefer defined-risk multi-leg strategies.</p>
                  <p>3. Reject trades when confidence is below 70%.</p>
                </div>
              )}

              {activeTab === "raw" && (
                <pre className="p-3 rounded bg-voltron-950 border border-voltron-800 font-mono text-[11px] text-voltron-cyan overflow-x-auto">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              )}
            </div>

            {/* Autonomous Controls */}
            <AutonomousControlCard cycle={timeline.cycle} onRefreshTimeline={loadData} />
          </div>

          {/* Right: Live Execution Timeline (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <AgentTimelineCard events={timeline.events} cycle={timeline.cycle} />

            {/* Terminal Live Output Log */}
            <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-950/80 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-2 text-voltron-400 text-[10px] uppercase">
                <span className="flex items-center gap-1.5">
                  <TerminalIcon className="w-3.5 h-3.5 text-voltron-cyan" />
                  Execution Stream Log
                </span>
                <span className="text-voltron-emerald">● LISTENING</span>
              </div>
              <div className="space-y-1 text-[11px] text-voltron-300 max-h-[140px] overflow-y-auto">
                <div className="text-voltron-400">[09:31:02] SCAN: Found 8 candidate symbols. Filtered to SPY.</div>
                <div className="text-voltron-cyan">[09:31:03] QUANT: RV(20)=10.42%, IV=16.85%, Spread=1.62x.</div>
                <div className="text-voltron-emerald">[09:31:04] AI: Confidence 88%. Selected IRON_CONDOR.</div>
                <div className="text-voltron-emerald">[09:31:05] RISK: Evaluated 7 gates. All APPROVED.</div>
                <div className="text-white font-bold">[09:31:05] EXEC: Paper Order #VLT-8941 sent to Alpaca.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
