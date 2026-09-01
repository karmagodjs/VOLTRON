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
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Markets", href: "/markets", icon: TrendingUp },
  { name: "Options", href: "/options", icon: Layers },
  { name: "AI Agent", href: "/agent", icon: Bot, badge: "LIVE" },
  { name: "Strategies", href: "/strategies", icon: SlidersHorizontal },
  { name: "Backtest", href: "/backtest", icon: FlaskConical },
  { name: "Trades", href: "/trades", icon: History },
  { name: "Portfolio", href: "/portfolio", icon: Briefcase },
  { name: "Risk", href: "/risk", icon: ShieldAlert },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
  { name: "System", href: "/system", icon: Server },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 bg-voltron-950 border-r border-voltron-750/60 flex flex-col justify-between h-screen sticky top-0 select-none z-30">
      <div>
        {/* Logo Header */}
        <div className="h-14 px-4 flex items-center gap-3 border-b border-voltron-750/50">
          <Link href="/dashboard" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-lg bg-voltron-cyan/10 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow transition-transform group-hover:scale-105">
              <Zap className="w-4 h-4 fill-voltron-cyan" />
            </div>
            <div className="flex flex-col">
              <span className="font-mono font-bold tracking-wider text-sm text-white flex items-center gap-1.5">
                VOLTRON
                <span className="text-[9px] px-1 py-0.2 rounded bg-voltron-cyan/15 text-voltron-cyan font-mono border border-voltron-cyan/30">
                  v2.0
                </span>
              </span>
              <span className="text-[10px] text-voltron-400 tracking-wider font-mono uppercase">
                Volatility Alpha
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="p-2 space-y-0.5 overflow-y-auto max-h-[calc(100vh-140px)]">
          <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-wider text-voltron-400/80">
            Terminal Navigation
          </div>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                className={clsx(
                  "flex items-center justify-between px-3 py-2 rounded-md text-xs font-medium transition-all group",
                  isActive
                    ? "bg-voltron-cyan/10 text-voltron-cyan border-l-2 border-voltron-cyan font-semibold pl-2.5"
                    : "text-voltron-300 hover:text-white hover:bg-voltron-800/60"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={clsx(
                      "w-4 h-4 transition-colors",
                      isActive
                        ? "text-voltron-cyan"
                        : "text-voltron-400 group-hover:text-white"
                    )}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 animate-pulse">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3 border-t border-voltron-750/60 bg-voltron-900/60">
        <div className="flex items-center justify-between text-[11px] font-mono text-voltron-300 mb-1.5">
          <span className="text-voltron-400">Environment</span>
          <span className="text-voltron-cyan font-semibold">Alpaca Paper</span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-voltron-emerald opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-voltron-emerald"></span>
          </span>
          <span className="text-white font-medium">Engine Connected</span>
          <Activity className="w-3 h-3 text-voltron-emerald ml-auto" />
        </div>
      </div>
    </aside>
  );
}
