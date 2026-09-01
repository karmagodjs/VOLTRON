"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import KillSwitchModal from "@/components/risk/KillSwitchModal";
import { fetchRisk, toggleKillSwitch } from "@/lib/api";
import { RiskStatus } from "@/types";
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Lock,
  Flame,
  Activity,
} from "lucide-react";
import clsx from "clsx";

export default function RiskCommandPage() {
  const [risk, setRisk] = useState<RiskStatus | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchRisk();
      setRisk(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleKillSwitch = async (active: boolean) => {
    await toggleKillSwitch(active);
    await loadData();
  };

  if (loading || !risk) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>EVALUATING 7 RISK GATES & CIRCUIT BREAKERS...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  const passingGates = risk.gates.filter((g) => g.status === "PASS").length;

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-rose/15 border border-voltron-rose/30 flex items-center justify-center text-voltron-rose shadow-rose-glow">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON RISK COMMAND CENTER</span>
                <span
                  className={clsx(
                    "text-xs px-2 py-0.5 rounded font-mono font-bold",
                    risk.overall_status === "APPROVED"
                      ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                      : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                  )}
                >
                  {risk.overall_status === "APPROVED" ? "ALL 7 GATES PASS" : "EXECUTION BLOCKED"}
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Institutional pre-trade checks, circuit breakers, and capital preservation limits
              </div>
            </div>
          </div>

          <button
            onClick={() => setModalOpen(true)}
            className={clsx(
              "px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all border flex items-center gap-2",
              risk.kill_switch
                ? "bg-voltron-rose text-white border-voltron-rose animate-pulse shadow-rose-glow"
                : "bg-voltron-rose/15 hover:bg-voltron-rose/25 text-voltron-rose border-voltron-rose/40"
            )}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{risk.kill_switch ? "RESET KILL SWITCH" : "ENGAGE EMERGENCY KILL SWITCH"}</span>
          </button>
        </div>

        {/* 6 Top Key Limits Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Portfolio Equity</span>
            <span className="text-base font-bold text-white font-tabular">
              ${risk.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Daily Realized P&L</span>
            <span className="text-base font-bold text-voltron-emerald font-tabular">
              +${risk.daily_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Portfolio Exposure</span>
            <span className="text-base font-bold text-white font-tabular">
              {risk.portfolio_exposure_pct.toFixed(1)}% <span className="text-[10px] text-voltron-400 font-normal">/ 30%</span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Trade Risk Limit</span>
            <span className="text-base font-bold text-voltron-emerald font-tabular">
              {risk.trade_risk_pct.toFixed(2)}% <span className="text-[10px] text-voltron-400 font-normal">/ 1.0%</span>
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Daily Drawdown Max</span>
            <span className="text-base font-bold text-voltron-rose font-tabular">
              {risk.daily_loss_limit_pct.toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Consecutive Losses</span>
            <span className="text-base font-bold text-white font-tabular">
              {risk.consecutive_losses} <span className="text-[10px] text-voltron-400 font-normal">/ 3 Max</span>
            </span>
          </div>
        </div>

        {/* 7 Detailed Safety Gate Cards */}
        <div className="terminal-card p-5 border border-voltron-750/90 bg-voltron-850/40 space-y-4">
          <div className="flex items-center justify-between border-b border-voltron-750 pb-3 font-mono">
            <span className="text-xs font-bold text-white uppercase flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-voltron-emerald" />
              Institutional Risk Gate Inspection Matrix
            </span>
            <span className="text-xs text-voltron-emerald font-bold">
              {passingGates} OF {risk.gates.length} GATES VERIFIED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 font-mono text-xs">
            {risk.gates.map((g, idx) => {
              const isPass = g.status === "PASS";
              return (
                <div
                  key={idx}
                  className={clsx(
                    "p-4 rounded-xl border flex flex-col justify-between transition-all",
                    isPass
                      ? "bg-voltron-900/80 border-voltron-800 hover:border-voltron-700"
                      : "bg-voltron-rose/10 border-voltron-rose/40"
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="font-bold text-white text-xs">{g.name}</span>
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                          isPass
                            ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                            : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                        )}
                      >
                        {g.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-voltron-cyan font-semibold mb-1">
                      {g.current_value}
                    </div>

                    <div className="text-[10px] text-voltron-400 mb-2">
                      Rule: {g.condition}
                    </div>
                  </div>

                  <div className="text-[10px] text-voltron-300 border-t border-voltron-800/80 pt-2 flex items-center gap-1.5">
                    {isPass ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-voltron-emerald flex-shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-voltron-rose flex-shrink-0" />
                    )}
                    <span>{g.description}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <KillSwitchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isActive={risk.kill_switch}
        onToggle={handleToggleKillSwitch}
      />
    </TerminalLayout>
  );
}
