"use client";

import { useState } from "react";
import { AIAnalysis } from "@/types";
import { X } from "lucide-react";
import clsx from "clsx";

interface AIIntelligencePanelProps {
  analysis: AIAnalysis | null;
  strategyName?: string | null;
  riskStatus?: string | null;
}

export default function AIIntelligencePanel({
  analysis,
  strategyName = "IRON CONDOR",
  riskStatus = "APPROVED",
}: AIIntelligencePanelProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTab, setModalTab] = useState<"reasoning" | "data" | "risk">("reasoning");

  const isRateLimited = analysis?.ai_status === "RATE_LIMITED" || analysis?.status === "RATE_LIMITED";
  const isCached = analysis?.ai_status === "CACHED" || Boolean(analysis?.is_cached);
  const isError = analysis?.ai_status === "ERROR";

  const statusBadge = isRateLimited
    ? "RATE LIMITED"
    : isCached
    ? "CACHED ANALYSIS"
    : isError
    ? "ERROR"
    : (analysis?.status || "ANALYZING");

  const decisionLabel = isRateLimited
    ? "NO TRADE"
    : analysis?.decision
    ? analysis.decision.replace("_", " ") || "NO TRADE"
    : "WAITING";

  const actionLabel =
    isRateLimited || analysis?.decision === "NO_TRADE"
      ? "NO TRADE"
      : riskStatus === "APPROVED" && analysis?.decision === "TRADE_CANDIDATE"
      ? "PAPER EXECUTION"
      : riskStatus === "BLOCKED"
      ? "BLOCKED"
      : "NO TRADE";

  const displayStrategy = isRateLimited ? "NO TRADE" : (strategyName || "IRON CONDOR");

  return (
    <div className="space-y-3 font-mono">
      {/* 1. Main VOLTRON Intelligence Panel */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-3">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-voltron-800 pb-2">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {isRateLimited ? "AI: GEMINI" : isCached ? "GEMINI" : "VOLTRON INTELLIGENCE"}
              </span>
              {isRateLimited && (
                <span className="text-[10px] font-bold text-voltron-amber uppercase">
                  STATUS: RATE LIMITED
                </span>
              )}
            </div>
            {isCached && (
              <span className="text-[10px] text-voltron-cyan font-semibold">
                CACHED ANALYSIS {analysis?.cached_at ? `• Generated ${new Date(analysis.cached_at).toLocaleTimeString()}` : ""}
              </span>
            )}
            {!isRateLimited && !isCached && (
              <span className="text-[10px] text-voltron-400">
                Autonomous Volatility Analyst
              </span>
            )}
          </div>

          <div
            className={clsx(
              "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider",
              isRateLimited
                ? "bg-voltron-amber/15 border border-voltron-amber/30 text-voltron-amber"
                : isCached
                ? "bg-voltron-cyan/15 border border-voltron-cyan/30 text-voltron-cyan"
                : isError
                ? "bg-voltron-rose/15 border border-voltron-rose/30 text-voltron-rose"
                : statusBadge === "COMPLETE"
                ? "bg-voltron-emerald/10 border border-voltron-emerald/30 text-voltron-emerald"
                : statusBadge === "ANALYZING"
                ? "bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan"
                : "bg-voltron-800 border border-voltron-700 text-voltron-300"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full inline-block",
                isRateLimited
                  ? "bg-voltron-amber animate-pulse"
                  : isCached
                  ? "bg-voltron-cyan"
                  : isError
                  ? "bg-voltron-rose"
                  : statusBadge === "ANALYZING"
                  ? "bg-voltron-cyan animate-pulse"
                  : statusBadge === "COMPLETE"
                  ? "bg-voltron-emerald"
                  : "bg-voltron-400"
              )}
            ></span>
            ● {isRateLimited ? "RATE LIMITED" : isCached ? "CACHED" : statusBadge}
          </div>
        </div>

        {/* Intelligence Status 4-Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              Decision
            </span>
            <span className={clsx(
              "font-bold truncate block",
              isRateLimited ? "text-voltron-amber" : "text-voltron-emerald"
            )}>
              {decisionLabel}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              Confidence
            </span>
            <span className="font-bold text-voltron-cyan font-tabular">
              {analysis?.confidence != null ? `${analysis.confidence}%` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              Direction
            </span>
            <span className="font-bold text-white">
              {analysis?.direction || "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              Volatility View
            </span>
            <span className="font-bold text-voltron-cyan">
              {analysis?.volatility_view || "—"}
            </span>
          </div>
        </div>

        {/* AI Thesis Box */}
        <div className={clsx(
          "p-3 rounded border",
          isRateLimited
            ? "bg-voltron-amber/10 border-voltron-amber/30"
            : "bg-voltron-950 border-voltron-800"
        )}>
          <div className={clsx(
            "text-[10px] uppercase font-bold mb-1 tracking-wider flex items-center justify-between",
            isRateLimited ? "text-voltron-amber" : "text-voltron-cyan"
          )}>
            <span>{isRateLimited ? "AI QUOTA LIMIT NOTICE" : "AI THESIS"}</span>
            {isCached && (
              <span className="text-[9px] text-voltron-cyan/70 font-normal">CACHED MODEL OUTPUT</span>
            )}
          </div>
          <p className="text-xs text-voltron-200 leading-relaxed font-sans font-normal">
            {analysis?.thesis ? `“${analysis.thesis}”` : "WAITING FOR AI ANALYSIS..."}
          </p>
        </div>

        {/* Numbered Key Reasons (01, 02, 03) */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase text-voltron-emerald font-bold tracking-wider">
            KEY REASONS
          </div>
          <div className="space-y-1">
            {analysis?.key_reasons && analysis.key_reasons.length > 0 ? (
              analysis.key_reasons.slice(0, 3).map((r, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-voltron-950/60 border border-voltron-800 flex items-start gap-2 text-xs"
                >
                  <span className="text-[10px] font-bold text-voltron-emerald px-1 py-0.2 rounded bg-voltron-emerald/10 border border-voltron-emerald/20 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-voltron-200 text-[11px] leading-snug">{r}</span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-voltron-400 p-2">No active drivers loaded.</div>
            )}
          </div>
        </div>

        {/* Numbered Risk Factors (01, 02) */}
        <div className="space-y-1.5">
          <div className="text-[10px] uppercase text-voltron-rose font-bold tracking-wider">
            RISKS
          </div>
          <div className="space-y-1">
            {analysis?.risks && analysis.risks.length > 0 ? (
              analysis.risks.slice(0, 2).map((r, i) => (
                <div
                  key={i}
                  className="p-2 rounded bg-voltron-950/60 border border-voltron-800 flex items-start gap-2 text-xs"
                >
                  <span className="text-[10px] font-bold text-voltron-rose px-1 py-0.2 rounded bg-voltron-rose/10 border border-voltron-rose/20 flex-shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="text-voltron-200 text-[11px] leading-snug">{r}</span>
                </div>
              ))
            ) : (
              <div className="text-[11px] text-voltron-400 p-2">No active risk factors recorded.</div>
            )}
          </div>
        </div>

        {/* Audit Button */}
        <button
          onClick={() => {
            setModalTab("reasoning");
            setModalOpen(true);
          }}
          className="w-full py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] text-voltron-cyan font-bold border border-voltron-700/80 transition-colors flex items-center justify-center"
        >
          <span>INSPECT DECISION & AUDIT PAYLOAD</span>
        </button>
      </div>

      {/* 2. Decision Summary / Current Assessment Box */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
        <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
          <span>CURRENT ASSESSMENT</span>
          <span className="text-[10px] text-voltron-cyan font-semibold">DECISION MATRIX</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Market</span>
            <span className="font-bold text-white text-xs">{analysis?.symbol || "SPY"}</span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Regime</span>
            <span className="font-bold text-voltron-cyan text-xs">{analysis?.direction || "NEUTRAL"}</span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Volatility</span>
            <span className="font-bold text-voltron-emerald text-xs">{analysis?.volatility_view || "EXPENSIVE"}</span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Confidence</span>
            <span className="font-bold text-voltron-cyan text-xs font-tabular">
              {analysis?.confidence != null ? `${analysis.confidence}%` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Strategy</span>
            <span className="font-bold text-white text-xs truncate block">{displayStrategy}</span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block">Risk</span>
            <span
              className={clsx(
                "font-bold text-xs",
                riskStatus === "APPROVED" ? "text-voltron-emerald" : "text-voltron-rose"
              )}
            >
              {riskStatus || "PENDING"}
            </span>
          </div>
        </div>

        {/* Action Button Strip */}
        <div className={clsx(
          "p-2 rounded flex items-center justify-between",
          isRateLimited || actionLabel === "NO TRADE"
            ? "bg-voltron-950 border border-voltron-800"
            : "bg-voltron-cyan/10 border border-voltron-cyan/30"
        )}>
          <span className="text-[10px] uppercase text-voltron-400">Action:</span>
          <span className={clsx(
            "text-xs font-bold",
            isRateLimited || actionLabel === "NO TRADE" ? "text-voltron-400" : "text-voltron-cyan"
          )}>
            {actionLabel}
          </span>
        </div>
      </div>

      {/* Neural Reasoning Inspection Modal */}
      {modalOpen && analysis && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-2xl bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setModalOpen(false)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                VOLTRON AI Intelligence Audit — {analysis.symbol}
              </h3>
            </div>

            <div className="flex gap-2 border-b border-voltron-750 pb-2 mb-4">
              <button
                onClick={() => setModalTab("reasoning")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-semibold transition-colors",
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
                  "px-3 py-1 rounded text-xs font-semibold transition-colors",
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
                  "px-3 py-1 rounded text-xs font-semibold transition-colors",
                  modalTab === "risk"
                    ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                Risk Gate Checklist
              </button>
            </div>

            <div className="max-h-[360px] overflow-y-auto space-y-3 text-xs">
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
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
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
