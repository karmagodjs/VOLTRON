"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings as SettingsIcon,
  ShieldAlert,
  Bot,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import clsx from "clsx";

interface TopNavProps {
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
  onOpenCopilot: () => void;
  onOpenKillSwitch: () => void;
  killSwitchActive?: boolean;
  portfolioValue?: number;
  agentStatus?: "ACTIVE" | "IDLE" | "PAUSED";
}

const symbols = ["SPY", "QQQ", "IWM", "NVDA", "AAPL", "TSLA"];

export default function TopNav({
  currentSymbol,
  onSelectSymbol,
  onOpenCopilot,
  onOpenKillSwitch,
  killSwitchActive = false,
  portfolioValue = 100000.0,
  agentStatus = "ACTIVE",
}: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-14 bg-voltron-950/90 backdrop-blur border-b border-voltron-750/60 px-4 flex items-center justify-between sticky top-0 z-20">
      {/* Left: Market Symbol Selector & Market Status */}
      <div className="flex items-center gap-4">
        {/* Symbol Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-voltron-850 hover:bg-voltron-800 border border-voltron-700/80 text-xs font-mono font-bold text-white transition-all shadow-sm"
          >
            <span className="text-voltron-cyan">TICKER:</span>
            <span className="text-sm">{currentSymbol}</span>
            <ChevronDown className="w-3.5 h-3.5 text-voltron-400" />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-44 bg-voltron-850 border border-voltron-700 rounded-md shadow-terminal p-1 z-50">
              <div className="px-2 py-1 text-[10px] font-mono text-voltron-400 uppercase">
                Select Asset
              </div>
              {symbols.map((sym) => (
                <button
                  key={sym}
                  onClick={() => {
                    onSelectSymbol(sym);
                    setDropdownOpen(false);
                  }}
                  className={clsx(
                    "w-full text-left px-2.5 py-1.5 rounded text-xs font-mono font-semibold flex items-center justify-between transition-colors",
                    currentSymbol === sym
                      ? "bg-voltron-cyan/15 text-voltron-cyan"
                      : "text-voltron-200 hover:bg-voltron-750 hover:text-white"
                  )}
                >
                  <span>{sym}</span>
                  <span className="text-[10px] text-voltron-400">
                    {sym === "SPY" ? "S&P 500" : sym === "QQQ" ? "Nasdaq 100" : "Optionable"}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Market Status */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-850/80 border border-voltron-750/60 text-[11px] font-mono">
          <span className="text-voltron-400">Market:</span>
          <span className="flex items-center gap-1 font-semibold text-voltron-emerald">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block"></span>
            OPEN
          </span>
        </div>

        {/* Trading Mode */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-[11px] font-mono">
          <span className="text-voltron-400">Mode:</span>
          <span className="text-voltron-cyan font-bold">PAPER</span>
        </div>

        {/* Agent Status */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-850/80 border border-voltron-750/60 text-[11px] font-mono">
          <span className="text-voltron-400">Agent:</span>
          <span
            className={clsx(
              "flex items-center gap-1 font-semibold",
              agentStatus === "ACTIVE"
                ? "text-voltron-emerald"
                : agentStatus === "PAUSED"
                ? "text-voltron-amber"
                : "text-voltron-400"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                agentStatus === "ACTIVE"
                  ? "bg-voltron-emerald animate-pulse"
                  : agentStatus === "PAUSED"
                  ? "bg-voltron-amber"
                  : "bg-voltron-400"
              )}
            ></span>
            {agentStatus}
          </span>
        </div>
      </div>

      {/* Right: Account Equity, AI Copilot, Kill Switch & Tools */}
      <div className="flex items-center gap-3">
        {/* Account Equity */}
        <div className="flex flex-col items-end px-3 py-1 bg-voltron-850/60 border border-voltron-750/60 rounded-md">
          <span className="text-[9px] font-mono uppercase text-voltron-400 tracking-wider">
            Paper Account
          </span>
          <span className="text-xs font-mono font-bold text-white font-tabular">
            ${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </span>
        </div>

        {/* AI Copilot Trigger */}
        <button
          onClick={onOpenCopilot}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-gradient-to-r from-voltron-cyan/20 to-voltron-violet/20 hover:from-voltron-cyan/30 hover:to-voltron-violet/30 border border-voltron-cyan/40 text-xs font-mono font-semibold text-white shadow-cyan-glow transition-all"
        >
          <Sparkles className="w-3.5 h-3.5 text-voltron-cyan animate-spin-slow" />
          <span className="hidden sm:inline">AI Copilot</span>
        </button>

        {/* Kill Switch Trigger */}
        <button
          onClick={onOpenKillSwitch}
          className={clsx(
            "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono font-bold transition-all border",
            killSwitchActive
              ? "bg-voltron-rose text-white border-voltron-rose animate-pulse shadow-rose-glow"
              : "bg-voltron-rose/10 hover:bg-voltron-rose/20 text-voltron-rose border-voltron-rose/30"
          )}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span className="hidden md:inline">
            {killSwitchActive ? "KILL SWITCH ENGAGED" : "KILL SWITCH"}
          </span>
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-1.5 rounded-md text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-voltron-850 border border-voltron-700 rounded-lg shadow-terminal p-3 z-50 text-xs font-mono">
              <div className="flex items-center justify-between border-b border-voltron-750 pb-2 mb-2 font-bold text-white">
                <span>System Signals</span>
                <span className="text-[10px] text-voltron-cyan">LIVE</span>
              </div>
              <div className="space-y-2">
                <div className="p-2 rounded bg-voltron-900 border border-voltron-800">
                  <div className="text-voltron-cyan text-[11px] font-bold">Paper Order Executed</div>
                  <div className="text-[10px] text-voltron-300">SPY 45DTE Iron Condor @ $1.85 net credit.</div>
                </div>
                <div className="p-2 rounded bg-voltron-900 border border-voltron-800">
                  <div className="text-voltron-emerald text-[11px] font-bold">Risk Gates Verified</div>
                  <div className="text-[10px] text-voltron-300">All 7 safety thresholds evaluated [PASS].</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className="p-1.5 rounded-md text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
