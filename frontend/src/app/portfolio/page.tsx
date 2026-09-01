"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchAccount } from "@/lib/api";
import { AccountSummary, OpenPosition } from "@/types";
import {
  Briefcase,
  DollarSign,
  TrendingUp,
  Percent,
  Layers,
  ShieldCheck,
  CheckCircle2,
  Activity,
  Maximize2,
} from "lucide-react";
import clsx from "clsx";

export default function PortfolioPage() {
  const [account, setAccount] = useState<AccountSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const openPositions: OpenPosition[] = [
    {
      id: "POS-001",
      symbol: "SPY",
      strategy: "IRON_CONDOR",
      opened_at: "2026-09-01 14:32:00",
      expiration: "2026-10-17 (45 DTE)",
      spot_at_entry: 590.2,
      current_spot: 591.42,
      net_credit: 1.85,
      current_cost_to_close: 1.48,
      unrealized_pnl: 145.0,
      unrealized_pnl_pct: 7.84,
      max_profit: 185.0,
      max_loss: 315.0,
      take_profit_target: 0.92,
      stop_loss_limit: 3.7,
      delta: 0.02,
      theta: 4.85,
      vega: -14.2,
      legs: [
        { type: "LONG PUT", strike: 575, price: 1.25, current: 1.1, delta: -0.12 },
        { type: "SHORT PUT", strike: 580, price: 2.2, current: 1.9, delta: -0.22 },
        { type: "SHORT CALL", strike: 605, price: 2.1, current: 1.75, delta: 0.2 },
        { type: "LONG CALL", strike: 610, price: 1.2, current: 1.07, delta: 0.11 },
      ],
    },
    {
      id: "POS-002",
      symbol: "QQQ",
      strategy: "BULL_PUT_SPREAD",
      opened_at: "2026-08-28 10:15:00",
      expiration: "2026-10-02 (30 DTE)",
      spot_at_entry: 492.1,
      current_spot: 498.75,
      net_credit: 1.15,
      current_cost_to_close: 0.42,
      unrealized_pnl: 365.0,
      unrealized_pnl_pct: 63.48,
      max_profit: 575.0,
      max_loss: 1925.0,
      take_profit_target: 0.57,
      stop_loss_limit: 2.3,
      delta: 0.08,
      theta: 6.1,
      vega: -9.4,
      legs: [
        { type: "LONG PUT", strike: 485, price: 1.85, current: 0.7, delta: -0.09 },
        { type: "SHORT PUT", strike: 490, price: 3.0, current: 1.12, delta: -0.17 },
      ],
    },
  ];

  useEffect(() => {
    fetchAccount().then((res) => {
      setAccount(res);
      setLoading(false);
    });
  }, []);

  if (loading || !account) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>FETCHING ALPACA PAPER PORTFOLIO & POSITION MAP...</span>
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
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>PORTFOLIO & ACTIVE POSITION MAP</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30">
                  ALPACA PAPER TRADING
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Real-time Greeks exposure and dynamic multi-leg position monitoring
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-voltron-300">
            <span>Status:</span>
            <span className="text-voltron-emerald font-bold">● {account.status}</span>
          </div>
        </div>

        {/* 6 Account Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 font-mono text-xs">
          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Portfolio Value</span>
            <span className="text-base font-bold text-white font-tabular">
              ${account.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Cash Balance</span>
            <span className="text-base font-bold text-voltron-300 font-tabular">
              ${account.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Buying Power</span>
            <span className="text-base font-bold text-voltron-cyan font-tabular">
              ${account.buying_power.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Daily P&L</span>
            <span className="text-base font-bold text-voltron-emerald font-tabular">
              +${account.daily_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Unrealized P&L</span>
            <span className="text-base font-bold text-voltron-emerald font-tabular">
              +${account.unrealized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Portfolio Exposure</span>
            <span className="text-base font-bold text-white font-tabular">
              {account.portfolio_exposure_pct.toFixed(1)}%
            </span>
          </div>
        </div>

        {/* Active Multi-Leg Positions Map */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono font-bold text-white uppercase px-1">
            <span className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-voltron-cyan" />
              Active Open Multi-Leg Strategies ({openPositions.length})
            </span>
            <span className="text-voltron-400 font-normal text-[11px]">
              Dynamic Profit Target: 50% Credit | Stop Loss: 100% Risk
            </span>
          </div>

          {openPositions.map((pos) => (
            <div
              key={pos.id}
              className="terminal-card p-5 border border-voltron-750/90 bg-voltron-850/60 space-y-4"
            >
              {/* Position Header Banner */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-voltron-750 pb-3 font-mono">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan font-bold text-xs">
                    {pos.symbol}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{pos.symbol}</span>
                      <span className="text-xs text-voltron-cyan font-semibold">
                        {pos.strategy.replace(/_/g, " ")}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30">
                        OPEN
                      </span>
                    </div>
                    <div className="text-[11px] text-voltron-400">
                      Exp: {pos.expiration} | Opened: {pos.opened_at}
                    </div>
                  </div>
                </div>

                {/* Right Unrealized P&L Banner */}
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-voltron-400 block">Unrealized P&L</span>
                    <span className="text-base font-bold text-voltron-emerald font-tabular">
                      +${pos.unrealized_pnl.toFixed(2)} (+{pos.unrealized_pnl_pct.toFixed(1)}%)
                    </span>
                  </div>

                  <div className="text-right border-l border-voltron-750 pl-4">
                    <span className="text-[10px] uppercase text-voltron-400 block">Net Credit</span>
                    <span className="text-sm font-bold text-white font-tabular">
                      ${pos.net_credit.toFixed(2)} &rarr; ${pos.current_cost_to_close.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Legs Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left font-mono text-xs">
                  <thead className="bg-voltron-900 text-[10px] text-voltron-400 uppercase">
                    <tr>
                      <th className="p-2">Leg Action & Type</th>
                      <th className="p-2">Strike</th>
                      <th className="p-2">Entry Price</th>
                      <th className="p-2">Current Bid/Ask</th>
                      <th className="p-2">&Delta; Delta</th>
                      <th className="p-2 text-right">Leg Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-voltron-800 text-[11px]">
                    {pos.legs.map((leg, idx) => (
                      <tr key={idx} className="hover:bg-voltron-800/20">
                        <td className="p-2 font-semibold text-white">{leg.type}</td>
                        <td className="p-2 font-bold font-tabular text-voltron-cyan">${leg.strike}</td>
                        <td className="p-2 font-tabular text-voltron-300">${leg.price.toFixed(2)}</td>
                        <td className="p-2 font-tabular text-white">${leg.current.toFixed(2)}</td>
                        <td className="p-2 font-tabular text-voltron-300">{leg.delta.toFixed(2)}</td>
                        <td className="p-2 text-right text-voltron-emerald font-bold">HEALTHY</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Position Greeks & Exit Rules Footer */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-voltron-750 font-mono text-[11px]">
                <div className="p-2 rounded bg-voltron-900/60 border border-voltron-800 flex justify-between">
                  <span className="text-voltron-400">Position Theta:</span>
                  <span className="font-bold text-voltron-emerald font-tabular">+{pos.theta.toFixed(2)}/day</span>
                </div>
                <div className="p-2 rounded bg-voltron-900/60 border border-voltron-800 flex justify-between">
                  <span className="text-voltron-400">Position Vega:</span>
                  <span className="font-bold text-voltron-cyan font-tabular">{pos.vega.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-voltron-900/60 border border-voltron-800 flex justify-between">
                  <span className="text-voltron-400">Take Profit (50%):</span>
                  <span className="font-bold text-voltron-emerald font-tabular">${pos.take_profit_target.toFixed(2)}</span>
                </div>
                <div className="p-2 rounded bg-voltron-900/60 border border-voltron-800 flex justify-between">
                  <span className="text-voltron-400">Stop Loss (100%):</span>
                  <span className="font-bold text-voltron-rose font-tabular">${pos.stop_loss_limit.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </TerminalLayout>
  );
}
