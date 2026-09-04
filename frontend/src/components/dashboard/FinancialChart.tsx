"use client";

import { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { MarketHistoryPoint } from "@/types";
import clsx from "clsx";

interface FinancialChartProps {
  history: MarketHistoryPoint[];
  symbol: string;
}

type ChartTab = "PRICE" | "REALIZED VOL" | "IMPLIED VOL" | "IV/RV" | "VOLUME";

export default function FinancialChart({ history, symbol }: FinancialChartProps) {
  const [activeTab, setActiveTab] = useState<ChartTab>("PRICE");
  const [activeTimeframe, setActiveTimeframe] = useState<string>("1M");

  const tabs: ChartTab[] = ["PRICE", "REALIZED VOL", "IMPLIED VOL", "IV/RV", "VOLUME"];
  const timeframes = ["1D", "5D", "1M", "3M", "1Y"];

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
      case "VOLUME":
        return "volume";
    }
  };

  const getColor = () => {
    switch (activeTab) {
      case "PRICE":
        return "#00F0FF";
      case "REALIZED VOL":
        return "#C7D0E3";
      case "IMPLIED VOL":
        return "#8B5CF6";
      case "IV/RV":
        return "#00E676";
      case "VOLUME":
        return "#3B82F6";
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
      case "VOLUME":
        return "";
    }
  };

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col h-[380px]">

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-voltron-750/60 pb-3 mb-3">

        <div className="flex items-center gap-1 bg-voltron-900 p-1 rounded-lg border border-voltron-750">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-2.5 py-1 rounded text-[11px] font-mono font-semibold transition-all",
                activeTab === tab
                  ? "bg-voltron-750 text-voltron-cyan shadow-sm border border-voltron-600/50"
                  : "text-voltron-400 hover:text-voltron-200"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setActiveTimeframe(tf)}
              className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-mono font-medium transition-colors",
                activeTimeframe === tf
                  ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                  : "text-voltron-400 hover:text-white"
              )}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 w-full min-h-0">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === "VOLUME" ? (
            <BarChart data={history}>
              <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
              <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#4A5568"
                fontSize={10}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000000).toFixed(0)}M`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E1118",
                  borderColor: "#1E2638",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
                formatter={(value: any) => [`${(value / 1000000).toFixed(2)}M Shares`, "Volume"]}
              />
              <Bar dataKey="volume" fill="#3B82F6" radius={[4, 4, 0, 0]} opacity={0.8} />
            </BarChart>
          ) : (
            <AreaChart data={history}>
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor()} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={getColor()} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#181E2C" vertical={false} />
              <XAxis dataKey="date" stroke="#4A5568" fontSize={10} tickLine={false} />
              <YAxis
                stroke="#4A5568"
                fontSize={10}
                tickLine={false}
                domain={["auto", "auto"]}
                tickFormatter={(v) => `${activeTab === "PRICE" ? "$" : ""}${v}${activeTab === "IV/RV" ? "x" : activeTab.includes("VOL") ? "%" : ""}`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0E1118",
                  borderColor: "#1E2638",
                  borderRadius: "8px",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
                formatter={(value: any) => [
                  `${activeTab === "PRICE" ? "$" : ""}${Number(value).toFixed(2)}${getUnit()}`,
                  activeTab,
                ]}
              />
              <Area
                type="monotone"
                dataKey={getDataKey()}
                stroke={getColor()}
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[10px] font-mono text-voltron-400 border-t border-voltron-750/40 pt-2 mt-1">
        <span>DataSource: SIP Consolidated Historical Bars</span>
        <span className="text-voltron-cyan flex items-center gap-1">
          ● Interactive Mode Active
        </span>
      </div>
    </div>
  );
}
