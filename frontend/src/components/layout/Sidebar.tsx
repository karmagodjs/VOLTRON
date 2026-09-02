"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";

import { useMarket } from "@/context/MarketContext";

const navItems = [
  { name: "OVERVIEW", href: "/dashboard" },
  { name: "MARKETS", href: "/markets" },
  { name: "OPTIONS", href: "/options" },
  { name: "AI AGENT", href: "/agent" },
  { name: "STRATEGIES", href: "/strategies" },
  { name: "BACKTEST", href: "/backtest" },
  { name: "TRADES", href: "/trades" },
  { name: "PORTFOLIO", href: "/portfolio" },
  { name: "RISK", href: "/risk" },
  { name: "ANALYTICS", href: "/analytics" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { selectedSymbol, getLinkWithSymbol } = useMarket();

  return (
    <aside className="w-52 flex-shrink-0 bg-voltron-950 border-r border-voltron-800 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Terminal Header */}
        <div className="h-12 px-4 flex items-center border-b border-voltron-800">
          <Link href={getLinkWithSymbol("/dashboard")} className="flex items-center group">
            <span className="font-mono font-bold tracking-wider text-sm text-white hover:text-voltron-cyan transition-colors">
              VOLTRON
            </span>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 pt-2.5 space-y-0.5 overflow-y-auto max-h-[calc(100vh-120px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.name}
                href={getLinkWithSymbol(item.href)}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 text-xs font-mono tracking-wider transition-colors",
                  isActive
                    ? "bg-voltron-900 text-voltron-cyan border-l-2 border-voltron-cyan font-bold"
                    : "text-voltron-400 hover:text-white hover:bg-voltron-900/60 border-l-2 border-transparent"
                )}
              >
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-voltron-800 bg-voltron-950 font-mono text-[10px]">
        <div className="flex items-center justify-between text-voltron-400 mb-1">
          <span className="uppercase tracking-wider">Mode</span>
          <span className="text-white font-bold uppercase">PAPER</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-voltron-850">
          <span className="text-voltron-400">Status</span>
          <span className="text-voltron-emerald font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block"></span>
            CONNECTED
          </span>
        </div>
      </div>
    </aside>
  );
}
