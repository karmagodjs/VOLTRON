"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Bell,
  Settings as SettingsIcon,
  Menu,
  AlertTriangle,
} from "lucide-react";
import clsx from "clsx";
import ThemeToggle from "@/components/common/ThemeToggle";
import MarketTickerStrip from "./MarketTickerStrip";

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
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <header className="h-14 bg-voltron-950/95 backdrop-blur border-b border-voltron-750/70 px-2 sm:px-3 flex items-center justify-between sticky top-0 z-20 font-mono text-xs max-w-full overflow-hidden">

      <div className="flex items-center flex-shrink-0 mr-1 sm:mr-2">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            aria-label="Open navigation"
            className="lg:hidden p-1.5 rounded bg-voltron-900 hover:bg-voltron-850 text-voltron-300 hover:text-white border border-voltron-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex-shrink-0 mr-1.5"
          >
            <Menu className="w-4 h-4" />
          </button>
        )}

        <Link
          href={`/dashboard?symbol=${currentSymbol}`}
          className="lg:hidden flex items-center gap-1.5 font-mono font-bold tracking-wider text-xs sm:text-sm text-white hover:text-voltron-cyan transition-colors flex-shrink-0 mr-1"
        >
          <span className="w-2 h-2 rounded-xs bg-voltron-cyan shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
          <span>VOLTRON</span>
        </Link>
      </div>

      <div className="flex-1 min-w-0 max-w-full overflow-hidden">
        <MarketTickerStrip
          currentSymbol={currentSymbol}
          onSelectSymbol={onSelectSymbol}
          marketPrice={marketPrice}
          marketStatus={marketStatus}
          agentStatus={agentStatus}
          symbols={symbols}
          showIndicators={true}
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0 ml-2">

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

        <button
          onClick={onOpenCopilot}
          className="px-2.5 py-1 sm:py-1.5 rounded bg-voltron-900 hover:bg-voltron-850 border border-voltron-750 hover:border-voltron-cyan/60 text-[11px] sm:text-xs font-mono font-bold text-voltron-cyan transition-colors flex-shrink-0"
        >
          COPILOT
        </button>

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

        <div className="flex-shrink-0">
          <ThemeToggle variant="icon" />
        </div>

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
