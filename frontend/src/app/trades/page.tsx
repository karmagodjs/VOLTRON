"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchTrades } from "@/lib/api";
import { TradeRecord } from "@/types";
import { History, Download, Filter, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import clsx from "clsx";

export default function TradesPage() {
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrades().then((res) => {
      setTrades(res);
      setLoading(false);
    });
  }, []);

  const filteredTrades = trades.filter(
    (t) => statusFilter === "ALL" || t.status === statusFilter
  );

  const exportCSV = () => {
    const headers = ["ID", "Time", "Symbol", "Strategy", "Direction", "Entry", "Exit", "PnL", "Return", "Risk", "Status", "Reason"];
    const rows = filteredTrades.map((t) => [
      t.id,
      t.time,
      t.symbol,
      t.strategy,
      t.direction,
      t.entry_credit,
      t.exit_price,
      t.pnl,
      t.return_pct,
      t.risk,
      t.status,
      t.exit_reason,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voltron_paper_trades_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON TRADE AUDIT & EXECUTION LEDGER</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30">
                  {trades.length} TOTAL AUDITED
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Complete verifiable history of paper executions, exits, and safety rejections
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Status Filter Buttons */}
            <div className="flex gap-1 bg-voltron-900 p-1 rounded-lg border border-voltron-750 text-xs font-mono">
              {(["ALL", "OPEN", "CLOSED", "REJECTED", "CANCELLED"] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={clsx(
                    "px-2.5 py-1 rounded text-[11px] font-semibold transition-colors uppercase",
                    statusFilter === st
                      ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                      : "text-voltron-400 hover:text-white"
                  )}
                >
                  {st}
                </button>
              ))}
            </div>

            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-mono font-bold text-white border border-voltron-700 transition-colors flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-voltron-cyan" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="terminal-card overflow-hidden border border-voltron-750/80 bg-voltron-850/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-voltron-950/90 border-b border-voltron-750 text-[10px] uppercase text-voltron-400 tracking-wider">
                <tr>
                  <th className="p-3">Trade ID</th>
                  <th className="p-3">Timestamp</th>
                  <th className="p-3">Symbol</th>
                  <th className="p-3">Strategy</th>
                  <th className="p-3">Direction</th>
                  <th className="p-3">Entry Credit</th>
                  <th className="p-3">Exit Price</th>
                  <th className="p-3">P&L ($)</th>
                  <th className="p-3">Return</th>
                  <th className="p-3">Max Risk</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Reason / Trigger</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-voltron-800">
                {filteredTrades.map((t) => {
                  const isPos = t.pnl_raw > 0;
                  const isNeg = t.pnl_raw < 0;

                  return (
                    <tr key={t.id} className="hover:bg-voltron-800/40 transition-colors">
                      <td className="p-3 font-bold text-voltron-cyan">{t.id}</td>
                      <td className="p-3 text-voltron-300 text-[11px] font-tabular">{t.time}</td>
                      <td className="p-3 font-bold text-white">{t.symbol}</td>
                      <td className="p-3 text-voltron-200">{t.strategy.replace(/_/g, " ")}</td>
                      <td className="p-3 text-voltron-400 text-[11px]">{t.direction}</td>
                      <td className="p-3 font-tabular text-white">{t.entry_credit}</td>
                      <td className="p-3 font-tabular text-voltron-300">{t.exit_price}</td>
                      <td
                        className={clsx(
                          "p-3 font-bold font-tabular",
                          isPos ? "text-voltron-emerald" : isNeg ? "text-voltron-rose" : "text-voltron-400"
                        )}
                      >
                        {t.pnl}
                      </td>
                      <td
                        className={clsx(
                          "p-3 font-bold font-tabular",
                          isPos ? "text-voltron-emerald" : isNeg ? "text-voltron-rose" : "text-voltron-400"
                        )}
                      >
                        {t.return_pct}
                      </td>
                      <td className="p-3 font-tabular text-voltron-400">{t.risk}</td>
                      <td className="p-3">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            t.status === "OPEN"
                              ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                              : t.status === "CLOSED"
                              ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                              : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                          )}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="p-3 text-[11px] text-voltron-400">{t.exit_reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
