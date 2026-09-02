"use client";

import { useState } from "react";
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
} from "recharts";
import { MarketData, RiskStatus, AccountSummary } from "@/types";
import {
  TrendingUp,
  TrendingDown,
  Zap,
  ShieldCheck,
  Briefcase,
  Activity,
  AlertCircle,
} from "lucide-react";
import clsx from "clsx";

interface MarketWorkspaceProps {
  market: MarketData | null;
  risk: RiskStatus | null;
  account: AccountSummary | null;
  isLoading?: boolean;
}

type ChartTab = "PRICE" | "REALIZED VOL" | "IMPLIED VOL" | "IV/RV";

export default function MarketWorkspace({
  market,
  risk,
  account,
  isLoading = false,
}: MarketWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("PRICE");
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1M");

  const tabs: ChartTab[] = ["PRICE", "REALIZED VOL", "IMPLIED VOL", "IV/RV"];
  const timeframes = ["1D", "5D", "1M", "3M", "6M", "1Y"];

  const isPositive = market ? market.change >= 0 : true;

  const getDataKey = () => {
    switch (activeTab) {
      case "PRICE":
        return "price";
      case "REALIZED VOL":
        return "rv";
      case "IMPLIED VOL":
        return "iv";
      case "IV/RV":
        return "iv_rv";
    }
  };

  const getChartColor = () => {
    switch (activeTab) {
      case "PRICE":
        return "#00F0FF";
      case "REALIZED VOL":
        return "#94A3B8";
      case "IMPLIED VOL":
        return "#8B5CF6";
      case "IV/RV":
        return "#00E676";
    }
  };

  const getUnit = () => {
    switch (activeTab) {
      case "PRICE":
        return "$";
      case "REALIZED VOL":
      case "IMPLIED VOL":
        return "%";
      case "IV/RV":
        return "x";
    }
  };

  return (
    <div className="space-y-3 font-mono">
      {/* 1. Market Header Strip */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded bg-voltron-cyan/15 border border-voltron-cyan/40 flex items-center justify-center text-voltron-cyan font-bold text-sm shadow-cyan-glow">
            {market?.symbol || "SPY"}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-wider">
                {market?.symbol || "SPY"}
              </span>
              <span className="text-[11px] text-voltron-400 hidden sm:inline">
                {market?.name || "SPDR S&P 500 ETF Trust"}
              </span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-voltron-800 text-voltron-300 border border-voltron-700 uppercase font-semibold">
                {market?.market_regime || "REAL-TIME FEED"}
              </span>
            </div>

            <div className="flex items-baseline gap-2.5 mt-0.5">
              <span className="text-xl font-bold text-white font-tabular">
                {market?.price != null ? `$${market.price.toFixed(2)}` : "—"}
              </span>
              {market?.change != null ? (
                <span
                  className={clsx(
                    "flex items-center gap-1 text-xs font-bold font-tabular px-1.5 py-0.2 rounded",
                    isPositive
                      ? "text-voltron-emerald bg-voltron-emerald/15 border border-voltron-emerald/30"
                      : "text-voltron-rose bg-voltron-rose/15 border border-voltron-rose/30"
                  )}
                >
                  {isPositive ? (
                    <TrendingUp className="w-3 h-3" />
                  ) : (
                    <TrendingDown className="w-3 h-3" />
                  )}
                  {isPositive ? "+" : ""}
                  {market.change.toFixed(2)} ({isPositive ? "+" : ""}
                  {market.change_percent.toFixed(2)}%)
                </span>
              ) : (
                <span className="text-xs text-voltron-400 font-tabular">DATA UNAVAILABLE</span>
              )}
            </div>
          </div>
        </div>

        {/* Timeframe & Metric Selectors */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Timeframe Buttons */}
          <div className="flex items-center gap-0.5 bg-voltron-950 p-0.5 rounded border border-voltron-800">
            {timeframes.map((tf) => (
              <button
                key={tf}
                onClick={() => setActiveTimeframe(tf)}
                className={clsx(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-colors",
                  activeTimeframe === tf
                    ? "bg-voltron-cyan/20 text-voltron-cyan border border-voltron-cyan/40"
                    : "text-voltron-400 hover:text-white"
                )}
              >
                {tf}
              </button>
            ))}
          </div>

          {/* Metric Tabs */}
          <div className="flex items-center gap-0.5 bg-voltron-950 p-0.5 rounded border border-voltron-800">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={clsx(
                  "px-2 py-0.5 rounded text-[10px] font-semibold transition-all",
                  activeTab === tab
                    ? "bg-voltron-800 text-voltron-cyan border border-voltron-700 shadow-sm"
                    : "text-voltron-400 hover:text-voltron-200"
                )}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Large Central Market Chart */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 h-[340px] flex flex-col justify-between">
        <div className="flex items-center justify-between text-[11px] text-voltron-400 border-b border-voltron-800 pb-1.5 mb-2">
          <span className="flex items-center gap-1.5 text-white font-bold text-xs uppercase">
            <Activity className="w-3.5 h-3.5 text-voltron-cyan" />
            <span>
              {market?.symbol || "SPY"} — {activeTab} Time Series ({activeTimeframe})
            </span>
          </span>
          <span className="text-[10px] text-voltron-cyan font-bold">
            SIP CONSOLIDATED MARKET FEED
          </span>
        </div>

        <div className="flex-1 w-full min-h-0">
          {market?.history && market.history.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={market.history}>
                <defs>
                  <linearGradient id="chartFillGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={getChartColor()} stopOpacity={0.25} />
                    <stop offset="95%" stopColor={getChartColor()} stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="2 2" stroke="#181E2C" vertical={false} />
                <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
                <YAxis
                  stroke="#4A5568"
                  fontSize={10}
                  tickLine={false}
                  domain={["auto", "auto"]}
                  tickFormatter={(v) =>
                    `${activeTab === "PRICE" ? "$" : ""}${v}${activeTab === "IV/RV" ? "x" : activeTab.includes("VOL") ? "%" : ""}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#0A0D14",
                    borderColor: "#1E2638",
                    borderRadius: "6px",
                    fontSize: "11px",
                    fontFamily: "monospace",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
                  }}
                  formatter={(value: any) => [
                    `${activeTab === "PRICE" ? "$" : ""}${Number(value).toFixed(2)}${getUnit()}`,
                    activeTab,
                  ]}
                />
                <Area
                  type="monotone"
                  dataKey={getDataKey()}
                  stroke={getChartColor()}
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#chartFillGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-voltron-400 text-xs">
              <AlertCircle className="w-6 h-6 text-voltron-amber mb-2" />
              <span>WAITING FOR MARKET DATA BARS...</span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Volatility Alpha Panel */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80">
        <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-2.5">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-voltron-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              VOLATILITY ALPHA
            </span>
          </div>
          <span
            className={clsx(
              "text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider",
              market?.vol_signal === "IV EXPENSIVE"
                ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 shadow-emerald-glow"
                : "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
            )}
          >
            {market?.vol_signal || "CALCULATING"}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              IV
            </span>
            <span className="font-bold text-voltron-cyan font-tabular">
              {market?.implied_volatility != null ? `${market.implied_volatility.toFixed(2)}%` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              RV
            </span>
            <span className="font-bold text-white font-tabular">
              {market?.realized_volatility != null ? `${market.realized_volatility.toFixed(2)}%` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              IV / RV
            </span>
            <span className="font-bold text-voltron-emerald font-tabular">
              {market?.iv_rv_ratio != null ? `${market.iv_rv_ratio.toFixed(2)}x` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              IV PREMIUM
            </span>
            <span className="font-bold text-voltron-emerald font-tabular">
              {market?.iv_premium != null ? `+${market.iv_premium.toFixed(1)}%` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              OPPORTUNITY
            </span>
            <span className="font-bold text-voltron-cyan font-tabular">
              {market?.opportunity_score != null ? `${market.opportunity_score} / 100` : "—"}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">
              SIGNAL
            </span>
            <span className="font-bold text-voltron-emerald font-tabular truncate block">
              {market?.vol_signal || "DATA UNAVAILABLE"}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Portfolio Summary & Risk Status Summary Strip */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        {/* Portfolio Summary */}
        <div className="p-3 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2">
          <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
            <div className="flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-voltron-cyan" />
              <span>PORTFOLIO SUMMARY</span>
            </div>
            <span className="text-[10px] text-voltron-cyan">ALPACA PAPER</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Portfolio Value</span>
              <span className="font-bold text-white font-tabular text-[11px]">
                {account?.portfolio_value != null
                  ? `$${account.portfolio_value.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Cash</span>
              <span className="font-bold text-white font-tabular text-[11px]">
                {account?.cash != null
                  ? `$${account.cash.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Buying Power</span>
              <span className="font-bold text-voltron-cyan font-tabular text-[11px]">
                {account?.buying_power != null
                  ? `$${account.buying_power.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Daily P&L</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {account?.daily_pnl != null
                  ? `+${account.daily_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Unrealized P&L</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {account?.unrealized_pnl != null
                  ? `+${account.unrealized_pnl.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                  : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Open Positions</span>
              <span className="font-bold text-white font-tabular text-[11px]">
                {account?.open_positions_count != null ? `${account.open_positions_count} Active` : "—"}
              </span>
            </div>
          </div>
        </div>

        {/* Risk Status Summary */}
        <div className="p-3 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-2">
          <div className="flex items-center justify-between border-b border-voltron-800 pb-1.5 text-white font-bold text-xs uppercase">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-voltron-rose" />
              <span>RISK ENGINE</span>
            </div>
            <span
              className={clsx(
                "text-[10px] px-1.5 py-0.2 rounded font-bold uppercase",
                risk?.overall_status === "APPROVED"
                  ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                  : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
              )}
            >
              {risk?.overall_status === "APPROVED" ? "RISK APPROVED" : "RISK REJECTED"}
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Trade Risk</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {risk?.trade_risk_pct != null ? `${risk.trade_risk_pct.toFixed(2)}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Exposure</span>
              <span className="font-bold text-voltron-cyan font-tabular text-[11px]">
                {risk?.portfolio_exposure_pct != null ? `${risk.portfolio_exposure_pct.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Daily Loss Limit</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {risk?.daily_loss_limit_pct != null ? `${risk.daily_loss_limit_pct.toFixed(1)}%` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Consecutive Losses</span>
              <span className="font-bold text-white font-tabular text-[11px]">
                {risk?.consecutive_losses != null ? `${risk.consecutive_losses} / 3` : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Kill Switch</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {risk?.kill_switch != null ? (risk.kill_switch ? "ACTIVE" : "ARMED") : "—"}
              </span>
            </div>
            <div>
              <span className="text-[9px] text-voltron-400 uppercase block">Risk Gates</span>
              <span className="font-bold text-voltron-emerald font-tabular text-[11px]">
                {risk?.gates ? `${risk.gates.filter(g => g.status === 'PASS').length}/${risk.gates.length} Passed` : "—"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
