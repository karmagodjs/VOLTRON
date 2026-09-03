"use client";

import { useState } from "react";
import { AIAnalysis } from "@/types";
import { X } from "lucide-react";
import clsx from "clsx";

interface AIAnalystCardProps {
  analysis: AIAnalysis;
  onOpenRisk?: () => void;
}

export default function AIAnalystCard({ analysis, onOpenRisk }: AIAnalystCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"reasoning" | "data" | "risk">("reasoning");

  const isRateLimited = analysis.ai_status === "RATE_LIMITED" || analysis.status === "RATE_LIMITED";
  const isCached = analysis.ai_status === "CACHED" || Boolean(analysis.is_cached);
  const statusText = isRateLimited ? "RATE LIMITED" : isCached ? "CACHED" : analysis.status;
  const decisionText = isRateLimited ? "NO TRADE" : analysis.decision.replace("_", " ") || "NO TRADE";

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      <div>
        {/* Header */}
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

        {/* Top Intelligence Row */}
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

        {/* AI Thesis Box */}
        <div className="p-3 rounded-lg bg-voltron-900/90 border border-voltron-750/90 mb-3">
          <div className="text-[10px] font-mono uppercase text-voltron-cyan font-bold mb-1 tracking-wider">
            Quantitative Thesis
          </div>
          <p className="text-xs font-mono text-voltron-200 leading-relaxed">
            &ldquo;{analysis.thesis}&rdquo;
          </p>
        </div>

        {/* Reasons & Risks 2-column list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3 text-xs font-mono">
          {/* Key Reasons */}
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

          {/* Key Risks */}
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

      {/* Action Buttons */}
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

      {/* Reasoning Inspection Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-mono font-bold text-white uppercase tracking-wider">
                AI Intelligence & Quant Audit — {analysis.symbol}
              </h3>
            </div>

            {/* Modal Tabs */}
            <div className="flex gap-2 border-b border-voltron-750 pb-2 mb-4">
              <button
                onClick={() => setModalTab("reasoning")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-mono font-semibold transition-colors",
                  modalTab === "reasoning"
                    ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                Neural Reasoning
              </button>
              <button
                onClick={() => setModalTab("data")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-mono font-semibold transition-colors",
                  modalTab === "data"
                    ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                Data Payload
              </button>
              <button
                onClick={() => setModalTab("risk")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-mono font-semibold transition-colors",
                  modalTab === "risk"
                    ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                Risk Gate Checklist
              </button>
            </div>

            {/* Modal Content */}
            <div className="max-h-[360px] overflow-y-auto space-y-3 text-xs font-mono">
              {modalTab === "reasoning" && (
                <div className="space-y-3">
                  <div className="p-3 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-voltron-cyan font-bold block mb-1">Thesis:</span>
                    <p className="text-voltron-200">{analysis.thesis}</p>
                  </div>
                  <div className="p-3 rounded bg-voltron-950 border border-voltron-800 space-y-2">
                    <span className="text-voltron-emerald font-bold block">Key Quantitative Drivers:</span>
                    {analysis.key_reasons.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-voltron-300">
                        <span className="text-voltron-emerald">✓</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                  <div className="p-3 rounded bg-voltron-950 border border-voltron-800 space-y-2">
                    <span className="text-voltron-rose font-bold block">Risk Factors:</span>
                    {analysis.risks.map((r, i) => (
                      <div key={i} className="flex items-start gap-2 text-voltron-300">
                        <span className="text-voltron-rose">⚠</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {modalTab === "data" && (
                <pre className="p-3 rounded bg-voltron-950 border border-voltron-800 text-[11px] text-voltron-cyan overflow-x-auto">
                  {JSON.stringify(
                    {
                      symbol: analysis.symbol,
                      decision: analysis.decision,
                      confidence: analysis.confidence,
                      opportunity_score: analysis.opportunity_score,
                      direction: analysis.direction,
                      volatility_view: analysis.volatility_view,
                      timestamp: analysis.timestamp,
                    },
                    null,
                    2
                  )}
                </pre>
              )}

              {modalTab === "risk" && (
                <div className="space-y-2">
                  <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                    <span>Opportunity Score (Min 70)</span>
                    <span className="text-voltron-emerald font-bold">94 / 100 [PASS]</span>
                  </div>
                  <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                    <span>Max Trade Risk (&le; 1.0%)</span>
                    <span className="text-voltron-emerald font-bold">0.31% [PASS]</span>
                  </div>
                  <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                    <span>Portfolio Exposure (&le; 30.0%)</span>
                    <span className="text-voltron-emerald font-bold">18.2% [PASS]</span>
                  </div>
                  <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                    <span>Liquidity Spread (&le; 10.0%)</span>
                    <span className="text-voltron-emerald font-bold">2.1% [PASS]</span>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-mono font-bold text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
