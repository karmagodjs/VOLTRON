"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  TrendingUp,
  Search,
  Sparkles,
  ExternalLink,
  Bot,
  RefreshCw,
  AlertTriangle,
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

export default function MarketsPage() {
  const router = useRouter();
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
            {/* Search Input */}
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

            {/* Volatility Regime Filters */}
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

            <button
              onClick={loadMarketScanner}
              className="p-1.5 rounded-lg bg-voltron-900 border border-voltron-750 text-voltron-400 hover:text-voltron-cyan transition-colors"
              title="Refresh Market Scanner"
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="p-8 text-center text-voltron-400 font-mono text-xs">
                      {loading ? "LOADING MARKET VOLATILITY SCANNER..." : `No assets matching "${searchTerm}" with filter "${filterSignal}"`}
                    </td>
                  </tr>
                ) : (
                  filtered.map((row) => {
                    const isPos = row.change >= 0;
                    return (
                      <tr
                        key={row.symbol}
                        onClick={() => router.push(`/agent?symbol=${row.symbol}`)}
                        className="hover:bg-voltron-800/40 transition-colors cursor-pointer group"
                      >
                        <td className="p-3 font-bold text-white">
                          <div>
                            <span className="group-hover:text-voltron-cyan transition-colors">{row.symbol}</span>
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
                          <span className="flex items-center gap-1 text-voltron-cyan">
                            <Sparkles className="w-3 h-3" />
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
                            <Link
                              href={`/options?symbol=${row.symbol}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] text-voltron-cyan font-bold border border-voltron-700 transition-colors"
                            >
                              <span>Chain</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                            <Link
                              href={`/agent?symbol=${row.symbol}`}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-voltron-cyan/15 hover:bg-voltron-cyan/25 text-[11px] text-voltron-cyan font-bold border border-voltron-cyan/30 transition-colors"
                            >
                              <Bot className="w-3 h-3" />
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
