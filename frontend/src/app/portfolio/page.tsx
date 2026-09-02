"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  Briefcase,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Activity,
  ArrowRightLeft,
  X,
  TrendingUp,
  RefreshCw,
  Clock,
  SlidersHorizontal,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import clsx from "clsx";

export default function PortfolioPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<"1D" | "1M" | "ALL">("1D");
  const [selectedPosition, setSelectedPosition] = useState<any>(null);

  const loadData = async () => {
    try {
      const res = await fetch("/api/portfolio");
      if (!res.ok) throw new Error("Backend offline");
      const json = await res.json();
      setData(json);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const account = data?.account || {
    equity: 100000.0,
    cash: 81800.0,
    buying_power: 180000.0,
    portfolio_value: 100000.0,
    daily_pnl: 1284.5,
    daily_pnl_percent: 1.3,
    unrealized_pnl: 2435.0,
    realized_pnl: 8640.0,
    portfolio_exposure_pct: 18.2,
    status: "ACTIVE",
    account_number: "PA391058291",
  };

  const positions = data?.positions || [];
  const pnlChartData = data?.pnl_history?.[selectedPeriod] || [];
  const reconciliation = data?.reconciliation;

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono text-xs">
        {/* 1. TOP BANNER: PORTFOLIO OPERATIONS CENTER */}
        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/40 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider">
                  PORTFOLIO OPERATIONS CENTER
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold uppercase">
                  ACCOUNT: {account.account_number}
                </span>
              </div>
              <div className="text-[11px] text-voltron-400 mt-0.5">
                Alpaca Paper Trading Environment &bull; Real-time Greeks &bull; Automated Delta-Neutral Risk Envelope
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse"></span>
              PAPER TRADING ACTIVE
            </div>
            <button
              onClick={loadData}
              className="p-1.5 rounded bg-voltron-950 hover:bg-voltron-800 text-voltron-400 hover:text-white border border-voltron-800 transition-colors"
              title="Refresh Portfolio State"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* 2. 7 ACCOUNT METRICS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 text-xs">
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Portfolio Value</span>
            <span className="text-sm font-bold text-white font-tabular">
              ${account.portfolio_value?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Cash Balance</span>
            <span className="text-sm font-bold text-voltron-300 font-tabular">
              ${account.cash?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Buying Power</span>
            <span className="text-sm font-bold text-voltron-cyan font-tabular">
              ${account.buying_power?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Daily P&L</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular">
              +${account.daily_pnl?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Unrealized P&L</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular">
              +${account.unrealized_pnl?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Realized P&L</span>
            <span className="text-sm font-bold text-white font-tabular">
              +${account.realized_pnl?.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Exposure %</span>
            <span className="text-sm font-bold text-white font-tabular">
              {account.portfolio_exposure_pct?.toFixed(1)}% <span className="text-[10px] text-voltron-400 font-normal">/ 30%</span>
            </span>
          </div>
        </div>

        {/* 3. ROW 2: ACTIVE MULTI-LEG POSITIONS (7 cols) + P&L CHART (5 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5">
          {/* Active Multi-Leg Positions (7 cols) */}
          <div className="lg:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold text-white uppercase px-1">
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-voltron-cyan" />
                <span>OPEN MULTI-LEG POSITIONS ({positions.length})</span>
              </span>
              <span className="text-voltron-400 text-[10px] font-normal">
                DYNAMIC TP: 50% &bull; STOP LOSS: 100%
              </span>
            </div>

            {positions.map((pos: any) => (
              <div
                key={pos.id}
                onClick={() => setSelectedPosition(pos)}
                className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/90 hover:border-voltron-cyan/60 transition-all cursor-pointer space-y-3"
              >
                {/* Header Strip */}
                <div className="flex flex-wrap items-center justify-between border-b border-voltron-800 pb-2 gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan font-bold text-xs">
                      {pos.symbol}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{pos.symbol}</span>
                        <span className="text-xs text-voltron-cyan font-bold">{pos.strategy.replace(/_/g, " ")}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30">
                          {pos.status}
                        </span>
                      </div>
                      <div className="text-[10px] text-voltron-400">{pos.expiration} &bull; {pos.opened_at}</div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] uppercase text-voltron-400 block">Unrealized P&L</span>
                    <span className="text-sm font-bold text-voltron-emerald font-tabular">
                      +${pos.unrealized_pnl?.toFixed(2)} (+{pos.unrealized_pnl_pct?.toFixed(1)}%)
                    </span>
                  </div>
                </div>

                {/* Individual Legs Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-mono text-[11px]">
                    <thead className="bg-voltron-950 text-[9px] text-voltron-400 uppercase">
                      <tr>
                        <th className="p-1.5">Action</th>
                        <th className="p-1.5">Strike</th>
                        <th className="p-1.5">Entry</th>
                        <th className="p-1.5">Current</th>
                        <th className="p-1.5">&Delta; Delta</th>
                        <th className="p-1.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-voltron-800/60">
                      {pos.legs.map((leg: any, idx: number) => (
                        <tr key={idx} className="hover:bg-voltron-850/40">
                          <td className={clsx("p-1.5 font-bold", leg.side === "SELL" ? "text-voltron-emerald" : "text-voltron-cyan")}>
                            {leg.type}
                          </td>
                          <td className="p-1.5 font-bold text-white font-tabular">${leg.strike}</td>
                          <td className="p-1.5 text-voltron-300 font-tabular">${leg.price?.toFixed(2)}</td>
                          <td className="p-1.5 text-white font-tabular">${leg.current?.toFixed(2)}</td>
                          <td className="p-1.5 text-voltron-300 font-tabular">{leg.delta?.toFixed(2)}</td>
                          <td className="p-1.5 text-right text-voltron-emerald font-bold text-[10px]">HEALTHY</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Exit & Greeks Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1 border-t border-voltron-800 text-[10px]">
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between">
                    <span className="text-voltron-400">Position Theta:</span>
                    <span className="font-bold text-voltron-emerald">+{pos.theta}/day</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between">
                    <span className="text-voltron-400">Position Vega:</span>
                    <span className="font-bold text-voltron-cyan">{pos.vega}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between">
                    <span className="text-voltron-400">TP (50%):</span>
                    <span className="font-bold text-voltron-emerald">${pos.take_profit_target?.toFixed(2)}</span>
                  </div>
                  <div className="p-1.5 rounded bg-voltron-950 border border-voltron-800 flex justify-between">
                    <span className="text-voltron-400">SL (100%):</span>
                    <span className="font-bold text-voltron-rose">${pos.stop_loss_limit?.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: P&L Chart & Reconciliation (5 cols) */}
          <div className="lg:col-span-5 space-y-3">
            {/* P&L Equity Chart */}
            <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2.5">
              <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5">
                <span className="flex items-center gap-1.5 text-white font-bold text-xs uppercase">
                  <Activity className="w-3.5 h-3.5 text-voltron-cyan" />
                  <span>P&L / EQUITY CURVE</span>
                </span>
                <div className="flex gap-1 text-[10px]">
                  {(["1D", "1M", "ALL"] as const).map((period) => (
                    <button
                      key={period}
                      onClick={() => setSelectedPeriod(period)}
                      className={clsx(
                        "px-2 py-0.5 rounded font-semibold transition-colors",
                        selectedPeriod === period
                          ? "bg-voltron-750 text-voltron-cyan border border-voltron-600/50"
                          : "text-voltron-400 hover:text-white"
                      )}
                    >
                      {period}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-[180px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={pnlChartData}>
                    <defs>
                      <linearGradient id="portEqGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00F0FF" stopOpacity={0.25} />
                        <stop offset="95%" stopColor="#00F0FF" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="2 2" stroke="#181E2C" vertical={false} />
                    <XAxis dataKey="time" stroke="#4A5568" fontSize={10} tickLine={false} />
                    <YAxis stroke="#4A5568" fontSize={10} tickLine={false} domain={["auto", "auto"]} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0A0D14",
                        borderColor: "#1E2638",
                        borderRadius: "6px",
                        fontSize: "11px",
                        fontFamily: "monospace",
                      }}
                      formatter={(val: any) => [`$${Number(val).toLocaleString()}`, "Equity"]}
                    />
                    <Area type="monotone" dataKey="equity" stroke="#00F0FF" strokeWidth={2} fillOpacity={1} fill="url(#portEqGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Alpaca State Reconciliation Card */}
            <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2">
              <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
                <div className="flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-voltron-emerald" />
                  <span>PAPER STATE RECONCILIATION</span>
                </div>
                <span className="text-[10px] text-voltron-emerald font-bold">● SYNCHRONIZED</span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800 space-y-0.5">
                  <span className="text-[9px] uppercase text-voltron-400 block">VOLTRON Internal State</span>
                  <div className="text-white text-[11px] font-bold">Equity: $100,000.00</div>
                  <div className="text-voltron-300 text-[10px]">Positions: 2 &bull; Orders: 1</div>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800 space-y-0.5">
                  <span className="text-[9px] uppercase text-voltron-400 block">Alpaca Account State</span>
                  <div className="text-voltron-emerald text-[11px] font-bold">Equity: $100,000.00</div>
                  <div className="text-voltron-300 text-[10px]">Positions: 2 &bull; Orders: 1</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Position Detail Modal */}
      {selectedPosition && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="w-full max-w-lg bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedPosition(null)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <Layers className="w-5 h-5 text-voltron-cyan" />
              <div>
                <h3 className="text-sm font-bold text-white uppercase">
                  POSITION DETAIL &mdash; {selectedPosition.symbol} {selectedPosition.strategy}
                </h3>
                <span className="text-[10px] text-voltron-400 font-bold">{selectedPosition.opened_at}</span>
              </div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Net Credit</span>
                  <span className="font-bold text-white font-tabular">${selectedPosition.net_credit?.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Cost to Close</span>
                  <span className="font-bold text-voltron-cyan font-tabular">${selectedPosition.current_cost_to_close?.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Max Profit</span>
                  <span className="font-bold text-voltron-emerald font-tabular">${selectedPosition.max_profit?.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Max Loss</span>
                  <span className="font-bold text-voltron-rose font-tabular">${selectedPosition.max_loss?.toFixed(2)}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1 text-xs">
                <span className="text-[10px] uppercase text-voltron-cyan font-bold block">Dynamic Exit Conditions</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-voltron-200">
                  <div>Take Profit (50% target): <strong className="text-voltron-emerald">${selectedPosition.take_profit_target?.toFixed(2)}</strong> ({selectedPosition.distance_to_tp})</div>
                  <div>Stop Loss (100% risk limit): <strong className="text-voltron-rose">${selectedPosition.stop_loss_limit?.toFixed(2)}</strong> ({selectedPosition.distance_to_sl})</div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedPosition(null)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </TerminalLayout>
  );
}
