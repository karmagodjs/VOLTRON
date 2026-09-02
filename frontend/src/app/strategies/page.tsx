"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchStrategy } from "@/lib/api";
import { StrategyDetails } from "@/types";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import clsx from "clsx";

import { useSearchParams } from "next/navigation";
import { useMarket } from "@/context/MarketContext";

const strategyList = [
  { id: "IRON_CONDOR", name: "Iron Condor", type: "Credit Multi-Leg", sentiment: "NEUTRAL", edge: "High IV Spread" },
  { id: "BULL_PUT_SPREAD", name: "Bull Put Spread", type: "Credit Spread", sentiment: "BULLISH", edge: "Moderate IV" },
  { id: "BEAR_CALL_SPREAD", name: "Bear Call Spread", type: "Credit Spread", sentiment: "BEARISH", edge: "High Resistance" },
  { id: "BULL_CALL_SPREAD", name: "Bull Call Spread", type: "Debit Spread", sentiment: "BULLISH", edge: "Low IV Directional" },
  { id: "BEAR_PUT_SPREAD", name: "Bear Put Spread", type: "Debit Spread", sentiment: "BEARISH", edge: "Breakdown" },
  { id: "LONG_STRADDLE", name: "Long Straddle", type: "Volatility Long", sentiment: "VOL_EXPANSION", edge: "Compressed IV" },
];

export default function StrategiesPage() {
  const searchParams = useSearchParams();
  const { selectedSymbol } = useMarket();
  const symbol = searchParams.get("symbol")?.toUpperCase() || selectedSymbol || "SPY";
  const [selectedStrategy, setSelectedStrategy] = useState("IRON_CONDOR");
  const [details, setDetails] = useState<StrategyDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchStrategy(selectedStrategy, symbol)
      .then((res) => setDetails(res))
      .finally(() => setLoading(false));
  }, [selectedStrategy, symbol]);

  if (loading || !details) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>CALCULATING MULTI-LEG PAYOFF & GREEKS METRICS...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>STRATEGY ENGINE & PAYOFF LAB</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30">
                  {details.symbol} @ ${details.spot_price.toFixed(2)}
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Defined-Risk Structure Optimization & Quantitative Probability Profiler
              </div>
            </div>
          </div>

          {/* Strategy Dropdown / Quick Select */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-voltron-900 p-1 rounded-lg border border-voltron-750">
            {strategyList.map((st) => (
              <button
                key={st.id}
                onClick={() => setSelectedStrategy(st.id)}
                className={clsx(
                  "px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all flex-shrink-0",
                  selectedStrategy === st.id
                    ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                {st.name}
              </button>
            ))}
          </div>
        </div>

        {/* 2-Column Grid: Left Strategy Details & Legs / Right Payoff Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left: Strategy Legs & Key Quant Stats (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* 6 Key Strategy Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 font-mono text-xs">
              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Max Profit</span>
                <span className="text-sm font-bold text-voltron-emerald font-tabular">
                  ${details.max_profit > 99999 ? "UNLIMITED" : details.max_profit.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Max Loss</span>
                <span className="text-sm font-bold text-voltron-rose font-tabular">
                  ${details.max_loss.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Win Probability</span>
                <span className="text-sm font-bold text-voltron-cyan font-tabular">
                  {details.win_probability.toFixed(1)}%
                </span>
              </div>

              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Breakeven Lower</span>
                <span className="text-sm font-bold text-white font-tabular">
                  {details.breakeven_lower ? `$${details.breakeven_lower.toFixed(2)}` : "None"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Breakeven Upper</span>
                <span className="text-sm font-bold text-white font-tabular">
                  {details.breakeven_upper ? `$${details.breakeven_upper.toFixed(2)}` : "None"}
                </span>
              </div>

              <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
                <span className="text-[10px] text-voltron-400 uppercase block mb-1">Capital Required</span>
                <span className="text-sm font-bold text-voltron-300 font-tabular">
                  ${details.capital_required.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Configured Strategy Legs Table */}
            <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40">
              <div className="flex items-center justify-between border-b border-voltron-750/60 pb-2 mb-3 text-xs font-mono font-bold text-white uppercase">
                <span>Multi-Leg Construction</span>
                <span className="text-[10px] text-voltron-cyan font-normal">
                  {details.legs.length} Legs Configured
                </span>
              </div>

              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-voltron-900 text-[10px] text-voltron-400 uppercase">
                  <tr>
                    <th className="p-2">Action</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Strike</th>
                    <th className="p-2">Est. Premium</th>
                    <th className="p-2">IV</th>
                    <th className="p-2">&Delta; Delta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-voltron-800 text-[11px]">
                  {details.legs.map((leg, idx) => (
                    <tr key={idx} className="hover:bg-voltron-800/30">
                      <td className="p-2">
                        <span
                          className={clsx(
                            "px-1.5 py-0.5 rounded text-[10px] font-bold uppercase",
                            leg.action === "BUY"
                              ? "bg-voltron-cyan/15 text-voltron-cyan"
                              : "bg-voltron-emerald/15 text-voltron-emerald"
                          )}
                        >
                          {leg.action}
                        </span>
                      </td>
                      <td className="p-2 text-white font-semibold">{leg.type}</td>
                      <td className="p-2 font-bold text-white font-tabular">${leg.strike.toFixed(2)}</td>
                      <td className="p-2 text-voltron-300 font-tabular">${leg.price.toFixed(2)}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{leg.iv.toFixed(1)}%</td>
                      <td className="p-2 text-voltron-300 font-tabular">{leg.delta.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Interactive Options Payoff Curve (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col h-[400px]">
              <div className="flex items-center justify-between border-b border-voltron-750/60 pb-2 mb-3">
                <div className="text-xs font-mono font-bold text-white uppercase">
                  <span>EXPIRATION PAYOFF CURVE (P&L VS UNDERLYING)</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] font-mono">
                  <span className="text-voltron-emerald">■ Profit Area</span>
                  <span className="text-voltron-rose">■ Loss Area</span>
                </div>
              </div>

              <div className="flex-1 w-full min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={details.payoff_curve}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" />
                    <XAxis dataKey="price" stroke="#4A5568" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <YAxis stroke="#4A5568" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0E1118",
                        borderColor: "#1E2638",
                        borderRadius: "8px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                      }}
                      formatter={(val: any) => [`$${Number(val).toFixed(2)} P&L`, "Payoff"]}
                      labelFormatter={(lbl) => `Underlying Price: $${lbl}`}
                    />
                    <ReferenceLine y={0} stroke="#4A5568" strokeDasharray="2 2" />
                    <ReferenceLine x={details.spot_price} stroke="#00F0FF" strokeDasharray="3 3" label={{ value: "SPOT", fill: "#00F0FF", fontSize: 10 }} />
                    <Line
                      type="monotone"
                      dataKey="pnl"
                      stroke="#00E676"
                      strokeWidth={2.5}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div className="text-[10px] font-mono text-voltron-400 border-t border-voltron-750/40 pt-2 flex justify-between">
                <span>Calculated at T=0 Expiration Payoff</span>
                <span className="text-voltron-cyan font-bold">Reward/Risk: {details.risk_reward_ratio}x</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
