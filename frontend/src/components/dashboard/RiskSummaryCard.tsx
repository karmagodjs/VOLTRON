"use client";

import { RiskStatus } from "@/types";
import clsx from "clsx";

interface RiskSummaryCardProps {
  risk: RiskStatus;
  onOpenKillSwitch: () => void;
}

export default function RiskSummaryCard({ risk, onOpenKillSwitch }: RiskSummaryCardProps) {
  const passingGates = risk.gates.filter((g) => g.status === "PASS").length;
  const totalGates = risk.gates.length;

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-3">
          <div className="flex items-center">
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              Risk Command Center
            </span>
          </div>

          <span
            className={clsx(
              "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider",
              risk.overall_status === "APPROVED"
                ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
            )}
          >
            {risk.overall_status === "APPROVED" ? "GATES APPROVED" : "RISK BLOCKED"}
          </span>
        </div>

        {/* 4 Core Risk Metrics */}
        <div className="grid grid-cols-2 gap-2 mb-3">
          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-voltron-400 uppercase mb-1">
              <span>Exposure</span>
              <span>Max 30%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono font-bold text-white font-tabular">
                {risk.portfolio_exposure_pct.toFixed(1)}%
              </span>
              <span className="text-[10px] font-mono text-voltron-emerald font-semibold">
                SAFE
              </span>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-voltron-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-voltron-cyan h-full rounded-full transition-all"
                style={{ width: `${(risk.portfolio_exposure_pct / 30) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-voltron-400 uppercase mb-1">
              <span>Trade Risk</span>
              <span>Max 1.0%</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span className="text-sm font-mono font-bold text-white font-tabular">
                {risk.trade_risk_pct.toFixed(2)}%
              </span>
              <span className="text-[10px] font-mono text-voltron-emerald font-semibold">
                PASS
              </span>
            </div>
            <div className="w-full bg-voltron-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
              <div
                className="bg-voltron-emerald h-full rounded-full transition-all"
                style={{ width: `${(risk.trade_risk_pct / 1.0) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-voltron-400 uppercase mb-1">
              <span>Daily Loss Limit</span>
              <span>2.0%</span>
            </div>
            <span className="text-sm font-mono font-bold text-voltron-emerald font-tabular block">
              +${risk.daily_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-800">
            <div className="flex justify-between items-center text-[10px] font-mono text-voltron-400 uppercase mb-1">
              <span>Consecutive Losses</span>
              <span>Max 3</span>
            </div>
            <span className="text-sm font-mono font-bold text-white font-tabular block">
              {risk.consecutive_losses} / 3
            </span>
          </div>
        </div>

        {/* Gate Status Checklist */}
        <div className="space-y-1.5 mb-3 text-xs font-mono">
          <div className="flex items-center justify-between text-[10px] text-voltron-400 uppercase pb-1">
            <span>Safety Gate Verification</span>
            <span className="text-voltron-emerald font-bold">
              {passingGates} / {totalGates} ACTIVE
            </span>
          </div>
          {risk.gates.slice(0, 3).map((g, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-2 rounded bg-voltron-900/40 border border-voltron-800"
            >
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-voltron-emerald font-bold">PASS</span>
                <span className="text-voltron-200">{g.name}</span>
              </div>
              <span className="text-[10px] font-bold text-voltron-emerald font-tabular">
                {g.current_value}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Kill Switch Banner Control */}
      <div className="pt-2 border-t border-voltron-750/60 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={clsx(
              "w-2 h-2 rounded-full",
              risk.kill_switch ? "bg-voltron-rose animate-ping" : "bg-voltron-emerald"
            )}
          ></span>
          <span className="text-voltron-300">
            Kill Switch: <strong className="text-white">{risk.kill_switch ? "ENGAGED" : "ARMED"}</strong>
          </span>
        </div>

        <button
          onClick={onOpenKillSwitch}
          className="px-3 py-1 rounded bg-voltron-rose/10 hover:bg-voltron-rose/20 border border-voltron-rose/30 text-[10px] font-mono font-bold text-voltron-rose transition-colors"
        >
          {risk.kill_switch ? "RESET" : "ENGAGE"}
        </button>
      </div>
    </div>
  );
}
