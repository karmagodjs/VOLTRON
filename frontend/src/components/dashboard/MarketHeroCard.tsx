"use client";

import { MarketData } from "@/types";
import clsx from "clsx";

interface MarketHeroCardProps {
  market: MarketData;
}

export default function MarketHeroCard({ market }: MarketHeroCardProps) {
  const isPositive = market.change >= 0;

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/50 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-4">

        <div className="flex items-center">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-bold font-mono text-white tracking-tight">
                {market.symbol}
              </span>
              <span className="text-xs text-voltron-400 font-mono">
                {market.name}
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-voltron-800 text-voltron-300 border border-voltron-700">
                {market.market_regime}
              </span>
            </div>

            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-2xl font-mono font-bold text-white font-tabular">
                ${market.price.toFixed(2)}
              </span>
              <span
                className={clsx(
                  "text-xs font-mono font-bold font-tabular px-2 py-0.5 rounded",
                  isPositive
                    ? "text-voltron-emerald bg-voltron-emerald/15 border border-voltron-emerald/30"
                    : "text-voltron-rose bg-voltron-rose/15 border border-voltron-rose/30"
                )}
              >
                {isPositive ? "+" : ""}
                {market.change.toFixed(2)} ({isPositive ? "+" : ""}
                {market.change_percent.toFixed(2)}%)
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 flex-1 max-w-2xl">
          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-750">
            <span className="text-[10px] font-mono uppercase text-voltron-400 block">
              Realized Vol (20D)
            </span>
            <span className="text-sm font-mono font-bold text-white font-tabular">
              {market.realized_volatility.toFixed(2)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-750">
            <span className="text-[10px] font-mono uppercase text-voltron-400 block">
              Implied Vol (IV)
            </span>
            <span className="text-sm font-mono font-bold text-voltron-cyan font-tabular">
              {market.implied_volatility.toFixed(2)}%
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-750">
            <span className="text-[10px] font-mono uppercase text-voltron-400 block">
              IV / RV Spread
            </span>
            <span className="text-sm font-mono font-bold text-voltron-emerald font-tabular flex items-center gap-1">
              {market.iv_rv_ratio.toFixed(2)}x
              <span className="text-[10px] text-voltron-400 font-normal">
                (+{market.iv_premium.toFixed(1)}%)
              </span>
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-voltron-900/80 border border-voltron-750">
            <span className="text-[10px] font-mono uppercase text-voltron-400 block">
              Alpha Score
            </span>
            <span className="text-sm font-mono font-bold text-voltron-cyan font-tabular block">
              {market.opportunity_score}
              <span className="text-[10px] text-voltron-400 font-normal"> / 100</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
