"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
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

interface SidebarProps {
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export default function Sidebar({ mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { getLinkWithSymbol } = useMarket();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen && onMobileClose) {
        onMobileClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [mobileOpen, onMobileClose]);

  const navContent = (
    <div className="flex flex-col justify-between h-full">
      <div>

        <div className="h-14 px-4 flex items-center justify-between border-b border-voltron-800">
          <Link
            href={getLinkWithSymbol("/dashboard")}
            onClick={() => onMobileClose?.()}
            className="flex items-center group"
          >
            <span className="font-mono font-bold tracking-wider text-sm text-white group-hover:text-voltron-cyan transition-colors">
              VOLTRON
            </span>
          </Link>

          {onMobileClose && (
            <button
              onClick={onMobileClose}
              aria-label="Close navigation"
              className="lg:hidden p-1.5 rounded text-voltron-400 hover:text-white hover:bg-voltron-800 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        <nav className="p-2 pt-3 space-y-1 overflow-y-auto max-h-[calc(100vh-130px)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === "/dashboard" && pathname === "/");

            return (
              <Link
                key={item.name}
                href={getLinkWithSymbol(item.href)}
                onClick={() => onMobileClose?.()}
                className={clsx(
                  "flex items-center justify-between px-3.5 py-2.5 rounded-sm text-xs font-mono tracking-wider transition-colors min-h-[40px]",
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

      <div className="p-3.5 border-t border-voltron-800 bg-voltron-950 font-mono text-[10px]">
        <div className="flex items-center justify-between text-voltron-400 mb-1.5">
          <span className="uppercase tracking-wider">Mode</span>
          <span className="text-white font-bold uppercase">PAPER</span>
        </div>
        <div className="flex items-center justify-between pt-1.5 border-t border-voltron-850">
          <span className="text-voltron-400">Status</span>
          <span className="text-voltron-emerald font-bold flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
            CONNECTED
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <>

      <aside className="hidden lg:flex w-52 flex-shrink-0 bg-voltron-950 border-r border-voltron-800 flex-col justify-between h-screen sticky top-0 select-none z-30">
        {navContent}
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">

          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
            onClick={onMobileClose}
            aria-hidden="true"
          />

          <aside
            role="dialog"
            aria-label="Mobile Navigation"
            aria-modal="true"
            className="relative w-64 max-w-[85vw] bg-voltron-950 border-r border-voltron-800 shadow-2xl z-50 flex flex-col justify-between h-full select-none animate-in slide-in-from-left duration-200"
          >
            {navContent}
          </aside>
        </div>
      )}
    </>
  );
}
