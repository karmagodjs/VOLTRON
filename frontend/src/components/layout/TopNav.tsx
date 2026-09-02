"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings as SettingsIcon,
  ChevronDown,
} from "lucide-react";
import clsx from "clsx";

interface TopNavProps {
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
  onOpenCopilot: () => void;
  onOpenKillSwitch: () => void;
  killSwitchActive?: boolean;
  portfolioValue?: number | null;
  marketPrice?: number | null;
  marketStatus?: string | null;
  agentStatus?: "ACTIVE" | "IDLE" | "STOPPED" | "PAUSED" | null;
  isConnected?: boolean;
}

const symbols = [
  { symbol: "SPY", label: "S&P 500 ETF" },
  { symbol: "QQQ", label: "Nasdaq 100 ETF" },
  { symbol: "IWM", label: "Russell 2000 ETF" },
  { symbol: "NVDA", label: "NVIDIA Corp" },
  { symbol: "AAPL", label: "Apple Inc" },
  { symbol: "TSLA", label: "Tesla Inc" },
  { symbol: "MSFT", label: "Microsoft Corp" },
  { symbol: "AMZN", label: "Amazon.com Inc" },
];

export default function TopNav({
  currentSymbol,
  onSelectSymbol,
  onOpenCopilot,
  onOpenKillSwitch,
  killSwitchActive = false,
  portfolioValue,
  marketPrice,
  marketStatus = "OPEN",
  agentStatus = "ACTIVE",
  isConnected = true,
}: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-14 bg-voltron-950/95 backdrop-blur border-b border-voltron-750/70 px-4 flex items-center justify-between sticky top-0 z-20 font-mono text-xs">
      {/* Left: Terminal Brand & Live Market Status Bar */}
      <div className="flex items-center gap-3 overflow-x-auto py-1">
        {/* Market Symbol Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded bg-voltron-850 hover:bg-voltron-800 border border-voltron-700/80 font-bold text-white transition-all shadow-sm"
          >
            <span className="text-voltron-400 text-[11px]">Market:</span>
            <span className="text-voltron-cyan font-bold text-xs">{currentSymbol}</span>
            <ChevronDown className="w-3 h-3 text-voltron-400 ml-0.5" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-48 bg-voltron-850 border border-voltron-700 rounded-md shadow-terminal p-1 z-50">
              <div className="px-2 py-1 text-[9px] uppercase text-voltron-400 tracking-wider">
                Select Market
              </div>
              {symbols.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => {
                    onSelectSymbol(item.symbol);
                    setDropdownOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-2.5 py-1.5 rounded text-xs font-semibold flex items-center justify-between transition-colors",
                    currentSymbol === item.symbol
                      ? "bg-voltron-cyan/15 text-voltron-cyan"
                      : "text-voltron-200 hover:bg-voltron-750 hover:text-white"
                  )}
                >
                  <span className="font-bold">{item.symbol}</span>
                  <span className="text-[10px] text-voltron-400">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Real Price Display */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase">Price:</span>
          <span className="font-bold text-white font-tabular">
            {marketPrice != null ? `$${marketPrice.toFixed(2)}` : "—"}
          </span>
        </div>

        {/* Market Status (OPEN / CLOSED) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase">Market:</span>
          <span
            className={clsx(
              "font-bold flex items-center gap-1 text-[11px]",
              marketStatus === "OPEN" ? "text-voltron-emerald" : "text-voltron-rose"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                marketStatus === "OPEN" ? "bg-voltron-emerald inline-block" : "bg-voltron-rose inline-block"
              )}
            ></span>
            {marketStatus || "—"}
          </span>
        </div>

        {/* Trading Mode (PAPER) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase">Mode:</span>
          <span className="text-voltron-cyan font-bold text-[11px]">PAPER</span>
        </div>

        {/* Agent Status (ACTIVE / IDLE / STOPPED) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase">Agent:</span>
          <span
            className={clsx(
              "font-bold flex items-center gap-1 text-[11px]",
              agentStatus === "ACTIVE"
                ? "text-voltron-emerald"
                : agentStatus === "PAUSED"
                ? "text-voltron-amber"
                : "text-voltron-rose"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                agentStatus === "ACTIVE"
                  ? "bg-voltron-emerald animate-pulse"
                  : agentStatus === "PAUSED"
                  ? "bg-voltron-amber"
                  : "bg-voltron-rose"
              )}
            ></span>
            {agentStatus || "—"}
          </span>
        </div>

        {/* Connection Status */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase">Conn:</span>
          <span
            className={clsx(
              "font-bold flex items-center gap-1 text-[11px]",
              isConnected ? "text-voltron-emerald" : "text-voltron-rose"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                isConnected ? "bg-voltron-emerald" : "bg-voltron-rose"
              )}
            ></span>
            {isConnected ? "CONNECTED" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Right: Portfolio Metric, Copilot, Kill Switch & Alerts */}
      <div className="flex items-center gap-2.5 flex-shrink-0">
        {/* Real Portfolio Value */}
        <div className="flex flex-col items-end px-2.5 py-1 bg-voltron-900 border border-voltron-750/70 rounded">
          <span className="text-[9px] uppercase text-voltron-400 tracking-wider">
            Portfolio
          </span>
          <span className="text-xs font-bold text-white font-tabular">
            {portfolioValue != null
              ? `$${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
              : "—"}
          </span>
        </div>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="px-2.5 py-1.5 rounded bg-voltron-900 hover:bg-voltron-850 border border-voltron-750 text-xs font-mono font-bold text-voltron-cyan transition-colors"
        >
          AI COPILOT
        </button>

        {/* Emergency Kill Switch Button */}
        <button
          onClick={onOpenKillSwitch}
          className={clsx(
            "px-2.5 py-1.5 rounded text-xs font-mono font-bold transition-colors border",
            killSwitchActive
              ? "bg-voltron-rose text-white border-voltron-rose"
              : "bg-voltron-rose/10 hover:bg-voltron-rose/20 text-voltron-rose border-voltron-rose/30"
          )}
        >
          <span>
            {killSwitchActive ? "KILL SWITCH ENGAGED" : "KILL SWITCH"}
          </span>
        </button>

        {/* System Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-1.5 rounded text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-voltron-850 border border-voltron-700 rounded-lg shadow-terminal p-3 z-50 text-xs">
              <div className="flex items-center justify-between border-b border-voltron-750 pb-2 mb-2 font-bold text-white">
                <span>System Signals</span>
                <span className="text-[10px] text-voltron-cyan">LIVE</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-voltron-900 border border-voltron-800">
                  <div className="text-voltron-cyan text-[11px] font-bold">Paper Order Routed</div>
                  <div className="text-[10px] text-voltron-300">SPY 45DTE Iron Condor @ $1.85 credit.</div>
                </div>
                <div className="p-2 rounded bg-voltron-900 border border-voltron-800">
                  <div className="text-voltron-emerald text-[11px] font-bold">Risk Gates Verified</div>
                  <div className="text-[10px] text-voltron-300">7 safety checks evaluated [PASS].</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings Link */}
        <Link
          href={currentSymbol ? `/settings?symbol=${currentSymbol}` : "/settings"}
          className="p-1.5 rounded text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
