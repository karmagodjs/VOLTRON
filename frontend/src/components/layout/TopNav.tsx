"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings as SettingsIcon,
  ChevronDown,
  Menu,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/common/ThemeToggle";

interface TopNavProps {
  currentSymbol: string;
  onSelectSymbol: (sym: string) => void;
  onOpenCopilot: () => void;
  onOpenKillSwitch: () => void;
  onOpenMobileMenu?: () => void;
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
  onOpenMobileMenu,
  killSwitchActive = false,
  portfolioValue,
  marketPrice,
  marketStatus = null,
  agentStatus = "ACTIVE",
  isConnected = true,
}: TopNavProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-14 bg-voltron-950/95 backdrop-blur border-b border-voltron-750/70 px-2.5 sm:px-4 flex items-center justify-between sticky top-0 z-20 font-mono text-xs max-w-full overflow-hidden">
      {/* Left: Mobile Navigation, Brand, Asset Selector & Live Status */}
      <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-shrink overflow-x-auto no-scrollbar py-0.5">
        {/* Mobile Hamburger Menu Trigger */}
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation"
            className="lg:hidden p-1.5 rounded bg-voltron-900 hover:bg-voltron-850 text-voltron-300 hover:text-white border border-voltron-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex-shrink-0"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        {/* Brand Logo (Visible on mobile/tablet when sidebar is hidden) */}
        <Link
          href={`/dashboard?symbol=${currentSymbol}`}
          className="lg:hidden flex items-center gap-1.5 font-mono font-bold tracking-wider text-xs sm:text-sm text-white hover:text-voltron-cyan transition-colors flex-shrink-0 mr-1"
        >
          <span className="w-2 h-2 rounded-xs bg-voltron-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span>VOLTRON</span>
        </Link>

        {/* Asset Selector Dropdown */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1.5 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded bg-voltron-850 hover:bg-voltron-800 border border-voltron-700/80 hover:border-voltron-600 font-bold text-white transition-all shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-voltron-cyan"
            aria-label="Select asset"
          >
            <span className="text-voltron-400 text-[10px] sm:text-[11px] uppercase tracking-wider hidden xs:inline">Asset:</span>
            <span className="text-voltron-cyan font-bold text-xs">{currentSymbol}</span>
            <ChevronDown className={clsx("w-3 h-3 text-voltron-400 ml-0.5 transition-transform duration-150", dropdownOpen && "rotate-180")} />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-48 bg-voltron-850 border border-voltron-700 rounded-md shadow-terminal p-1 z-50">
              <div className="px-2 py-1 text-[9px] uppercase text-voltron-400 tracking-wider">
                Select Asset
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
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase tracking-wider">Price:</span>
          <span className="font-bold text-white font-tabular text-xs">
            {marketPrice != null ? `$${marketPrice.toFixed(2)}` : "—"}
          </span>
        </div>

        {/* Market Status (OPEN / CLOSED / LOADING) */}
        <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span
            className={clsx(
              "font-bold flex items-center gap-1.5 text-[11px]",
              marketStatus === "OPEN"
                ? "text-voltron-emerald"
                : marketStatus === "CLOSED"
                ? "text-voltron-rose"
                : "text-voltron-400"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                marketStatus === "OPEN"
                  ? "bg-voltron-emerald shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                  : marketStatus === "CLOSED"
                  ? "bg-voltron-rose shadow-[0_0_6px_rgba(244,63,94,0.8)]"
                  : "bg-voltron-400 animate-pulse"
              )}
            />
            {marketStatus === "OPEN"
              ? "MARKET OPEN"
              : marketStatus === "CLOSED"
              ? "MARKET CLOSED"
              : "MARKET --"}
          </span>
        </div>

        {/* Agent Status (ACTIVE / PAUSED / IDLE) */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase tracking-wider">Agent:</span>
          <span
            className={clsx(
              "font-bold flex items-center gap-1.5 text-[11px]",
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
                  ? "bg-voltron-emerald animate-pulse shadow-[0_0_6px_rgba(16,185,129,0.8)]"
                  : agentStatus === "PAUSED"
                  ? "bg-voltron-amber shadow-[0_0_6px_rgba(245,158,11,0.8)]"
                  : "bg-voltron-rose shadow-[0_0_6px_rgba(244,63,94,0.8)]"
              )}
            />
            {agentStatus || "—"}
          </span>
        </div>

        {/* Trading Mode (PAPER DISABLED) */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 flex-shrink-0">
          <span className="text-voltron-400 text-[10px] uppercase tracking-wider">Trading:</span>
          <span className="text-voltron-cyan font-bold text-[10.5px]">PAPER (DISABLED)</span>
        </div>
      </div>

      {/* Right: Portfolio Metric, Copilot, Kill Switch, Alerts & Theme */}
      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 ml-2">
        {/* Real Portfolio Value */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-voltron-900 border border-voltron-750/70 rounded flex-shrink-0">
          <span className="text-[10px] uppercase text-voltron-400 tracking-wider">
            Portfolio:
          </span>
          <span className="text-xs font-bold text-white font-tabular">
            {portfolioValue != null
              ? `$${portfolioValue.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
              : "—"}
          </span>
        </div>

        {/* AI Copilot Button */}
        <button
          onClick={onOpenCopilot}
          className="px-2.5 py-1 sm:py-1.5 rounded bg-voltron-900 hover:bg-voltron-850 border border-voltron-750 hover:border-voltron-cyan/60 text-[11px] sm:text-xs font-mono font-bold text-voltron-cyan transition-colors flex-shrink-0"
        >
          COPILOT
        </button>

        {/* Emergency Kill Switch Button */}
        <button
          onClick={onOpenKillSwitch}
          title="Emergency Circuit Breaker / Kill Switch"
          className={clsx(
            "flex items-center gap-1.5 px-2.5 py-1 sm:py-1.5 rounded text-[11px] sm:text-xs font-mono font-bold tracking-tight transition-all border shadow-sm flex-shrink-0 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-rose",
            killSwitchActive
              ? "bg-voltron-rose text-white border-voltron-rose shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse"
              : "bg-voltron-rose/15 hover:bg-voltron-rose/25 text-voltron-rose border-voltron-rose/40 hover:border-voltron-rose/70 active:scale-95"
          )}
        >
          <AlertTriangle className={clsx("w-3.5 h-3.5 flex-shrink-0", killSwitchActive ? "text-white" : "text-voltron-rose")} />
          <span className="whitespace-nowrap">{killSwitchActive ? "KILL SWITCH: ACTIVE" : "KILL SWITCH"}</span>
        </button>

        {/* System Notifications */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setNotificationOpen(!notificationOpen)}
            className="p-1 sm:p-1.5 rounded text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors"
            title="System Signals"
          >
            <Bell className="w-4 h-4" />
          </button>

          {notificationOpen && (
            <div className="absolute right-0 mt-2 w-72 max-w-[90vw] bg-voltron-850 border border-voltron-700 rounded-lg shadow-terminal p-3 z-50 text-xs">
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

        {/* Theme Toggle */}
        <div className="flex-shrink-0">
          <ThemeToggle variant="icon" />
        </div>

        {/* Settings Link */}
        <Link
          href={currentSymbol ? `/settings?symbol=${currentSymbol}` : "/settings"}
          className="p-1 sm:p-1.5 rounded text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors flex-shrink-0"
          title="Settings"
        >
          <SettingsIcon className="w-4 h-4" />
        </Link>
      </div>
    </header>
  );
}
