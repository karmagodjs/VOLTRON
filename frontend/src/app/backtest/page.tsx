"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { runBacktest } from "@/lib/api";
import { BacktestResult } from "@/types";
import {
  FlaskConical,
  Play,
  TrendingUp,
  Award,
  AlertTriangle,
  History,
  CheckCircle2,
  XCircle,
  BarChart2,
  Settings2,
} from "lucide-react";
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
} from "recharts";
import clsx from "clsx";

export default function BacktestPage() {
  const [strategy, setStrategy] = useState("IRON_CONDOR");
  const [symbol, setSymbol] = useState("SPY");
  const [startDate, setStartDate] = useState("2025-01-01");
  const [endDate, setEndDate] = useState("2026-08-31");
  const [ivRvThreshold, setIvRvThreshold] = useState(1.4);
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [riskPct, setRiskPct] = useState(1.0);
  const [maxExposure, setMaxExposure] = useState(30.0);

  const [activeTab, setActiveTab] = useState<"overview" | "trades" | "drawdown" | "params">("overview");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState(false);

  const executeBacktest = async () => {
    setLoading(true);
    try {
      const res = await runBacktest({
        strategy,
        symbol,
        start_date: startDate,
        end_date: endDate,
        iv_rv_threshold: ivRvThreshold,
        confidence_threshold: confidenceThreshold,
        risk_per_trade_pct: riskPct,
        max_exposure_pct: maxExposure,
      });
      setResult(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    executeBacktest();
  }, []);

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>QUANTCONNECT-INSPIRED BACKTESTING LAB</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30 font-mono">
                  HISTORICAL SIMULATION
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Vectorized & Event-Driven Options Volatility Backtesting Engine
              </div>
            </div>
          </div>

          <button
            onClick={executeBacktest}
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-mono font-bold text-xs shadow-cyan-glow flex items-center gap-2 transition-all disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-voltron-950" />
            <span>{loading ? "SIMULATING..." : "RUN BACKTEST"}</span>
          </button>
        </div>

        {/* 2-Column Grid: Left Controls (4 cols) / Right Results & Charts (8 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Parameter Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 space-y-4 font-mono text-xs">
              <div className="flex items-center gap-2 border-b border-voltron-750/60 pb-2 font-bold text-white uppercase text-xs">
                <Settings2 className="w-4 h-4 text-voltron-cyan" />
                <span>Simulation Parameters</span>
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">Strategy</label>
                <select
                  value={strategy}
                  onChange={(e) => setStrategy(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-voltron-cyan"
                >
                  <option value="IRON_CONDOR">Iron Condor</option>
                  <option value="BULL_PUT_SPREAD">Bull Put Spread</option>
                  <option value="BEAR_CALL_SPREAD">Bear Call Spread</option>
                  <option value="LONG_STRADDLE">Long Straddle</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">Symbol</label>
                <select
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-voltron-cyan"
                >
                  <option value="SPY">SPY (S&P 500)</option>
                  <option value="QQQ">QQQ (Nasdaq 100)</option>
                  <option value="IWM">IWM (Russell 2000)</option>
                  <option value="NVDA">NVDA (Nvidia)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-voltron-400 uppercase block mb-1">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-voltron-cyan"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-voltron-400 uppercase block mb-1">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none focus:border-voltron-cyan"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-voltron-400 uppercase mb-1">
                  <span>IV / RV Threshold</span>
                  <span className="text-voltron-cyan font-bold">{ivRvThreshold}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.0"
                  step="0.05"
                  value={ivRvThreshold}
                  onChange={(e) => setIvRvThreshold(parseFloat(e.target.value))}
                  className="w-full accent-voltron-cyan"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-voltron-400 uppercase mb-1">
                  <span>AI Confidence Threshold</span>
                  <span className="text-voltron-cyan font-bold">{confidenceThreshold}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="90"
                  step="5"
                  value={confidenceThreshold}
                  onChange={(e) => setConfidenceThreshold(parseInt(e.target.value))}
                  className="w-full accent-voltron-cyan"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[10px] text-voltron-400 uppercase block mb-1">Trade Risk %</label>
                  <input
                    type="number"
                    value={riskPct}
                    onChange={(e) => setRiskPct(parseFloat(e.target.value))}
                    step="0.1"
                    className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-voltron-400 uppercase block mb-1">Max Exposure %</label>
                  <input
                    type="number"
                    value={maxExposure}
                    onChange={(e) => setMaxExposure(parseFloat(e.target.value))}
                    className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2 text-xs font-mono text-white outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Results & Equity Curve (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {result && (
              <>
                {/* 10 Institutional Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Total Return</span>
                    <span className="text-sm font-bold text-voltron-emerald font-tabular">
                      +{result.summary.total_return_pct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">CAGR</span>
                    <span className="text-sm font-bold text-voltron-cyan font-tabular">
                      {result.summary.cagr.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Sharpe Ratio</span>
                    <span className="text-sm font-bold text-voltron-emerald font-tabular">
                      {result.summary.sharpe_ratio.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Sortino Ratio</span>
                    <span className="text-sm font-bold text-voltron-cyan font-tabular">
                      {result.summary.sortino_ratio.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Max Drawdown</span>
                    <span className="text-sm font-bold text-voltron-rose font-tabular">
                      {result.summary.max_drawdown_pct.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Win Rate</span>
                    <span className="text-sm font-bold text-voltron-emerald font-tabular">
                      {result.summary.win_rate_pct.toFixed(1)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Profit Factor</span>
                    <span className="text-sm font-bold text-voltron-cyan font-tabular">
                      {result.summary.profit_factor.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Total Trades</span>
                    <span className="text-sm font-bold text-white font-tabular">
                      {result.summary.total_trades}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Avg Trade P&L</span>
                    <span className="text-sm font-bold text-voltron-emerald font-tabular">
                      +${result.summary.avg_trade_pnl.toFixed(2)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-voltron-850 border border-voltron-750">
                    <span className="text-[9px] text-voltron-400 uppercase block">Largest Loss</span>
                    <span className="text-sm font-bold text-voltron-rose font-tabular">
                      ${result.summary.largest_loss.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Main Results Workspace with Tabs */}
                <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40">
                  <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-4">
                    <div className="flex gap-2">
                      {(["overview", "trades", "drawdown"] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={clsx(
                            "px-3 py-1 rounded text-xs font-mono font-semibold transition-colors uppercase",
                            activeTab === tab
                              ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                              : "text-voltron-400 hover:text-white"
                          )}
                        >
                          {tab}
                        </button>
                      ))}
                    </div>

                    <div className="text-[11px] font-mono text-voltron-400">
                      Capital Walk: ${result.summary.starting_capital.toLocaleString()} &rarr; ${result.summary.ending_capital.toLocaleString()}
                    </div>
                  </div>

                  {activeTab === "overview" && (
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.equity_curve}>
                          <defs>
                            <linearGradient id="eqGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                              <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
                          <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
                          <YAxis stroke="#4A5568" fontSize={10} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0E1118",
                              borderColor: "#1E2638",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                            formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Portfolio Equity"]}
                          />
                          <Area type="monotone" dataKey="equity" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#eqGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === "drawdown" && (
                    <div className="h-[320px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={result.equity_curve}>
                          <defs>
                            <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#FF3B30" stopOpacity={0.3} />
                              <stop offset="95%" stopColor="#FF3B30" stopOpacity={0.0} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
                          <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
                          <YAxis stroke="#4A5568" fontSize={10} tickLine={false} tickFormatter={(v) => `-${v}%`} />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#0E1118",
                              borderColor: "#1E2638",
                              borderRadius: "8px",
                              fontSize: "11px",
                              fontFamily: "monospace",
                            }}
                            formatter={(val: any) => [`-${Number(val).toFixed(2)}%`, "Drawdown"]}
                          />
                          <Area type="monotone" dataKey="drawdown" stroke="#FF3B30" strokeWidth={1.5} fillOpacity={1} fill="url(#ddGrad)" />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {activeTab === "trades" && (
                    <div className="max-h-[320px] overflow-y-auto">
                      <table className="w-full text-left font-mono text-xs">
                        <thead className="bg-voltron-900 text-[10px] text-voltron-400 uppercase sticky top-0">
                          <tr>
                            <th className="p-2">ID</th>
                            <th className="p-2">Date</th>
                            <th className="p-2">Strategy</th>
                            <th className="p-2">P&L ($)</th>
                            <th className="p-2">Return %</th>
                            <th className="p-2">Exit Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-voltron-800 text-[11px]">
                          {result.trades.map((t) => (
                            <tr key={t.id} className="hover:bg-voltron-800/30">
                              <td className="p-2 text-voltron-400">{t.id}</td>
                              <td className="p-2 text-white">{t.date}</td>
                              <td className="p-2 text-voltron-300">{t.strategy}</td>
                              <td className={clsx("p-2 font-bold font-tabular", t.pnl > 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                                {t.pnl > 0 ? "+" : ""}${t.pnl.toFixed(2)}
                              </td>
                              <td className="p-2 text-voltron-300">{t.return_pct > 0 ? "+" : ""}{t.return_pct.toFixed(1)}%</td>
                              <td className="p-2 text-voltron-400 text-[10px]">{t.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
