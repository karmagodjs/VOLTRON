"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchOptionsChain } from "@/lib/api";
import { OptionChainData } from "@/types";
import { Layers, Calendar, ArrowRightLeft, Sparkles, Filter, SlidersHorizontal } from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

export default function OptionsTerminalPage() {
  const [symbol, setSymbol] = useState("SPY");
  const [data, setData] = useState<OptionChainData | null>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "ATM" | "ITM" | "OTM">("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchOptionsChain(symbol, selectedExp || undefined)
      .then((res) => {
        setData(res);
        if (!selectedExp && res.expirations.length > 0) {
          setSelectedExp(res.selected_expiration);
        }
      })
      .finally(() => setLoading(false));
  }, [symbol, selectedExp]);

  if (loading || !data) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>LOADING OPTIONS MATRIX & DERIBIT-GRADE GREEKS...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  const filteredChain = data.chain.filter((row) => {
    if (filterMode === "ATM") return row.is_atm;
    if (filterMode === "ITM") return row.strike < data.spot_price;
    if (filterMode === "OTM") return row.strike > data.spot_price;
    return true;
  });

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Top Control Bar */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>{data.symbol} OPTIONS CHAIN TERMINAL</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30">
                  SPOT: ${data.spot_price.toFixed(2)}
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Institutional real-time Greeks calculation (Black-Scholes & Skew Adjusted)
              </div>
            </div>
          </div>

          {/* Expiration Selector */}
          <div className="flex items-center gap-1.5 overflow-x-auto bg-voltron-900 p-1 rounded-lg border border-voltron-750">
            <span className="text-[10px] font-mono text-voltron-400 px-2 flex items-center gap-1">
              <Calendar className="w-3 h-3" /> EXP:
            </span>
            {data.expirations.map((exp) => (
              <button
                key={exp}
                onClick={() => setSelectedExp(exp)}
                className={clsx(
                  "px-2.5 py-1 rounded text-xs font-mono font-semibold transition-all flex-shrink-0",
                  (selectedExp || data.selected_expiration) === exp
                    ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                {exp}
              </button>
            ))}
          </div>

          {/* Quick Strategy Builder CTA */}
          <Link
            href={`/strategies?symbol=${data.symbol}`}
            className="px-3 py-1.5 rounded-lg bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 text-xs font-mono font-bold shadow-cyan-glow transition-all flex items-center gap-1.5"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Launch Strategy Builder</span>
          </Link>
        </div>

        {/* Moneyness Filter Bar */}
        <div className="flex items-center justify-between text-xs font-mono px-1">
          <div className="flex items-center gap-1">
            <span className="text-voltron-400 mr-1">Filter Moneyness:</span>
            {(["ALL", "ATM", "ITM", "OTM"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={clsx(
                  "px-2.5 py-0.5 rounded text-[11px] transition-colors",
                  filterMode === mode
                    ? "bg-voltron-800 text-voltron-cyan border border-voltron-700"
                    : "text-voltron-400 hover:text-voltron-200"
                )}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="text-[11px] text-voltron-400">
            DTE: <strong className="text-white">{data.days_to_expiration} Days</strong> | Strikes: <strong className="text-white">{filteredChain.length}</strong>
          </div>
        </div>

        {/* Institutional Options Chain Table */}
        <div className="terminal-card overflow-hidden border border-voltron-750/80 bg-voltron-850/40">
          <div className="overflow-x-auto">
            <table className="w-full text-center font-mono text-[11px]">
              {/* Top Grouped Header: CALLS | STRIKE | PUTS */}
              <thead className="bg-voltron-950 border-b border-voltron-750">
                <tr>
                  <th colSpan={7} className="p-2 text-voltron-cyan font-bold border-r border-voltron-800 uppercase tracking-widest text-xs">
                    CALLS (BULLISH)
                  </th>
                  <th className="p-2 text-white font-bold bg-voltron-900 border-x border-voltron-800 uppercase tracking-widest text-xs">
                    STRIKE
                  </th>
                  <th colSpan={7} className="p-2 text-voltron-violet font-bold border-l border-voltron-800 uppercase tracking-widest text-xs">
                    PUTS (BEARISH)
                  </th>
                </tr>
                <tr className="bg-voltron-900/90 text-[10px] uppercase text-voltron-400 border-b border-voltron-750">
                  <th className="p-2">Vol</th>
                  <th className="p-2">OI</th>
                  <th className="p-2">&Delta; Delta</th>
                  <th className="p-2">&Theta; Theta</th>
                  <th className="p-2">IV %</th>
                  <th className="p-2">Bid</th>
                  <th className="p-2 border-r border-voltron-800">Ask</th>

                  <th className="p-2 font-bold text-white bg-voltron-850 border-x border-voltron-800">
                    Strike ($)
                  </th>

                  <th className="p-2 border-l border-voltron-800">Bid</th>
                  <th className="p-2">Ask</th>
                  <th className="p-2">IV %</th>
                  <th className="p-2">&Delta; Delta</th>
                  <th className="p-2">&Theta; Theta</th>
                  <th className="p-2">OI</th>
                  <th className="p-2">Vol</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-voltron-800/80">
                {filteredChain.map((row) => {
                  const isAtm = row.is_atm;
                  return (
                    <tr
                      key={row.strike}
                      className={clsx(
                        "transition-colors",
                        isAtm
                          ? "bg-voltron-cyan/10 hover:bg-voltron-cyan/15 font-bold"
                          : "hover:bg-voltron-800/40"
                      )}
                    >
                      {/* CALL DATA */}
                      <td className="p-2 text-voltron-400 font-tabular">{row.call.volume}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{row.call.open_interest}</td>
                      <td className="p-2 text-voltron-300 font-tabular">{row.call.delta.toFixed(2)}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{row.call.theta.toFixed(2)}</td>
                      <td className="p-2 text-voltron-cyan font-tabular">{row.call.iv.toFixed(1)}%</td>
                      <td className="p-2 text-white font-tabular font-semibold">${row.call.bid.toFixed(2)}</td>
                      <td className="p-2 text-white font-tabular font-semibold border-r border-voltron-800">
                        ${row.call.ask.toFixed(2)}
                      </td>

                      {/* STRIKE CENTER COLUMN */}
                      <td
                        className={clsx(
                          "p-2 font-bold font-tabular text-sm border-x border-voltron-800",
                          isAtm
                            ? "bg-voltron-cyan/20 text-voltron-cyan shadow-cyan-glow"
                            : "bg-voltron-900/80 text-white"
                        )}
                      >
                        ${row.strike.toFixed(2)}
                        {isAtm && (
                          <span className="block text-[8px] uppercase tracking-tighter text-voltron-cyan">
                            ATM
                          </span>
                        )}
                      </td>

                      {/* PUT DATA */}
                      <td className="p-2 text-white font-tabular font-semibold border-l border-voltron-800">
                        ${row.put.bid.toFixed(2)}
                      </td>
                      <td className="p-2 text-white font-tabular font-semibold">${row.put.ask.toFixed(2)}</td>
                      <td className="p-2 text-voltron-violet font-tabular">{row.put.iv.toFixed(1)}%</td>
                      <td className="p-2 text-voltron-300 font-tabular">{row.put.delta.toFixed(2)}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{row.put.theta.toFixed(2)}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{row.put.open_interest}</td>
                      <td className="p-2 text-voltron-400 font-tabular">{row.put.volume}</td>
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
