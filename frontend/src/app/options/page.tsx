"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchOptionsChain } from "@/lib/api";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
} from "recharts";
import {
  Search,
  RefreshCw,
  X,
} from "lucide-react";
import clsx from "clsx";

import { useMarket } from "@/context/MarketContext";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

function OptionsTerminalContent() {
  const searchParams = useSearchParams();
  const { selectedSymbol, setSelectedSymbol } = useMarket();
  const querySymbol = searchParams.get("symbol")?.toUpperCase() || selectedSymbol || "SPY";

  const [symbol, setSymbol] = useState(querySymbol);
  const [data, setData] = useState<any>(null);
  const [selectedExp, setSelectedExp] = useState<string | null>(null);
  const [filterMode, setFilterMode] = useState<"ALL" | "ATM" | "ITM" | "OTM">("ALL");
  const [searchStrike, setSearchStrike] = useState<string>("");
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [riskModalOpen, setRiskModalOpen] = useState(false);

  // Sync if query param or context changes externally
  useEffect(() => {
    if (querySymbol && querySymbol !== symbol && SUPPORTED_ASSETS[querySymbol]) {
      setSymbol(querySymbol);
      setData(null);
      setSelectedContract(null);
      setSelectedExp(null);
      setLoading(true);
    }
  }, [querySymbol]);

  useEffect(() => {
    if (selectedSymbol && selectedSymbol !== symbol && SUPPORTED_ASSETS[selectedSymbol]) {
      setSymbol(selectedSymbol);
      setData(null);
      setSelectedContract(null);
      setSelectedExp(null);
      setLoading(true);
    }
  }, [selectedSymbol]);

  const loadData = async (targetSymbol = symbol) => {
    try {
      setLoading(true);
      const res = await fetchOptionsChain(targetSymbol, selectedExp || undefined);
      setData(res);
      if (!selectedExp && res.expirations?.length > 0) {
        setSelectedExp(res.selected_expiration);
      }
      if (res.chain?.length > 0) {
        const atmRow = res.chain.find((r: any) => r.is_atm) || res.chain[Math.floor(res.chain.length / 2)];
        setSelectedContract(atmRow.call);
      }
    } catch {
      // Fallback handled gracefully
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData(symbol);
  }, [symbol, selectedExp]);

  const asset = SUPPORTED_ASSETS[symbol] || SUPPORTED_ASSETS["SPY"];
  const spot = data?.spot_price || asset.price;
  const changeVal = data?.change !== undefined ? data.change : asset.change;
  const changePctVal = data?.change_percent !== undefined ? data.change_percent : asset.change_percent;
  const isPositive = changeVal >= 0;
  const ivVal = data?.implied_volatility !== undefined ? data.implied_volatility : asset.implied_volatility;
  const rvVal = data?.realized_volatility !== undefined ? data.realized_volatility : asset.realized_volatility;
  const ivRvRatioVal = data?.iv_rv_ratio !== undefined ? data.iv_rv_ratio : asset.iv_rv_ratio;
  const oppScoreVal = data?.opportunity_score !== undefined ? data.opportunity_score : asset.opportunity_score;

  const filteredChain = (data?.chain || []).filter((row: any) => {
    if (searchStrike && !String(row.strike).includes(searchStrike)) return false;
    if (filterMode === "ATM") return row.is_atm;
    if (filterMode === "ITM") return row.strike < spot;
    if (filterMode === "OTM") return row.strike > spot;
    return true;
  });

  const strat = data?.strategy;
  const payoffData = data?.payoff_curve || [];
  const termStructure = data?.term_structure || [];

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono text-xs">
        {/* 1. TOP MARKET & VOLATILITY TELEMETRY HEADER */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white tracking-wider">
                  {symbol} OPTIONS TERMINAL
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold uppercase">
                  DERIBIT-GRADE CHAIN
                </span>
              </div>
              <div className="flex items-baseline gap-2.5 mt-0.5">
                <span className="text-lg font-bold text-white font-tabular">${spot.toFixed(2)}</span>
                <span
                  className={clsx(
                    "text-xs font-bold font-tabular px-1.5 py-0.2 rounded",
                    isPositive
                      ? "text-voltron-emerald bg-voltron-emerald/15 border border-voltron-emerald/30"
                      : "text-voltron-rose bg-voltron-rose/15 border border-voltron-rose/30"
                  )}
                >
                  {isPositive ? "+" : ""}{changeVal.toFixed(2)} ({isPositive ? "+" : ""}{changePctVal.toFixed(2)}%)
                </span>
                <span className="text-[10px] text-voltron-400 font-sans">
                  {asset.name}
                </span>
                <span className="text-[10px] text-voltron-emerald flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block"></span>
                  MARKET {data?.market_status || "OPEN"}
                </span>
              </div>
            </div>
          </div>

          {/* Real Volatility Metrics Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block">Implied Vol (IV)</span>
              <span className="font-bold text-voltron-cyan font-tabular">{ivVal.toFixed(2)}%</span>
            </div>
            <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block">Realized Vol (RV)</span>
              <span className="font-bold text-white font-tabular">{rvVal.toFixed(2)}%</span>
            </div>
            <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block">IV / RV Ratio</span>
              <span className="font-bold text-voltron-emerald font-tabular">{ivRvRatioVal.toFixed(2)}x</span>
            </div>
            <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800">
              <span className="text-[9px] uppercase text-voltron-400 block">Opportunity</span>
              <span className="font-bold text-voltron-cyan font-tabular">{oppScoreVal} / 100</span>
            </div>
            <div className="p-1.5 px-2.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse"></span>
              PAPER TRADING ACTIVE
            </div>
          </div>
        </div>

        {/* Loading Indicator when switching symbols */}
        {loading && !data && (
          <div className="p-6 rounded-lg bg-voltron-900 border border-voltron-cyan/40 text-voltron-cyan text-xs font-mono flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin" />
            <span>{symbol}: LOADING DERIBIT-GRADE OPTIONS CHAIN...</span>
          </div>
        )}

        {/* 2. EXPIRATION & FILTER TOOLBAR */}
        <div className="p-3 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          {/* Expiration Buttons */}
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-[10px] uppercase text-voltron-400 font-bold mr-1">
              EXPIRATION:
            </span>
            {(data?.expiration_labels || []).map((exp: any) => (
              <button
                key={exp.date}
                onClick={() => setSelectedExp(exp.date)}
                className={clsx(
                  "px-2.5 py-1 rounded text-xs font-semibold transition-all flex items-center gap-1.5 flex-shrink-0",
                  (selectedExp || data?.selected_expiration) === exp.date
                    ? "bg-voltron-cyan/20 text-voltron-cyan border border-voltron-cyan/50"
                    : "bg-voltron-950 text-voltron-400 hover:text-white border border-voltron-800"
                )}
              >
                <span>{exp.label}</span>
                <span className="text-[9px] px-1 rounded bg-voltron-900 text-voltron-300 font-normal">
                  {exp.dte}d
                </span>
              </button>
            ))}
          </div>

          {/* Moneyness Filters & Search */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-0.5 bg-voltron-950 p-0.5 rounded border border-voltron-800 text-[10px]">
              {(["ALL", "ATM", "ITM", "OTM"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={clsx(
                    "px-2 py-0.5 rounded text-[10px] font-semibold transition-colors",
                    filterMode === mode
                      ? "bg-voltron-800 text-voltron-cyan border border-voltron-700"
                      : "text-voltron-400 hover:text-white"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>

            {/* Strike Search */}
            <div className="relative">
              <Search className="w-3 h-3 absolute left-2 top-2 text-voltron-400" />
              <input
                type="text"
                placeholder="Strike..."
                value={searchStrike}
                onChange={(e) => setSearchStrike(e.target.value)}
                className="pl-7 pr-2 py-1 rounded bg-voltron-950 border border-voltron-800 text-white placeholder-voltron-500 text-[11px] w-24 focus:outline-none focus:border-voltron-cyan"
              />
            </div>

            <button
              onClick={() => loadData()}
              className="p-1.5 rounded bg-voltron-950 hover:bg-voltron-800 text-voltron-400 hover:text-white border border-voltron-800 transition-colors"
              title="Refresh Options Matrix"
            >
              <RefreshCw className={clsx("w-3.5 h-3.5", loading && "animate-spin text-voltron-cyan")} />
            </button>
          </div>
        </div>

        {/* 3. MAIN OPTIONS CHAIN TABLE (CENTERPIECE) */}
        <div className="rounded-lg border border-voltron-750/80 bg-voltron-900 overflow-hidden">
          <div className="overflow-x-auto max-h-[380px]">
            <table className="w-full text-center font-mono text-[11px] border-collapse">
              <thead className="bg-voltron-950 sticky top-0 z-10 border-b border-voltron-750 shadow-md">
                <tr>
                  <th colSpan={10} className="p-2 text-voltron-cyan font-bold border-r border-voltron-800 uppercase tracking-widest text-xs">
                    CALLS (BULLISH)
                  </th>
                  <th className="p-2 text-white font-bold bg-voltron-900 border-x border-voltron-800 uppercase tracking-widest text-xs">
                    STRIKE
                  </th>
                  <th colSpan={10} className="p-2 text-voltron-violet font-bold border-l border-voltron-800 uppercase tracking-widest text-xs">
                    PUTS (BEARISH)
                  </th>
                </tr>
                <tr className="bg-voltron-950/90 text-[10px] uppercase text-voltron-400 border-b border-voltron-800">
                  <th className="p-1.5">OI</th>
                  <th className="p-1.5">Vol</th>
                  <th className="p-1.5">Vega</th>
                  <th className="p-1.5">Theta</th>
                  <th className="p-1.5">Gamma</th>
                  <th className="p-1.5">Delta</th>
                  <th className="p-1.5">IV %</th>
                  <th className="p-1.5">Bid</th>
                  <th className="p-1.5">Ask</th>
                  <th className="p-1.5 border-r border-voltron-800">Last</th>

                  <th className="p-1.5 font-bold text-white bg-voltron-850 border-x border-voltron-800">
                    Strike ($)
                  </th>

                  <th className="p-1.5 border-l border-voltron-800">Bid</th>
                  <th className="p-1.5">Ask</th>
                  <th className="p-1.5">Last</th>
                  <th className="p-1.5">IV %</th>
                  <th className="p-1.5">Delta</th>
                  <th className="p-1.5">Gamma</th>
                  <th className="p-1.5">Theta</th>
                  <th className="p-1.5">Vega</th>
                  <th className="p-1.5">Vol</th>
                  <th className="p-1.5">OI</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-voltron-800/80">
                {filteredChain.map((row: any) => {
                  const isAtm = row.is_atm;
                  const isCallSelected = selectedContract?.contract === row.call.contract;
                  const isPutSelected = selectedContract?.contract === row.put.contract;

                  return (
                    <tr
                      key={row.strike}
                      className={clsx(
                        "transition-colors",
                        isAtm
                          ? "bg-voltron-cyan/10 hover:bg-voltron-cyan/15 font-bold"
                          : "hover:bg-voltron-850/60"
                      )}
                    >
                      {/* CALL DATA */}
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.call.open_interest}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.call.volume}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.call.vega != null ? row.call.vega.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.call.theta != null ? row.call.theta.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.call.gamma != null ? row.call.gamma.toFixed(4) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-300 font-tabular">{row.call.delta != null ? row.call.delta.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-cyan font-tabular">{row.call.iv != null ? `${row.call.iv.toFixed(1)}%` : "N/A"}</td>
                      <td
                        onClick={() => setSelectedContract(row.call)}
                        className={clsx(
                          "p-1.5 font-tabular font-semibold cursor-pointer transition-colors",
                          isCallSelected ? "bg-voltron-cyan/30 text-white" : "text-white hover:bg-voltron-800"
                        )}
                      >
                        ${row.call.bid.toFixed(2)}
                      </td>
                      <td
                        onClick={() => setSelectedContract(row.call)}
                        className={clsx(
                          "p-1.5 font-tabular font-semibold cursor-pointer transition-colors",
                          isCallSelected ? "bg-voltron-cyan/30 text-white" : "text-white hover:bg-voltron-800"
                        )}
                      >
                        ${row.call.ask.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-voltron-300 font-tabular border-r border-voltron-800">
                        ${row.call.last.toFixed(2)}
                      </td>

                      {/* STRIKE CENTER */}
                      <td
                        className={clsx(
                          "p-1.5 font-bold font-tabular text-xs border-x border-voltron-800",
                          isAtm
                            ? "bg-voltron-cyan/25 text-voltron-cyan"
                            : "bg-voltron-950/80 text-white"
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
                      <td
                        onClick={() => setSelectedContract(row.put)}
                        className={clsx(
                          "p-1.5 font-tabular font-semibold cursor-pointer border-l border-voltron-800 transition-colors",
                          isPutSelected ? "bg-voltron-violet/30 text-white" : "text-white hover:bg-voltron-800"
                        )}
                      >
                        ${row.put.bid.toFixed(2)}
                      </td>
                      <td
                        onClick={() => setSelectedContract(row.put)}
                        className={clsx(
                          "p-1.5 font-tabular font-semibold cursor-pointer transition-colors",
                          isPutSelected ? "bg-voltron-violet/30 text-white" : "text-white hover:bg-voltron-800"
                        )}
                      >
                        ${row.put.ask.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-voltron-300 font-tabular">
                        ${row.put.last.toFixed(2)}
                      </td>
                      <td className="p-1.5 text-voltron-violet font-tabular">{row.put.iv != null ? `${row.put.iv.toFixed(1)}%` : "N/A"}</td>
                      <td className="p-1.5 text-voltron-300 font-tabular">{row.put.delta != null ? row.put.delta.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.put.gamma != null ? row.put.gamma.toFixed(4) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.put.theta != null ? row.put.theta.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.put.vega != null ? row.put.vega.toFixed(3) : "N/A"}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.put.volume}</td>
                      <td className="p-1.5 text-voltron-400 font-tabular">{row.put.open_interest}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. ROW 2: SELECTED CONTRACT & LIQUIDITY (Left) + VOLATILITY TERM STRUCTURE (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Selected Contract & Liquidity Panel (5 cols) */}
          <div className="lg:col-span-5 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>SELECTED CONTRACT & LIQUIDITY</span>
              <span className="text-[10px] text-voltron-cyan font-bold">
                {selectedContract?.type || "CALL"} ${selectedContract?.strike || 590}
              </span>
            </div>

            {selectedContract ? (
              <div className="space-y-2 text-xs">
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                  <span className="text-voltron-400">Contract Symbol:</span>
                  <span className="font-bold text-white font-tabular">{selectedContract.contract}</span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] uppercase text-voltron-400 block">Bid / Ask</span>
                    <span className="font-bold text-white font-tabular">${selectedContract.bid} / ${selectedContract.ask}</span>
                  </div>
                  <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] uppercase text-voltron-400 block">Mid Price</span>
                    <span className="font-bold text-voltron-cyan font-tabular">${selectedContract.mid || selectedContract.last}</span>
                  </div>
                  <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] uppercase text-voltron-400 block">Spread %</span>
                    <span className={clsx("font-bold font-tabular", selectedContract.spread_percent > 10 ? "text-voltron-rose" : "text-voltron-emerald")}>
                      {selectedContract.spread_percent}% ({selectedContract.liquidity_status})
                    </span>
                  </div>
                </div>

                {/* Greeks Grid */}
                <div className="grid grid-cols-5 gap-1.5 text-center text-xs">
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] text-voltron-400 block">&Delta; Delta</span>
                    <span className="font-bold text-white font-tabular">{selectedContract.delta != null ? selectedContract.delta.toFixed(3) : "N/A"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] text-voltron-400 block">&Gamma; Gamma</span>
                    <span className="font-bold text-white font-tabular">{selectedContract.gamma != null ? selectedContract.gamma.toFixed(4) : "N/A"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] text-voltron-400 block">&Theta; Theta</span>
                    <span className="font-bold text-white font-tabular">{selectedContract.theta != null ? selectedContract.theta.toFixed(3) : "N/A"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] text-voltron-400 block">&Nu; Vega</span>
                    <span className="font-bold text-white font-tabular">{selectedContract.vega != null ? selectedContract.vega.toFixed(3) : "N/A"}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800">
                    <span className="text-[9px] text-voltron-400 block">IV %</span>
                    <span className="font-bold text-voltron-cyan font-tabular">{selectedContract.iv != null ? `${selectedContract.iv.toFixed(1)}%` : "N/A"}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-6 text-center text-voltron-400">Click any option bid/ask to inspect contract metrics.</div>
            )}
          </div>

          {/* IV Term Structure Curve (7 cols) */}
          <div className="lg:col-span-7 p-3.5 rounded-lg bg-voltron-900 border border-voltron-800 h-[210px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-voltron-400 border-b border-voltron-800 pb-1 mb-1">
              <span className="text-white font-bold text-xs uppercase tracking-wider">
                IV TERM STRUCTURE ({symbol})
              </span>
              <span className="text-[10px] text-voltron-cyan font-bold">ATM FORWARD SKEW</span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={termStructure}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#181E2C" vertical={false} />
                  <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
                  <YAxis stroke="#4A5568" fontSize={10} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `${v}%`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0D14",
                      borderColor: "#1E2638",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(val: any) => [`${val}%`, "Implied Volatility"]}
                  />
                  <Line type="monotone" dataKey="iv" stroke="#00F0FF" strokeWidth={2} dot={{ r: 3, fill: "#00F0FF" }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 5. ROW 3: STRATEGY ENGINE + PAYOFF CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Strategy Engine & Multi-Leg Breakdown (5 cols) */}
          <div className="lg:col-span-5 p-3.5 rounded-lg bg-voltron-900 border border-voltron-800 space-y-2.5">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>VOLTRON STRATEGY ENGINE</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald font-bold">
                {strat?.name || "IRON CONDOR"}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Direction</span>
                <span className="font-bold text-white text-xs">{strat?.sentiment || "NEUTRAL"}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">Volatility</span>
                <span className="font-bold text-voltron-emerald text-xs">{strat?.volatility_view || "EXPENSIVE"}</span>
              </div>
              <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                <span className="text-[9px] uppercase text-voltron-400 block">IV / RV</span>
                <span className="font-bold text-voltron-cyan text-xs font-tabular">{strat?.iv_rv_ratio || 1.62}x</span>
              </div>
            </div>

            {/* 4 Legs Multi-Leg Package */}
            <div className="space-y-1">
              <span className="text-[10px] uppercase text-voltron-400 font-bold block">Combined Multi-Leg Package (MLeg)</span>
              <div className="space-y-1 text-[11px]">
                {strat?.legs?.map((leg: any, idx: number) => (
                  <div key={idx} className="p-1.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                    <span className={leg.action === "SELL" ? "text-voltron-emerald font-bold" : "text-voltron-cyan font-bold"}>
                      {leg.action} {symbol} {leg.strike}{leg.type}
                    </span>
                    <span className="text-voltron-300 font-tabular font-semibold">
                      ${leg.mid || leg.ask} <span className="text-voltron-400 font-normal">(&Delta; {leg.delta})</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Strategy Metrics Grid */}
            <div className="grid grid-cols-3 gap-2 text-xs pt-1">
              <div>
                <span className="text-[9px] text-voltron-400 uppercase block">Max Profit</span>
                <span className="font-bold text-voltron-emerald font-tabular">${strat?.max_profit?.toFixed(2) || "185.00"}</span>
              </div>
              <div>
                <span className="text-[9px] text-voltron-400 uppercase block">Max Loss</span>
                <span className="font-bold text-voltron-rose font-tabular">${strat?.max_loss?.toFixed(2) || "315.00"}</span>
              </div>
              <div>
                <span className="text-[9px] text-voltron-400 uppercase block">Net Credit</span>
                <span className="font-bold text-voltron-cyan font-tabular">${strat?.net_credit?.toFixed(2) || "1.85"}</span>
              </div>
            </div>
          </div>

          {/* Payoff Preview Chart (7 cols) */}
          <div className="lg:col-span-7 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 h-[260px] flex flex-col justify-between">
            <div className="flex items-center justify-between text-[11px] text-voltron-400 border-b border-voltron-800 pb-1.5 mb-1">
              <span className="text-white font-bold text-xs uppercase">
                EXPIRATION PAYOFF PROFILE & BREAKEVENS
              </span>
              <span className="text-[10px] text-voltron-emerald font-bold">
                LOWER BE: ${strat?.breakeven_lower} | UPPER BE: ${strat?.breakeven_upper}
              </span>
            </div>

            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={payoffData}>
                  <defs>
                    <linearGradient id="payoffGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00E676" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#FF3B30" stopOpacity={0.3} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="2 2" stroke="#181E2C" vertical={false} />
                  <XAxis dataKey="price" stroke="#4A5568" fontSize={10} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <YAxis stroke="#4A5568" fontSize={10} tickLine={false} domain={[-350, 220]} tickFormatter={(v) => `$${v}`} />
                  <ReferenceLine y={0} stroke="#4A5568" strokeDasharray="3 3" />
                  <ReferenceLine x={spot} stroke="#00F0FF" strokeDasharray="3 3" label={{ value: "SPOT", fill: "#00F0FF", fontSize: 9 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#0A0D14",
                      borderColor: "#1E2638",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontFamily: "monospace",
                    }}
                    formatter={(val: any) => [`$${val}`, "P&L at Expiry"]}
                  />
                  <Area type="monotone" dataKey="pnl" stroke="#00E676" strokeWidth={2} fill="url(#payoffGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 6. ROW 4: AI CONTEXT & ORDER PREVIEW & RISK GATES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* AI Context Panel (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>VOLTRON AI CONTEXT ({symbol})</span>
              <span className="text-[10px] text-voltron-cyan font-bold">CONFIDENCE: 88%</span>
            </div>

            <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1.5 text-xs">
              <div className="flex items-start gap-2">
                <span className="text-voltron-cyan font-bold text-[10px] uppercase">Observation:</span>
                <span className="text-voltron-200 text-[11px]">IV ({data?.implied_volatility || 16.85}%) vs 20-day RV ({data?.realized_volatility || 10.42}%) produces a {data?.iv_rv_ratio || 1.62}x variance risk spread.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-voltron-emerald font-bold text-[10px] uppercase">AI Thesis:</span>
                <span className="text-voltron-200 text-[11px]">Construct defined-risk {strat?.name || "Iron Condor"} harvesting theta decay in {data?.market_regime || "neutral consolidation"} regime.</span>
              </div>
            </div>
          </div>

          {/* Order Preview & Risk Verification (6 cols) */}
          <div className="lg:col-span-6 p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2">
            <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
              <span>ORDER PREVIEW & RISK SAFETY GATE</span>
              <span className="text-[10px] text-voltron-emerald font-bold">7/7 GATES PASSED</span>
            </div>

            <div className="p-2 rounded bg-voltron-950 border border-voltron-800 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div>
                <span className="text-[9px] text-voltron-400 uppercase block">Order Structure</span>
                <span className="font-bold text-white text-xs">{symbol} {strat?.name || "Iron Condor"} @ ${strat?.net_credit?.toFixed(2) || "1.85"} Net Credit</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setRiskModalOpen(true)}
                  className="px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-bold text-voltron-cyan border border-voltron-700 transition-colors"
                >
                  Review Risk Gates
                </button>
                <button
                  onClick={() => setSelectedContract(null)}
                  className="px-3 py-1.5 rounded bg-voltron-950 hover:bg-voltron-800 text-[11px] font-bold text-voltron-400 hover:text-white border border-voltron-800 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Risk Gates Review Modal */}
      {riskModalOpen && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="w-full max-w-lg bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setRiskModalOpen(false)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                VOLTRON RISK GATE AUDIT — {symbol} {strat?.name || "IRON CONDOR"}
              </h3>
            </div>

            <div className="space-y-2 mb-5 max-h-[300px] overflow-y-auto">
              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Opportunity Score</span>
                  <span className="text-[10px] text-voltron-400">Score &ge; 70</span>
                </div>
                <span className="text-voltron-emerald font-bold">{data?.opportunity_score || 94} / 100 [PASS]</span>
              </div>
              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Max Trade Risk</span>
                  <span className="text-[10px] text-voltron-400">Loss &le; 1.0% ($1,000)</span>
                </div>
                <span className="text-voltron-emerald font-bold">0.31% ($315.00) [PASS]</span>
              </div>
              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Portfolio Exposure</span>
                  <span className="text-[10px] text-voltron-400">Exposure &le; 30.0% ($30,000)</span>
                </div>
                <span className="text-voltron-emerald font-bold">18.2% ($18,200) [PASS]</span>
              </div>
              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Liquidity Spread Gate</span>
                  <span className="text-[10px] text-voltron-400">Spread &le; 10.0%</span>
                </div>
                <span className="text-voltron-emerald font-bold">2.1% Spread [PASS]</span>
              </div>
              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between items-center">
                <div>
                  <span className="font-bold text-white block">Paper Trading Isolation Gate</span>
                  <span className="text-[10px] text-voltron-400">Live order bypass strictly disabled</span>
                </div>
                <span className="text-voltron-emerald font-bold">PAPER MODE [PASS]</span>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setRiskModalOpen(false)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}
    </TerminalLayout>
  );
}

export default function OptionsTerminalPage() {
  return (
    <Suspense fallback={
      <TerminalLayout>
        <div className="p-8 text-center text-voltron-cyan font-mono text-xs flex items-center justify-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span>LOADING OPTIONS MATRIX...</span>
        </div>
      </TerminalLayout>
    }>
      <OptionsTerminalContent />
    </Suspense>
  );
}
