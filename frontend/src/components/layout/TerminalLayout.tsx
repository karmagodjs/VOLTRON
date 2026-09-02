"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import TopNav from "./TopNav";
import AICopilotDrawer from "../copilot/AICopilotDrawer";
import KillSwitchModal from "../risk/KillSwitchModal";
import { fetchAccount, fetchMarket, toggleKillSwitch } from "@/lib/api";

import { useMarket } from "@/context/MarketContext";

interface TerminalLayoutProps {
  children: React.ReactNode;
}

export default function TerminalLayout({ children }: TerminalLayoutProps) {
  const { selectedSymbol, setSelectedSymbol, marketData } = useMarket();
  const [copilotOpen, setCopilotOpen] = useState(false);
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState(false);
  const [killSwitchActive, setKillSwitchActive] = useState(false);
  const [portfolioValue, setPortfolioValue] = useState<number | null>(100000.0);

  useEffect(() => {
    const loadTopBarData = async () => {
      try {
        const acc = await fetchAccount();
        setPortfolioValue(acc.portfolio_value);
        setKillSwitchActive(acc.kill_switch_active);
      } catch {
        // Fallback states handled in components
      }
    };

    loadTopBarData();
    const interval = setInterval(loadTopBarData, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleKillSwitch = async (active: boolean) => {
    const res = await toggleKillSwitch(active);
    setKillSwitchActive(res.success ? active : killSwitchActive);
  };

  const marketPrice = marketData?.price ?? null;
  const marketStatus = marketData?.market_status ?? "OPEN";

  return (
    <div className="flex min-h-screen bg-voltron-950 text-foreground">
      {/* Left Sidebar */}
      <Sidebar />

      {/* Main Terminal Workspace */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav
          currentSymbol={selectedSymbol}
          onSelectSymbol={(sym) => setSelectedSymbol(sym, true)}
          onOpenCopilot={() => setCopilotOpen(true)}
          onOpenKillSwitch={() => setKillSwitchModalOpen(true)}
          killSwitchActive={killSwitchActive}
          portfolioValue={portfolioValue}
          marketPrice={marketPrice}
          marketStatus={marketStatus}
          agentStatus={killSwitchActive ? "PAUSED" : "ACTIVE"}
          isConnected={true}
        />

        {/* Critical Emergency Banner if Kill Switch is active */}
        {killSwitchActive && (
          <div className="bg-voltron-rose text-white text-xs font-mono font-bold px-4 py-2 flex items-center justify-between animate-pulse">
            <span>⚠️ EMERGENCY KILL SWITCH ACTIVE — ALL TRADING & AUTONOMOUS SCANS HALTED</span>
            <button
              onClick={() => setKillSwitchModalOpen(true)}
              className="underline text-[11px] hover:text-voltron-100"
            >
              Reset Circuit
            </button>
          </div>
        )}

        <main className="flex-1 p-3.5 lg:p-4 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Global AI Copilot Slide-over */}
      <AICopilotDrawer
        isOpen={copilotOpen}
        onClose={() => setCopilotOpen(false)}
        currentSymbol={selectedSymbol}
      />

      {/* Global Kill Switch Modal */}
      <KillSwitchModal
        isOpen={killSwitchModalOpen}
        onClose={() => setKillSwitchModalOpen(false)}
        isActive={killSwitchActive}
        onToggle={handleToggleKillSwitch}
      />
    </div>
  );
}
