"use client";

import { useState } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  TrendingUp,
  TrendingDown,
  Flame,
  Search,
  ArrowUpDown,
  Sparkles,
  ExternalLink,
  Zap,
} from "lucide-react";
import Link from "next/link";
import clsx from "clsx";

interface AssetScanRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_pct: number;
  rv: number;
  iv: number;
  iv_rv: number;
  premium: number;
  score: number;
  regime: string;
  strategy: string;
  signal: "EXPENSIVE" | "CHEAP" | "FAIR";
}

const scannerData: AssetScanRow[] = [
  {
    symbol: "SPY",
    name: "S&P 500 ETF",
    price: 591.42,
    change: 4.82,
    change_pct: 0.82,
    rv: 10.42,
    iv: 16.85,
    iv_rv: 1.62,
    premium: 61.7,
    score: 94,
    regime: "HIGH IV SPREAD",
    strategy: "IRON_CONDOR",
    signal: "EXPENSIVE",
  },
  {
    symbol: "QQQ",
    name: "Nasdaq 100 ETF",
    price: 498.75,
    change: 6.2,
    change_pct: 1.26,
    rv: 13.85,
    iv: 20.4,
    iv_rv: 1.47,
    premium: 47.3,
    score: 89,
    regime: "BULLISH EXPANSION",
    strategy: "BULL_PUT_SPREAD",
    signal: "EXPENSIVE",
  },
  {
    symbol: "IWM",
    name: "Russell 2000 ETF",
    price: 222.18,
    change: -1.15,
    change_pct: -0.51,
    rv: 16.2,
    iv: 23.5,
    iv_rv: 1.45,
    premium: 45.1,
    score: 86,
    regime: "BEARISH ROTATION",
    strategy: "BEAR_CALL_SPREAD",
    signal: "EXPENSIVE",
  },
  {
    symbol: "NVDA",
    name: "Nvidia Corporation",
    price: 128.4,
    change: 3.12,
    change_pct: 2.49,
    rv: 34.5,
    iv: 48.2,
    iv_rv: 1.4,
    premium: 39.7,
    score: 82,
    regime: "EARNINGS HIGH IV",
    strategy: "IRON_CONDOR",
    signal: "EXPENSIVE",
  },
  {
    symbol: "AAPL",
    name: "Apple Inc.",
    price: 228.6,
    change: 0.45,
    change_pct: 0.2,
    rv: 14.1,
    iv: 17.2,
    iv_rv: 1.22,
    premium: 22.0,
    score: 68,
    regime: "LOW SPREAD",
    strategy: "NO_TRADE",
    signal: "FAIR",
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc.",
    price: 218.8,
    change: -4.3,
    change_pct: -1.93,
    rv: 48.2,
    iv: 41.5,
    iv_rv: 0.86,
    premium: -13.9,
    score: 74,
    regime: "VOLATILITY COMPRESSED",
    strategy: "LONG_STRADDLE",
    signal: "CHEAP",
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corporation",
    price: 432.1,
    change: 2.8,
    change_pct: 0.65,
    rv: 13.5,
    iv: 16.9,
    iv_rv: 1.25,
    premium: 25.2,
    score: 64,
    regime: "FAIR VALUE",
    strategy: "NO_TRADE",
    signal: "FAIR",
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc.",
    price: 188.5,
    change: 1.4,
    change_pct: 0.75,
    rv: 18.2,
    iv: 24.8,
    iv_rv: 1.36,
    premium: 36.3,
    score: 79,
    regime: "MODERATE SPREAD",
    strategy: "BULL_PUT_SPREAD",
    signal: "EXPENSIVE",
  },
];

export default function MarketsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSignal, setFilterSignal] = useState<string>("ALL");

  const filtered = scannerData.filter((item) => {
    const matchesSearch =
      item.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSignal = filterSignal === "ALL" || item.signal === filterSignal;
    return matchesSearch && matchesSignal;
  });

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-voltron-850 border border-voltron-750">
          <div>
            <h1 className="text-lg font-mono font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-voltron-cyan" />
              MARKET VOLATILITY INTELLIGENCE & ASSET SCANNER
            </h1>
            <p className="text-xs font-mono text-voltron-400">
              Live quantitative screening across US equities & indices for Implied vs Realized Volatility dispersion.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-voltron-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter Ticker..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-voltron-950 border border-voltron-700 text-xs font-mono text-white outline-none focus:border-voltron-cyan w-44"
              />
            </div>

            <div className="flex gap-1 bg-voltron-900 p-1 rounded-lg border border-voltron-750 text-xs font-mono">
              {["ALL", "EXPENSIVE", "CHEAP", "FAIR"].map((sig) => (
                <button
                  key={sig}
                  onClick={() => setFilterSignal(sig)}
                  className={clsx(
                    "px-2.5 py-1 rounded text-[11px] font-semibold transition-colors",
                    filterSignal === sig
                      ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                      : "text-voltron-400 hover:text-white"
                  )}
                >
                  {sig}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Institutional Scanner Table */}
        <div className="terminal-card overflow-hidden border border-voltron-750/80 bg-voltron-850/40">
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-voltron-950/80 border-b border-voltron-750 text-[10px] uppercase text-voltron-400 tracking-wider">
                <tr>
                  <th className="p-3">Asset</th>
                  <th className="p-3">Spot Price</th>
                  <th className="p-3">24h Change</th>
                  <th className="p-3">20D RV</th>
                  <th className="p-3">ATM IV</th>
                  <th className="p-3">IV / RV Spread</th>
                  <th className="p-3">Vol Signal</th>
                  <th className="p-3">Alpha Score</th>
                  <th className="p-3">Target Strategy</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-voltron-800">
                {filtered.map((row) => {
                  const isPos = row.change >= 0;
                  return (
                    <tr
                      key={row.symbol}
                      className="hover:bg-voltron-800/40 transition-colors group"
                    >
                      <td className="p-3 font-bold text-white flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan text-[11px]">
                          {row.symbol[0]}
                        </div>
                        <div>
                          <span>{row.symbol}</span>
                          <span className="block text-[10px] text-voltron-400 font-normal">
                            {row.name}
                          </span>
                        </div>
                      </td>

                      <td className="p-3 font-bold text-white font-tabular">
                        ${row.price.toFixed(2)}
                      </td>

                      <td className="p-3 font-tabular">
                        <span
                          className={clsx(
                            "inline-flex items-center gap-0.5 font-bold",
                            isPos ? "text-voltron-emerald" : "text-voltron-rose"
                          )}
                        >
                          {isPos ? "+" : ""}
                          {row.change_pct.toFixed(2)}%
                        </span>
                      </td>

                      <td className="p-3 font-tabular text-voltron-300">
                        {row.rv.toFixed(2)}%
                      </td>

                      <td className="p-3 font-tabular text-voltron-cyan font-bold">
                        {row.iv.toFixed(2)}%
                      </td>

                      <td className="p-3 font-tabular">
                        <span className="font-bold text-voltron-emerald">
                          {row.iv_rv.toFixed(2)}x
                        </span>
                        <span className="text-[10px] text-voltron-400 ml-1">
                          (+{row.premium.toFixed(1)}%)
                        </span>
                      </td>

                      <td className="p-3">
                        <span
                          className={clsx(
                            "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                            row.signal === "EXPENSIVE"
                              ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                              : row.signal === "CHEAP"
                              ? "bg-voltron-violet/15 text-voltron-violet border border-voltron-violet/30"
                              : "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
                          )}
                        >
                          {row.signal}
                        </span>
                      </td>

                      <td className="p-3 font-tabular font-bold text-white">
                        <span className="flex items-center gap-1 text-voltron-cyan">
                          <Sparkles className="w-3 h-3" />
                          {row.score}
                        </span>
                      </td>

                      <td className="p-3">
                        <span className="px-2 py-0.5 rounded bg-voltron-900 border border-voltron-750 text-[10px] text-voltron-200">
                          {row.strategy.replace(/_/g, " ")}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <Link
                          href={`/options?symbol=${row.symbol}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] text-voltron-cyan font-bold border border-voltron-700 transition-colors"
                        >
                          <span>Chain</span>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </td>
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
