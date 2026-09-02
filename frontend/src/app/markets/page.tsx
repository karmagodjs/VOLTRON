"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  Search,
  RefreshCw,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  Cpu,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import clsx from "clsx";

interface AssetScanRow {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  realized_volatility: number;
  implied_volatility: number;
  iv_rv_ratio: number;
  iv_premium: number;
  opportunity_score: number;
  market_regime: string;
  vol_signal: "EXPENSIVE" | "CHEAP" | "FAIR";
  strategy: string;
}

import { useMarket } from "@/context/MarketContext";

export default function MarketsPage() {
  const router = useRouter();
  const { selectedSymbol, setSelectedSymbol } = useMarket();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterSignal, setFilterSignal] = useState<string>("ALL");
  const [assets, setAssets] = useState<AssetScanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadMarketScanner = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/market?all=true");
      if (!res.ok) throw new Error("Failed to load market scan data");
      const data = await res.json();
      setAssets(data.assets || []);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Market data service temporarily unavailable");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMarketScanner();
    const interval = setInterval(loadMarketScanner, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleSelectRow = (sym: string) => {
    setSelectedSymbol(sym, true);
  };

  const filtered = assets.filter((item) => {
    const sTerm = searchTerm.toLowerCase().trim();
    const matchesSearch =
      !sTerm ||
      item.symbol.toLowerCase().includes(sTerm) ||
      item.name.toLowerCase().includes(sTerm);
    const matchesSignal =
      filterSignal === "ALL" || item.vol_signal === filterSignal;
    return matchesSearch && matchesSignal;
  });

  return (
    <TerminalLayout>
      <div className="space-y-3 sm:space-y-4 max-w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 p-3.5 sm:p-4 rounded-xl bg-voltron-850 border border-voltron-750">
          <div>
            <h1 className="text-sm sm:text-base font-mono font-bold text-white uppercase tracking-wider">
              MARKET VOLATILITY INTELLIGENCE & ASSET SCANNER
            </h1>
            <p className="text-[11px] sm:text-xs font-mono text-voltron-400 mt-0.5">
              Live quantitative screening across US equities & indices for Implied vs Realized Volatility dispersion. Active Context: <span className="text-voltron-cyan font-bold">{selectedSymbol}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 text-voltron-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter Ticker..."
                className="pl-8 pr-3 py-1.5 rounded-lg bg-voltron-950 border border-voltron-700 text-xs font-mono text-white outline-none focus:border-voltron-cyan w-full sm:w-44"
              />
            </div>

            {/* Volatility Regime Filters */}
            <div className="flex gap-1 bg-voltron-900 p-1 rounded-lg border border-voltron-750 text-xs font-mono overflow-x-auto">
              {["ALL", "EXPENSIVE", "CHEAP", "FAIR"].map((sig) => (
                <button
                  key={sig}
                  onClick={() => setFilterSignal(sig)}
                  className={clsx(
                    "px-2 sm:px-2.5 py-1 rounded text-[10px] sm:text-[11px] font-semibold transition-colors flex-shrink-0",
                    filterSignal === sig
                      ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                      : "text-voltron-400 hover:text-white"
                  )}
                >
                  {sig}
                </button>
              ))}
            </div>

            <button
              onClick={loadMarketScanner}
              className="p-1.5 rounded-lg bg-voltron-900 border border-voltron-750 text-voltron-400 hover:text-voltron-cyan transition-colors flex-shrink-0"
              title="Refresh Market Scanner"
              aria-label="Refresh Market Scanner"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin text-voltron-cyan")} />
            </button>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="p-3 rounded-lg bg-voltron-rose/15 border border-voltron-rose/30 text-voltron-rose text-xs font-mono flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* 1. Mobile Card Layout (< md) */}
        <div className="md:hidden space-y-2.5">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-voltron-400 font-mono text-xs terminal-card">
              {loading ? "LOADING MARKET SCANNER..." : `No assets matching "${searchTerm}"`}
            </div>
          ) : (
            filtered.map((row) => {
              const isPos = row.change >= 0;
              const isSelected = row.symbol === selectedSymbol;

              return (
                <div
                  key={row.symbol}
                  onClick={() => handleSelectRow(row.symbol)}
                  className={clsx(
                    "p-3.5 rounded-xl border font-mono text-xs transition-all cursor-pointer",
                    isSelected
                      ? "bg-voltron-900/90 border-voltron-cyan/60 shadow-sm"
                      : "bg-voltron-850/60 border-voltron-750/80 hover:border-voltron-700"
                  )}
                >
                  {/* Top Bar: Symbol, Name, Price, Change */}
                  <div className="flex items-start justify-between border-b border-voltron-800/80 pb-2 mb-2.5">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">
                          {row.symbol}
                        </span>
                        {isSelected && (
                          <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-voltron-cyan/20 border border-voltron-cyan/40 text-voltron-cyan font-bold">
                            ACTIVE
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-voltron-400 block mt-0.5">
                        {row.name}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-bold text-white font-tabular">
                        ${row.price.toFixed(2)}
                      </div>
                      <span
                        className={clsx(
                          "text-[11px] font-bold inline-block font-tabular",
                          isPos ? "text-voltron-emerald" : "text-voltron-rose"
                        )}
                      >
                        {isPos ? "+" : ""}{row.change_percent.toFixed(2)}%
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2 text-[11px] mb-3 bg-voltron-950/60 p-2 rounded-lg border border-voltron-800">
                    <div>
                      <span className="text-[9px] text-voltron-400 uppercase block">ATM IV</span>
                      <span className="text-voltron-cyan font-bold font-tabular">{row.implied_volatility.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-voltron-400 uppercase block">20D RV</span>
                      <span className="text-voltron-300 font-bold font-tabular">{row.realized_volatility.toFixed(1)}%</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-voltron-400 uppercase block">IV/RV Ratio</span>
                      <span className="text-voltron-emerald font-bold font-tabular">{row.iv_rv_ratio.toFixed(2)}x</span>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className={clsx(
                          "px-2 py-0.5 rounded text-[9.5px] font-bold uppercase",
                          row.vol_signal === "EXPENSIVE"
                            ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                            : row.vol_signal === "CHEAP"
                            ? "bg-voltron-violet/15 text-voltron-violet border border-voltron-violet/30"
                            : "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
                        )}
                      >
                        {row.vol_signal}
                      </span>
                      <span className="text-[9.5px] text-voltron-400">
                        Alpha <strong className="text-white">{row.opportunity_score}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <Link
                        href={`/options?symbol=${row.symbol}`}
                        onClick={() => setSelectedSymbol(row.symbol, false)}
                        className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] text-voltron-cyan font-bold border border-voltron-700 transition-colors min-h-[32px] flex items-center"
                      >
                        Chain
                      </Link>
                      <Link
                        href={`/agent?symbol=${row.symbol}`}
                        onClick={() => setSelectedSymbol(row.symbol, false)}
                        className="px-2.5 py-1 rounded bg-voltron-cyan/15 hover:bg-voltron-cyan/25 text-[11px] text-voltron-cyan font-bold border border-voltron-cyan/30 transition-colors min-h-[32px] flex items-center"
                      >
                        Analyze
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 2. Desktop Institutional Scanner Table (>= md) */}
        <div className="hidden md:block terminal-card overflow-hidden border border-voltron-750/80 bg-voltron-850/40">
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-voltron-400 font-mono text-xs">
                      {loading ? "LOADING MARKET VOLATILITY SCANNER..." : `No assets matching "${searchTerm}" with filter "${filterSignal}"`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const isPos = row.change >= 0;
                    const isSelected = row.symbol === selectedSymbol;

                    return (
                      <tr
                        key={row.symbol}
                        onClick={() => handleSelectRow(row.symbol)}
                        className={clsx(
                          "transition-colors cursor-pointer group",
                          isSelected
                            ? "bg-voltron-cyan/10 border-l-2 border-voltron-cyan"
                            : "hover:bg-voltron-800/40 border-l-2 border-transparent"
                        )}
                      >
                        <td className="p-3 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className={clsx(
                                  "font-bold transition-colors",
                                  isSelected ? "text-voltron-cyan" : "group-hover:text-voltron-cyan"
                                )}>
                                  {row.symbol}
                                </span>
                                {isSelected && (
                                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-voltron-cyan/20 border border-voltron-cyan/40 text-voltron-cyan font-bold tracking-wider">
                                    SELECTED
                                  </span>
                                )}
                              </div>
                              <span className="block text-[10px] text-voltron-400 font-normal">
                                {row.name}
                              </span>
                            </div>
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
                            {row.change_percent.toFixed(2)}%
                          </span>
                        </td>

                        <td className="p-3 font-tabular text-voltron-300">
                          {row.realized_volatility.toFixed(2)}%
                        </td>

                        <td className="p-3 font-tabular text-voltron-cyan font-bold">
                          {row.implied_volatility.toFixed(2)}%
                        </td>

                        <td className="p-3 font-tabular">
                          <span className="font-bold text-voltron-emerald">
                            {row.iv_rv_ratio.toFixed(2)}x
                          </span>
                          <span className="text-[10px] text-voltron-400 ml-1">
                            ({row.iv_premium >= 0 ? "+" : ""}{row.iv_premium.toFixed(1)}%)
                          </span>
                        </td>

                        <td className="p-3">
                          <span
                            className={clsx(
                              "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                              row.vol_signal === "EXPENSIVE"
                                ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                                : row.vol_signal === "CHEAP"
                                ? "bg-voltron-violet/15 text-voltron-violet border border-voltron-violet/30"
                                : "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
                            )}
                          >
                            {row.vol_signal}
                          </span>
                        </td>

                        <td className="p-3 font-tabular font-bold text-white">
                          <span className="text-voltron-cyan">
                            {row.opportunity_score}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-voltron-900 border border-voltron-750 text-[10px] text-voltron-200">
                            {row.strategy.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="p-3 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleSelectRow(row.symbol)}
                              className={clsx(
                                "px-2 py-1 rounded text-[11px] font-bold border transition-colors",
                                isSelected
                                  ? "bg-voltron-cyan/25 text-voltron-cyan border-voltron-cyan/40"
                                  : "bg-voltron-800 hover:bg-voltron-750 text-voltron-300 hover:text-white border-voltron-700"
                              )}
                            >
                              {isSelected ? "Selected" : "Select"}
                            </button>
                            <Link
                              href={`/options?symbol=${row.symbol}`}
                              onClick={() => setSelectedSymbol(row.symbol, false)}
                              className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] text-voltron-cyan font-bold border border-voltron-700 transition-colors"
                            >
                              <span>Chain</span>
                            </Link>
                            <Link
                              href={`/agent?symbol=${row.symbol}`}
                              onClick={() => setSelectedSymbol(row.symbol, false)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-voltron-cyan/15 hover:bg-voltron-cyan/25 text-[11px] text-voltron-cyan font-bold border border-voltron-cyan/30 transition-colors"
                            >
                              <span>Agent</span>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
