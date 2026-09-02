"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  TrendingUp,
  Layers,
  Bot,
  SlidersHorizontal,
  FlaskConical,
  History,
  Briefcase,
  ShieldAlert,
  BarChart3,
  Server,
  Settings,
  Zap,
  Activity,
} from "lucide-react";
import clsx from "clsx";

const navItems = [
  { name: "OVERVIEW", href: "/dashboard", icon: LayoutDashboard },
  { name: "MARKETS", href: "/markets", icon: TrendingUp },
  { name: "OPTIONS", href: "/options", icon: Layers },
  { name: "AI AGENT", href: "/agent", icon: Bot, badge: "LIVE" },
  { name: "STRATEGIES", href: "/strategies", icon: SlidersHorizontal },
  { name: "BACKTEST", href: "/backtest", icon: FlaskConical },
  { name: "TRADES", href: "/trades", icon: History },
  { name: "PORTFOLIO", href: "/portfolio", icon: Briefcase },
  { name: "RISK", href: "/risk", icon: ShieldAlert },
  { name: "ANALYTICS", href: "/analytics", icon: BarChart3 },
  { name: "SYSTEM", href: "/system", icon: Server },
  { name: "SETTINGS", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-56 flex-shrink-0 bg-voltron-950 border-r border-voltron-750/70 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Terminal Header */}
        <div className="h-14 px-4 flex items-center gap-2.5 border-b border-voltron-750/70">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-7 h-7 rounded bg-voltron-cyan/15 border border-voltron-cyan/40 flex items-center justify-center text-voltron-cyan shadow-cyan-glow transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 fill-voltron-cyan" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-black tracking-wider text-xs text-white flex items-center gap-1.5">
                VOLTRON
              </span>
              <span className="text-[9px] text-voltron-cyan font-mono uppercase tracking-widest font-semibold">
                VOLATILITY ALPHA
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-2.5 py-1 text-[9px] font-mono uppercase tracking-widest text-voltron-400">
            Terminal Nav
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] font-mono tracking-wide transition-all group",
                  isActive
                    ? "bg-voltron-cyan/10 text-voltron-cyan border-l-2 border-voltron-cyan font-bold pl-2"
                    : "text-voltron-300 hover:text-white hover:bg-voltron-850"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className={clsx(
                      "w-3.5 h-3.5 transition-colors",
                      isActive ? "text-voltron-cyan" : "text-voltron-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[8px] font-mono px-1 py-0.2 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 font-bold animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Panel */}
      <div className="p-3 border-t border-voltron-750/70 bg-voltron-900/80 font-mono text-[10px]">
        <div className="flex items-center justify-between text-voltron-400 mb-1">
          <span className="uppercase tracking-wider">Trading Mode</span>
          <span className="text-voltron-cyan font-bold uppercase">PAPER TRADING</span>
        </div>
        <div className="flex items-center justify-between pt-1 border-t border-voltron-800">
          <span className="text-voltron-400">Status</span>
          <span className="text-voltron-emerald font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald animate-pulse inline-block"></span>
            CONNECTED
          </span>
        </div>
      </div>
    </aside>
  );
}
