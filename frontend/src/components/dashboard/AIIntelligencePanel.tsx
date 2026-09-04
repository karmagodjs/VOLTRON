"use client";

import { useState, useEffect } from "react";
import { AIAnalysis, RiskStatus, RiskGate } from "@/types";
import { X } from "lucide-react";
import clsx from "clsx";

export interface AIAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  analysis: AIAnalysis | null;
  risk?: RiskStatus | null;
  riskStatus?: string | null;
  initialTab?: "reasoning" | "data" | "risk";
}

export function AIAuditModal({
  isOpen,
  onClose,
  analysis,
  risk = null,
  riskStatus = "APPROVED",
  initialTab = "reasoning",
}: AIAuditModalProps) {
  const [modalTab, setModalTab] = useState<"reasoning" | "data" | "risk">(initialTab);

  useEffect(() => {
    if (isOpen && initialTab) {
      setModalTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen || !analysis) return null;

  const oppScore = analysis.opportunity_score;
  const configuredSpreadLimit =
    risk?.liquidity_spread_limit_pct ??
    analysis?.risk_decision?.liquidity_spread_limit_pct ??
    5.0;

  const measuredSpread =
    risk?.liquidity_spread_pct ??
    analysis?.risk_decision?.liquidity_spread_pct ??
    null;

  const rawGates: RiskGate[] =
    analysis.risk_gates && analysis.risk_gates.length > 0
      ? analysis.risk_gates
      : analysis.risk_decision?.gates && analysis.risk_decision.gates.length > 0
      ? analysis.risk_decision.gates
      : risk?.gates && risk.gates.length > 0
      ? risk.gates
      : [];

  const fallbackGates: RiskGate[] = [
    {
      id: "GATE-01",
      name: "Opportunity Score",
      condition: "Score >= 70",
      current_value: oppScore != null ? `${oppScore} / 100` : "NOT EVALUATED",
      status: oppScore != null && oppScore >= 70 ? "PASS" : "BLOCKED",
      description: "Quant IV/RV dislocation meets statistical edge threshold.",
    },
    {
      id: "GATE-02",
      name: "Trade Risk",
      condition: "Risk <= 1.0%",
      current_value: "NOT EVALUATED",
      status: "BLOCKED",
      description: "Single-trade maximum loss strictly constrained.",
    },
    {
      id: "GATE-03",
      name: "Daily Loss Limit",
      condition: "Daily Loss < 2.0%",
      current_value: "NOT EVALUATED",
      status: "BLOCKED",
      description: "Intraday circuit breaker prevents capital bleed.",
    },
    {
      id: "GATE-04",
      name: "Portfolio Exposure",
      condition: "Exposure <= 30.0%",
      current_value: "NOT EVALUATED",
      status: "BLOCKED",
      description: "Total collateral utilization limits enforced.",
    },
    {
      id: "GATE-05",
      name: "Market Liquidity",
      condition: `Spread <= ${configuredSpreadLimit.toFixed(1)}%`,
      current_value: measuredSpread != null ? `${measuredSpread.toFixed(1)}% Spread` : "NOT EVALUATED",
      status: measuredSpread != null && measuredSpread <= configuredSpreadLimit ? "PASS" : "BLOCKED",
      description: "Bid-ask slippage check on execution legs.",
    },
    {
      id: "GATE-06",
      name: "Consecutive Losses",
      condition: "Losses < 3",
      current_value: "NOT EVALUATED",
      status: "BLOCKED",
      description: "Enforces cooldown after consecutive stops.",
    },
    {
      id: "GATE-07",
      name: "Emergency Kill Switch",
      condition: "Disarmed / Normal",
      current_value:
        risk?.kill_switch != null
          ? risk.kill_switch
            ? "ENGAGED"
            : "ARMED (Ready)"
          : "UNAVAILABLE",
      status: risk && !risk.kill_switch ? "PASS" : "BLOCKED",
      description: "Master circuit breaker state.",
    },
  ];

  const effectiveGates: RiskGate[] =
    rawGates.length > 0
      ? rawGates.map((g) => {
          if (g.id === "GATE-01" || g.name.toLowerCase().includes("opportunity")) {
            const scoreVal = oppScore != null ? oppScore : 0;
            return {
              ...g,
              condition: "Score >= 70",
              current_value: oppScore != null ? `${scoreVal} / 100` : "NOT EVALUATED",
              status: (oppScore != null && scoreVal >= 70 ? "PASS" : "BLOCKED") as "PASS" | "BLOCKED",
            };
          }
          if (g.id === "GATE-05" || g.name.toLowerCase().includes("liquidity")) {
            const isPlaceholder =
              !g.current_value ||
              g.current_value.includes("<") ||
              g.current_value.includes("10.0%") ||
              g.current_value.includes("10%");

            const val = measuredSpread != null
              ? `${measuredSpread.toFixed(1)}% Spread`
              : (!isPlaceholder ? g.current_value : "NOT EVALUATED");

            const isPass = measuredSpread != null
              ? measuredSpread <= configuredSpreadLimit
              : (!isPlaceholder && g.status === "PASS");

            return {
              ...g,
              condition: `Spread <= ${configuredSpreadLimit.toFixed(1)}%`,
              current_value: val,
              status: (isPass ? "PASS" : "BLOCKED") as "PASS" | "BLOCKED",
            };
          }
          return g;
        })
      : fallbackGates;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono">
      <div className="w-full max-w-2xl bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
        <button
          onClick={onClose}
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
              {/* Decision Snapshot Metrics Bar */}
              <div className="grid grid-cols-3 gap-2 p-2.5 rounded bg-voltron-950 border border-voltron-800 text-center">
                <div>
                  <span className="text-[9px] uppercase text-voltron-400 block">Opportunity Score</span>
                  <span
                    className={clsx(
                      "text-xs font-bold font-tabular",
                      (oppScore ?? 0) >= 70 ? "text-voltron-emerald" : "text-voltron-rose"
                    )}
                  >
                    {oppScore != null ? `${oppScore} / 100` : "— / 100"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-voltron-400 block">Confidence</span>
                  <span className="text-xs font-bold text-voltron-cyan font-tabular">
                    {analysis.confidence != null ? `${analysis.confidence}%` : "—"}
                  </span>
                </div>
                <div>
                  <span className="text-[9px] uppercase text-voltron-400 block">Direction</span>
                  <span className="text-xs font-bold text-white">
                    {analysis.direction || "—"}
                  </span>
                </div>
              </div>

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
                  risk_status:
                    analysis?.risk_decision?.overall_status ||
                    risk?.overall_status ||
                    riskStatus ||
                    (rawGates.length > 0 ? "APPROVED" : "BLOCKED"),
                  risk_gates: effectiveGates,
                },
                null,
                2
              )}
            </pre>
          )}

          {modalTab === "risk" && (
            <div className="space-y-2">
              {rawGates.length === 0 && (
                <div className="p-2.5 rounded bg-voltron-amber/10 border border-voltron-amber/30 text-[11px] text-voltron-amber font-semibold flex items-center gap-2">
                  <span>⚠️</span>
                  <span>Live risk-engine telemetry not evaluated for this asset — all unevaluated gates fail-closed (BLOCKED).</span>
                </div>
              )}
              {effectiveGates.map((gate, idx) => {
                const isPass = gate.status === "PASS";
                return (
                  <div
                    key={gate.id || gate.name || idx}
                    className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center"
                  >
                    <div>
                      <span className="font-bold text-white text-xs block">
                        {gate.name} <span className="text-[10px] text-voltron-400 font-normal">({gate.condition})</span>
                      </span>
                      {gate.description && (
                        <span className="text-[10px] text-voltron-400 block">{gate.description}</span>
                      )}
                    </div>
                    <span
                      className={clsx(
                        "font-bold font-tabular text-xs",
                        isPass ? "text-voltron-emerald" : "text-voltron-rose"
                      )}
                    >
                      {gate.current_value} [{gate.status}]
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
          >
            Close Audit
          </button>
        </div>
      </div>
    </div>
  );
}

interface AIIntelligencePanelProps {
  analysis: AIAnalysis | null;
  strategyName?: string | null;
  riskStatus?: string | null;
  risk?: RiskStatus | null;
}

export default function AIIntelligencePanel({
  analysis,
  strategyName = "IRON CONDOR",
  riskStatus = "APPROVED",
  risk = null,
}: AIIntelligencePanelProps) {
  const [modalOpen, setModalOpen] = useState(false);

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
          onClick={() => setModalOpen(true)}
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
      <AIAuditModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        analysis={analysis}
        risk={risk}
        riskStatus={riskStatus}
      />
    </div>
  );
}
