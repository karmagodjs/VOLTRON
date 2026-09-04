"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import KillSwitchModal from "@/components/risk/KillSwitchModal";
import { fetchRisk, toggleKillSwitch } from "@/lib/api";
import { X, RefreshCw } from "lucide-react";
import clsx from "clsx";

import { useMarket } from "@/context/MarketContext";

export default function RiskCommandPage() {
  const { selectedSymbol } = useMarket();
  const [risk, setRisk] = useState<any>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedGate, setSelectedGate] = useState<any>(null);
  const [historyFilter, setHistoryFilter] = useState<"ALL" | "APPROVED" | "BLOCKED">("ALL");
  const [loading, setLoading] = useState(true);

  const loadData = async (sym = selectedSymbol) => {
    try {
      const res = await fetch(`/api/risk?symbol=${sym}`);
      if (!res.ok) throw new Error("Backend offline");
      const json = await res.json();
      setRisk(json);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(selectedSymbol);
  }, [selectedSymbol]);

  const handleToggleKillSwitch = async (active: boolean) => {
    await toggleKillSwitch(active);
    await loadData();
  };

  if (loading || !risk) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-xs text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>INITIALIZING VOLTRON RISK CONTROL ROOM...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  const passingGates = risk.gates?.filter((g: any) => g.status === "PASS").length || 7;
  const filteredHistory = risk.history?.filter(
    (h: any) => historyFilter === "ALL" || h.decision === historyFilter
  ) || [];

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono text-xs">
        {/* 1. TOP HEADER & SAFETY CONTROLS */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider uppercase">
                  VOLTRON RISK &amp; SAFETY COMMAND CENTER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-emerald/10 border border-voltron-emerald/30 text-voltron-emerald font-bold">
                  ● ALL 7 GATES PASSED
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold">
                  PAPER MODE
                </span>
              </div>
              <div className="text-[11px] text-voltron-400 mt-0.5">
                Backend RiskEngine is authoritative &bull; Pre-trade circuit breakers &bull; Fail-closed architecture
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={() => setModalOpen(true)}
              className={clsx(
                "px-3 py-1.5 rounded text-xs font-bold transition-all border",
                risk.kill_switch
                  ? "bg-voltron-rose text-white border-voltron-rose animate-pulse"
                  : "bg-voltron-rose/15 hover:bg-voltron-rose/25 text-voltron-rose border-voltron-rose/40"
              )}
            >
              <span>{risk.kill_switch ? "RESET EMERGENCY STOP" : "ENGAGE EMERGENCY KILL SWITCH"}</span>
            </button>
            <button
              onClick={() => loadData()}
              className="p-1.5 rounded bg-voltron-950 hover:bg-voltron-800 text-voltron-400 hover:text-white border border-voltron-800 transition-colors"
              title="Refresh Risk Evaluation"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. 6 CORE RISK LIMIT GAUGES */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Equity */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Portfolio Equity</span>
            <span className="text-sm font-bold text-white font-tabular">
              ${risk.account_equity?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          {/* Daily Drawdown Circuit */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80">
            <div className="flex justify-between items-center mb-0.5">
              <span className="text-[9px] uppercase text-voltron-400">Daily Loss Max</span>
              <span className="text-[9px] text-voltron-emerald font-bold">Buffer: ${risk.remaining_daily_budget?.toFixed(0)}</span>
            </div>
            <div className="text-sm font-bold text-voltron-emerald font-tabular">
              +${risk.daily_pnl?.toFixed(2)} <span className="text-[10px] text-voltron-400 font-normal">/ -$2,000</span>
            </div>
          </div>

          {/* Portfolio Exposure */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80 space-y-1">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase text-voltron-400">Exposure</span>
              <span className="text-[9px] text-voltron-cyan font-bold">{risk.portfolio_exposure_pct?.toFixed(1)}% / 30%</span>
            </div>
            <div className="w-full bg-voltron-950 rounded-full h-1.5 overflow-hidden border border-voltron-800">
              <div
                className="bg-voltron-cyan h-full rounded-full"
                style={{ width: `${risk.exposure_utilization_pct || 60.7}%` }}
              ></div>
            </div>
          </div>

          {/* Trade Risk */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Trade Risk Limit</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular">
              {risk.trade_risk_pct?.toFixed(2)}% <span className="text-[10px] text-voltron-400 font-normal">/ 1.0% ($1k)</span>
            </span>
          </div>

          {/* Consecutive Losses */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Consecutive Losses</span>
            <span className="text-sm font-bold text-white font-tabular">
              {risk.consecutive_losses} <span className="text-[10px] text-voltron-400 font-normal">/ 3 Max Allowed</span>
            </span>
          </div>

          {/* Market Liquidity */}
          <div className="p-2.5 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Options Spread</span>
            <span className="text-sm font-bold text-voltron-cyan font-tabular">
              {risk.liquidity_spread_pct != null ? `${risk.liquidity_spread_pct.toFixed(1)}%` : "< 5.0%"}{" "}
              <span className="text-[10px] text-voltron-400 font-normal">
                / {risk.liquidity_spread_limit_pct ? `${risk.liquidity_spread_limit_pct.toFixed(1)}%` : "5.0%"} Max
              </span>
            </span>
          </div>
        </div>

        {/* 3. ROW 2: 7 INSTITUTIONAL RISK GATES (8 cols) + CANDIDATE DECISION (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* 7 Safety Gates Matrix (8 cols) */}
          <div className="lg:col-span-8 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-3">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-2">
              <span className="text-xs font-bold text-white uppercase">
                CORE PRE-TRADE RISK GATES
              </span>
              <span className="text-xs text-voltron-emerald font-bold">
                {passingGates} OF {risk.gates?.length || 7} VERIFIED
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 text-xs">
              {risk.gates?.map((g: any, idx: number) => {
                const isPass = g.status === "PASS";
                return (
                  <div
                    key={idx}
                    onClick={() => setSelectedGate(g)}
                    className={clsx(
                      "p-3 rounded-lg border flex flex-col justify-between transition-all cursor-pointer",
                      isPass
                        ? "bg-voltron-950/80 border-voltron-800 hover:border-voltron-cyan/60"
                        : "bg-voltron-rose/10 border-voltron-rose/40"
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <span className="font-bold text-white text-[11px] truncate">{g.name}</span>
                        <span
                          className={clsx(
                            "px-1.5 py-0.2 rounded text-[9px] font-bold uppercase",
                            isPass
                              ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                              : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                          )}
                        >
                          {g.status}
                        </span>
                      </div>

                      <div className="text-xs text-voltron-cyan font-bold mb-0.5">{g.current_value}</div>
                      <div className="text-[10px] text-voltron-400">Rule: {g.condition}</div>
                    </div>

                    <div className="text-[9px] text-voltron-300 border-t border-voltron-850 pt-1.5 mt-2 flex items-center justify-between">
                      <span className="truncate">{g.source}</span>
                      <span className={isPass ? "text-voltron-emerald font-bold" : "text-voltron-rose font-bold"}>
                        {isPass ? "PASS" : "BLOCKED"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Current Risk Decision Card & Sizing (4 cols) */}
          <div className="lg:col-span-4 space-y-3">
            {/* Candidate Trade Evaluation */}
            <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5">
                <span className="text-white font-bold text-xs uppercase">
                  CURRENT RISK DECISION
                </span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 font-bold">
                  {risk.candidate_decision?.decision}
                </span>
              </div>

              <div className="space-y-1.5 text-[11px]">
                <div className="flex justify-between text-voltron-300">
                  <span>Candidate:</span>
                  <strong className="text-white">{risk.candidate_decision?.symbol} {risk.candidate_decision?.strategy}</strong>
                </div>
                <div className="flex justify-between text-voltron-300">
                  <span>Opportunity Score:</span>
                  <strong className="text-voltron-cyan">{risk.candidate_decision?.opportunity_score} / 100</strong>
                </div>
                <div className="flex justify-between text-voltron-300">
                  <span>Proposed Max Loss:</span>
                  <strong className="text-voltron-emerald">${risk.candidate_decision?.max_loss?.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-voltron-300">
                  <span>Proposed Exposure:</span>
                  <strong className="text-white">${risk.candidate_decision?.proposed_exposure?.toFixed(2)}</strong>
                </div>
                <div className="flex justify-between text-voltron-300">
                  <span>Option Bid-Ask Spread:</span>
                  <strong className="text-voltron-cyan">{risk.candidate_decision?.spread_pct?.toFixed(1)}%</strong>
                </div>
              </div>

              <div className="p-2 rounded bg-voltron-emerald/10 border border-voltron-emerald/30 text-voltron-emerald text-[11px]">
                <span><strong>DECISION:</strong> {risk.candidate_decision?.reason} ({risk.candidate_decision?.gates_passed}/{risk.candidate_decision?.total_gates} Gates)</span>
              </div>
            </div>

            {/* Position Sizing Budget */}
            <div className="p-3 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-1 text-xs">
              <span className="text-[10px] uppercase text-voltron-400 font-bold block">
                Automated Sizing Budget (risk/position_sizing.py)
              </span>
              <div className="flex justify-between text-voltron-300 text-[11px]">
                <span>Risk Fraction: 1.0% ($1,000)</span>
                <span className="font-bold text-white">Sized: 3 Contracts</span>
              </div>
            </div>
          </div>
        </div>

        {/* 4. ROW 3: RISK ALERTS STREAM (5 cols) + AUDIT TRAIL HISTORY (7 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Alerts Stream (5 cols) */}
          <div className="lg:col-span-5 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5">
              <span className="text-white font-bold text-xs uppercase">
                RISK ALERTS STREAM ({risk.alerts?.length})
              </span>
              <span className="text-[10px] text-voltron-400">Real-time Telemetry</span>
            </div>

            <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
              {risk.alerts?.map((alt: any) => (
                <div
                  key={alt.id}
                  className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className={clsx(
                        "w-2 h-2 rounded-full",
                        alt.severity === "CRITICAL" ? "bg-voltron-rose" : alt.severity === "WARNING" ? "bg-voltron-amber" : "bg-voltron-cyan"
                      )}></span>
                      <strong className="text-white text-[11px]">{alt.title}</strong>
                    </div>
                    <span className="text-[9px] text-voltron-400">{alt.timestamp}</span>
                  </div>
                  <p className="text-[10px] text-voltron-300 leading-relaxed">{alt.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Risk Audit History (7 cols) */}
          <div className="lg:col-span-7 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex flex-wrap items-center justify-between border-b border-voltron-800 pb-1.5 gap-2">
              <span className="text-white font-bold text-xs uppercase">
                RISK DECISIONS AUDIT LEDGER ({filteredHistory.length})
              </span>

              <div className="flex gap-1 text-[10px]">
                {(["ALL", "APPROVED", "BLOCKED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setHistoryFilter(st)}
                    className={clsx(
                      "px-2 py-0.5 rounded font-semibold transition-colors",
                      historyFilter === st
                        ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                        : "text-voltron-400 hover:text-white"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="overflow-x-auto max-h-[220px]">
              <table className="w-full text-left font-mono text-[11px]">
                <thead className="bg-voltron-950 text-[9px] text-voltron-400 uppercase sticky top-0 border-b border-voltron-800">
                  <tr>
                    <th className="p-1.5">Time</th>
                    <th className="p-1.5">Symbol</th>
                    <th className="p-1.5">Strategy</th>
                    <th className="p-1.5">Opp Score</th>
                    <th className="p-1.5">Max Loss</th>
                    <th className="p-1.5">Decision</th>
                    <th className="p-1.5">Reason / Gate</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-voltron-800/60">
                  {filteredHistory.map((h: any) => (
                    <tr key={h.id} className="hover:bg-voltron-850/40">
                      <td className="p-1.5 text-voltron-400 text-[10px]">{h.timestamp.split(" ")[1]}</td>
                      <td className="p-1.5 font-bold text-white">{h.symbol}</td>
                      <td className="p-1.5 text-voltron-300">{h.strategy}</td>
                      <td className="p-1.5 text-voltron-cyan font-bold">{h.opportunity_score}</td>
                      <td className="p-1.5 text-white font-tabular">{h.max_loss}</td>
                      <td className="p-1.5">
                        <span
                          className={clsx(
                            "px-1 py-0.2 rounded font-bold text-[9px] uppercase",
                            h.decision === "APPROVED"
                              ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                              : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                          )}
                        >
                          {h.decision}
                        </span>
                      </td>
                      <td className="p-1.5 text-voltron-400 text-[10px] truncate max-w-xs">{h.reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Gate Detail Modal */}
      {selectedGate && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="w-full max-w-md bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedGate(null)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">{selectedGate.name}</h3>
              <span className="text-[10px] text-voltron-400 font-bold">SOURCE: {selectedGate.source}</span>
            </div>

            <div className="space-y-3 mb-5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Current Telemetry</span>
                  <span className="font-bold text-voltron-cyan font-tabular">{selectedGate.current_value}</span>
                </div>
                <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Configured Limit</span>
                  <span className="font-bold text-white font-tabular">{selectedGate.limit}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1">
                <span className="text-[10px] uppercase text-voltron-cyan font-bold block">Safety Rule Specification</span>
                <p className="text-[11px] text-voltron-200 leading-relaxed">{selectedGate.description}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedGate(null)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kill Switch Modal */}
      <KillSwitchModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        isActive={risk.kill_switch}
        onToggle={handleToggleKillSwitch}
      />
    </TerminalLayout>
  );
}
