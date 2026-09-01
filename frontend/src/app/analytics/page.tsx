"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  Calendar,
  Award,
  ShieldCheck,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
} from "recharts";
import clsx from "clsx";

export default function AnalyticsPage() {
  const [monthlyData] = useState([
    { month: "Jan", pnl: 1420.0 },
    { month: "Feb", pnl: 980.0 },
    { month: "Mar", pnl: 2150.0 },
    { month: "Apr", pnl: -420.0 },
    { month: "May", pnl: 1840.0 },
    { month: "Jun", pnl: 2310.0 },
    { month: "Jul", pnl: 1650.0 },
    { month: "Aug", pnl: 1510.0 },
  ]);

  const [strategyPerformance] = useState([
    { strategy: "IRON CONDOR", win_rate: 78.4, pnl: 5820.0, trades: 34, sharpe: 2.14 },
    { strategy: "BULL PUT SPREAD", win_rate: 81.2, pnl: 4120.0, trades: 22, sharpe: 2.45 },
    { strategy: "BEAR CALL SPREAD", win_rate: 75.0, pnl: 1950.0, trades: 12, sharpe: 1.88 },
    { strategy: "LONG STRADDLE", win_rate: 45.0, pnl: -450.0, trades: 4, sharpe: 0.85 },
  ]);

  const equityWalk = Array.from({ length: 30 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    equity: +(100000 + i * 380 + Math.sin(i * 0.7) * 450).toFixed(2),
    drawdown: +(Math.max(0, Math.sin(i * 0.5) * 2.2)).toFixed(2),
  }));

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON QUANTITATIVE ALPHA ANALYTICS</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30 font-mono">
                  AGGREGATE METRICS
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Performance attribution, strategy alpha distribution, and monthly returns
              </div>
            </div>
          </div>

          <div className="text-xs font-mono text-voltron-300 flex items-center gap-2">
            <span>Overall Win Rate:</span>
            <span className="text-voltron-emerald font-bold">78.4%</span>
          </div>
        </div>

        {/* 2-Column Grid: Cumulative Equity vs Monthly P&L */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Cumulative Equity Curve (7 cols) */}
          <div className="lg:col-span-7 terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col h-[360px]">
            <div className="flex items-center justify-between border-b border-voltron-750/60 pb-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <TrendingUp className="w-4 h-4 text-voltron-cyan" />
                <span>Cumulative Alpha Walk</span>
              </div>
              <span className="text-[11px] font-mono text-voltron-emerald font-bold">
                +$11,440.00 (+11.4%)
              </span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityWalk}>
                  <defs>
                    <linearGradient id="anGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
                  <XAxis dataKey="day" stroke="#4A5568" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4A5568" fontSize={10} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E1118",
                      borderColor: "#1E2638",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "Equity"]}
                  />
                  <Area type="monotone" dataKey="equity" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#anGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly P&L Distribution (5 cols) */}
          <div className="lg:col-span-5 terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col h-[360px]">
            <div className="flex items-center justify-between border-b border-voltron-750/60 pb-2 mb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-white uppercase">
                <Calendar className="w-4 h-4 text-voltron-cyan" />
                <span>Monthly Return Distribution</span>
              </div>
              <span className="text-[11px] font-mono text-voltron-300">
                8 Months Audited
              </span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
                  <XAxis dataKey="month" stroke="#4A5568" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4A5568" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0E1118",
                      borderColor: "#1E2638",
                      borderRadius: "8px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(v: any) => [`$${Number(v).toLocaleString()}`, "P&L"]}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {monthlyData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.pnl >= 0 ? "#00E676" : "#FF3B30"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Strategy Performance Comparison Breakdown Table */}
        <div className="terminal-card p-5 border border-voltron-750/90 bg-voltron-850/40 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between border-b border-voltron-750 pb-2 text-white font-bold uppercase">
            <span>Strategy Alpha Attribution Matrix</span>
            <span className="text-[10px] text-voltron-cyan font-normal">
              72 Simulated & Paper Trades
            </span>
          </div>

          <table className="w-full text-left font-mono text-xs">
            <thead className="bg-voltron-900 text-[10px] text-voltron-400 uppercase">
              <tr>
                <th className="p-2.5">Strategy</th>
                <th className="p-2.5">Win Rate</th>
                <th className="p-2.5">Realized P&L</th>
                <th className="p-2.5">Trades Count</th>
                <th className="p-2.5">Sharpe Ratio</th>
                <th className="p-2.5 text-right">Edge Quality</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-voltron-800 text-[11px]">
              {strategyPerformance.map((st) => (
                <tr key={st.strategy} className="hover:bg-voltron-800/30">
                  <td className="p-2.5 font-bold text-white">{st.strategy}</td>
                  <td className="p-2.5 font-bold text-voltron-emerald font-tabular">{st.win_rate}%</td>
                  <td className={clsx("p-2.5 font-bold font-tabular", st.pnl >= 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                    {st.pnl >= 0 ? "+" : ""}${st.pnl.toFixed(2)}
                  </td>
                  <td className="p-2.5 text-voltron-300 font-tabular">{st.trades}</td>
                  <td className="p-2.5 text-voltron-cyan font-tabular">{st.sharpe.toFixed(2)}</td>
                  <td className="p-2.5 text-right">
                    <span className="px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald font-bold text-[10px]">
                      OPTIMAL ALPHA
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </TerminalLayout>
  );
}
