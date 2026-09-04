"use client";

import React, { useRef, useState } from "react";
import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { SUPPORTED_ASSETS } from "@/lib/marketData";

export interface MarketTickerStripProps {
  currentSymbol: string;
  onSelectSymbol: (symbol: string) => void;
  marketPrice?: number | null;
  marketStatus?: string | null;
  agentStatus?: "ACTIVE" | "IDLE" | "STOPPED" | "PAUSED" | null;
  symbols?: Array<{ symbol: string; label: string }>;
  showIndicators?: boolean;
}

const DEFAULT_SYMBOLS = [
  { symbol: "SPY", label: "S&P 500 ETF" },
  { symbol: "QQQ", label: "Nasdaq 100 ETF" },
  { symbol: "IWM", label: "Russell 2000 ETF" },
  { symbol: "NVDA", label: "NVIDIA Corp" },
  { symbol: "AAPL", label: "Apple Inc" },
  { symbol: "TSLA", label: "Tesla Inc" },
  { symbol: "MSFT", label: "Microsoft Corp" },
  { symbol: "AMZN", label: "Amazon.com Inc" },
];

export default function MarketTickerStrip({
  currentSymbol,
  onSelectSymbol,
  marketPrice,
  marketStatus = null,
  agentStatus = "ACTIVE",
  symbols = DEFAULT_SYMBOLS,
  showIndicators = true,
}: MarketTickerStripProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollOffset = direction === "left" ? -180 : 180;
      scrollRef.current.scrollBy({ left: scrollOffset, behavior: "smooth" });
    }
  };

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (scrollRef.current && e.deltaY) {
      scrollRef.current.scrollLeft += e.deltaY;
    }
  };

  return (
    <div className="relative w-full max-w-full min-w-0 box-border overflow-hidden select-none flex items-center font-mono text-xs">
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-r from-voltron-950 via-voltron-950/85 to-transparent z-10" />

      <button
        type="button"
        onClick={() => handleScroll("left")}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded flex items-center justify-center text-voltron-400 hover:text-voltron-cyan bg-voltron-950/90 hover:bg-voltron-850 border border-voltron-800 text-[11px] font-mono leading-none transition-colors shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-voltron-cyan cursor-pointer"
        aria-label="Scroll ticker left"
        tabIndex={-1}
      >
        ‹
      </button>

      <div
        ref={scrollRef}
        onWheel={handleWheel}
        className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-hidden box-border no-scrollbar flex items-center gap-1.5 sm:gap-2 px-7 sm:px-8 py-0.5"
      >
        <div className="relative flex-shrink-0">
          <button
            type="button"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-1 px-2 py-1 rounded bg-voltron-850 hover:bg-voltron-800 border border-voltron-700/80 hover:border-voltron-600 font-bold text-white transition-all shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-voltron-cyan"
            aria-label="Select asset"
          >
            <span className="text-voltron-400 text-[10px] uppercase tracking-wider hidden xs:inline">
              Asset:
            </span>
            <span className="text-voltron-cyan font-bold text-xs">{currentSymbol}</span>
            <ChevronDown
              className={clsx(
                "w-3 h-3 text-voltron-400 transition-transform duration-150",
                dropdownOpen && "rotate-180"
              )}
            />
          </button>

          {dropdownOpen && (
            <div className="absolute left-0 mt-1.5 w-48 bg-voltron-850 border border-voltron-700 rounded-md shadow-terminal p-1 z-50">
              <div className="px-2 py-1 text-[9px] uppercase text-voltron-400 tracking-wider">
                Select Asset
              </div>
              {symbols.map((item) => (
                <button
                  key={item.symbol}
                  type="button"
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
                  <span className="text-[10px] text-voltron-400">{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {symbols.map((item) => {
          const isSelected = currentSymbol === item.symbol;
          const asset = SUPPORTED_ASSETS[item.symbol];
          const price = isSelected && marketPrice != null ? marketPrice : asset?.price;
          const changePct = asset?.change_percent;
          const isPositive = (changePct ?? 0) >= 0;

          return (
            <button
              key={item.symbol}
              type="button"
              onClick={() => onSelectSymbol(item.symbol)}
              className={clsx(
                "flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded text-xs font-mono transition-all whitespace-nowrap cursor-pointer border select-none",
                isSelected
                  ? "bg-voltron-cyan/15 text-voltron-cyan border-voltron-cyan/50 shadow-[0_0_8px_rgba(0,240,255,0.15)] font-bold"
                  : "bg-voltron-900/90 hover:bg-voltron-850 text-voltron-300 hover:text-white border-voltron-800 hover:border-voltron-700 font-semibold"
              )}
              title={`${item.symbol} — ${item.label}`}
            >
              {isSelected && (
                <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse shadow-[0_0_6px_rgba(0,240,255,0.8)] flex-shrink-0" />
              )}
              <span className={clsx(isSelected ? "text-voltron-cyan font-bold" : "text-white")}>
                {item.symbol}
              </span>
              {price != null && (
                <span className="font-tabular text-[11px] text-voltron-200">
                  ${price.toFixed(2)}
                </span>
              )}
              {changePct != null && (
                <span
                  className={clsx(
                    "text-[10px] font-tabular font-bold",
                    isPositive ? "text-voltron-emerald" : "text-voltron-rose"
                  )}
                >
                  {isPositive ? "+" : ""}
                  {changePct.toFixed(1)}%
                </span>
              )}
            </button>
          );
        })}

        {showIndicators && (
          <>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-750/70 flex-shrink-0">
              <span className="text-voltron-400 text-[10px] uppercase tracking-wider">Spot:</span>
              <span className="font-bold text-white font-tabular text-xs">
                {marketPrice != null ? `$${marketPrice.toFixed(2)}` : "—"}
              </span>
            </div>

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
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
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
                    "w-1.5 h-1.5 rounded-full flex-shrink-0",
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

            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 flex-shrink-0">
              <span className="text-voltron-400 text-[10px] uppercase tracking-wider">Trading:</span>
              <span className="text-voltron-cyan font-bold text-[10.5px]">PAPER (DISABLED)</span>
            </div>
          </>
        )}
      </div>

      <button
        type="button"
        onClick={() => handleScroll("right")}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-20 w-5 h-5 rounded flex items-center justify-center text-voltron-400 hover:text-voltron-cyan bg-voltron-950/90 hover:bg-voltron-850 border border-voltron-800 text-[11px] font-mono leading-none transition-colors shadow-sm focus:outline-none focus-visible:ring-1 focus-visible:ring-voltron-cyan cursor-pointer"
        aria-label="Scroll ticker right"
        tabIndex={-1}
      >
        ›
      </button>

      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 sm:w-10 bg-gradient-to-l from-voltron-950 via-voltron-950/85 to-transparent z-10" />
    </div>
  );
}
