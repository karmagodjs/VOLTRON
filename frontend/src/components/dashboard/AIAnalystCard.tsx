"use client";

import { useState } from "react";
import { AIAnalysis, RiskStatus } from "@/types";
import clsx from "clsx";
import { AIAuditModal } from "./AIIntelligencePanel";

interface AIAnalystCardProps {
  analysis: AIAnalysis;
  onOpenRisk?: () => void;
  risk?: RiskStatus | null;
}

export default function AIAnalystCard({ analysis, onOpenRisk, risk }: AIAnalystCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"reasoning" | "data" | "risk">("reasoning");

  const isRateLimited = analysis.ai_status === "RATE_LIMITED" || analysis.status === "RATE_LIMITED";
  const isCached = analysis.ai_status === "CACHED" || Boolean(analysis.is_cached);
  const statusText = isRateLimited ? "RATE LIMITED" : isCached ? "CACHED" : analysis.status;
  const decisionText = isRateLimited ? "NO TRADE" : analysis.decision.replace("_", " ") || "NO TRADE";

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      <div>

        <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-3">
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              {isRateLimited ? "AI: GEMINI" : isCached ? "GEMINI" : "VOLTRON AI Analyst"}
            </span>
            {isRateLimited && (
              <span className="text-[10px] text-voltron-amber font-bold">STATUS: RATE LIMITED</span>
            )}
            {isCached && (
              <span className="text-[10px] text-voltron-cyan font-semibold">
                CACHED ANALYSIS {analysis.cached_at ? `(${new Date(analysis.cached_at).toLocaleTimeString()})` : ""}
              </span>
            )}
          </div>

          <div className={clsx(
            "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold",
            isRateLimited
              ? "bg-voltron-amber/15 border border-voltron-amber/30 text-voltron-amber"
              : isCached
              ? "bg-voltron-cyan/15 border border-voltron-cyan/30 text-voltron-cyan"
              : "bg-voltron-emerald/10 border border-voltron-emerald/30 text-voltron-emerald"
          )}>
            <span className={clsx(
              "w-1.5 h-1.5 rounded-full animate-pulse",
              isRateLimited ? "bg-voltron-amber" : isCached ? "bg-voltron-cyan" : "bg-voltron-emerald"
            )}></span>
            {statusText}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Decision
            </span>
            <span className={clsx(
              "text-xs font-mono font-bold",
              isRateLimited ? "text-voltron-amber" : "text-voltron-emerald"
            )}>
              {decisionText}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              AI Confidence
            </span>
            <span className="text-xs font-mono font-bold text-voltron-cyan font-tabular">
              {analysis.confidence}%
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Direction
            </span>
            <span className="text-xs font-mono font-bold text-white">
              {analysis.direction}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Volatility View
            </span>
            <span className="text-xs font-mono font-bold text-voltron-cyan">
              {analysis.volatility_view}
            </span>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-voltron-900/90 border border-voltron-750/90 mb-3">
          <div className="text-[10px] font-mono uppercase text-voltron-cyan font-bold mb-1 tracking-wider">
            Quantitative Thesis
          </div>
          <p className="text-xs font-mono text-voltron-200 leading-relaxed">
            &ldquo;{analysis.thesis}&rdquo;
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs font-mono">

          <div className="p-2.5 rounded bg-voltron-900/40 border border-voltron-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-voltron-emerald font-bold tracking-wider">
              Key Drivers
            </span>
            {analysis.key_reasons.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-voltron-300 text-[11px]">
                <span className="text-voltron-emerald mt-0.5">✓</span>
                <span>{r}</span>
              </div>
            ))}
          </div>

          <div className="p-2.5 rounded bg-voltron-900/40 border border-voltron-800 space-y-1.5">
            <span className="text-[10px] font-mono uppercase text-voltron-rose font-bold tracking-wider">
              Risk Factors
            </span>
            {analysis.risks.slice(0, 2).map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 text-voltron-300 text-[11px]">
                <span className="text-voltron-rose mt-0.5">⚠</span>
                <span>{r}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pt-2 border-t border-voltron-750/60">
        <button
          onClick={() => {
            setModalTab("reasoning");
            setModalOpen(true);
          }}
          className="flex-1 py-1.5 px-2 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-mono text-voltron-200 hover:text-white flex items-center justify-center transition-colors"
        >
          <span>View Reasoning</span>
        </button>

        <button
          onClick={() => {
            setModalTab("data");
            setModalOpen(true);
          }}
          className="flex-1 py-1.5 px-2 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-mono text-voltron-200 hover:text-white flex items-center justify-center transition-colors"
        >
          <span>View Data</span>
        </button>

        <button
          onClick={() => {
            if (onOpenRisk) onOpenRisk();
            else {
              setModalTab("risk");
              setModalOpen(true);
            }
          }}
          className="flex-1 py-1.5 px-2 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-mono text-voltron-200 hover:text-white flex items-center justify-center transition-colors"
        >
          <span>Risk Assessment</span>
        </button>
      </div>

      <AIAuditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        analysis={analysis}
        risk={risk}
        riskStatus={risk?.overall_status || "APPROVED"}
        initialTab={modalTab}
      />
    </div>
  );
}
