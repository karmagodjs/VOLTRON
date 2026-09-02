"use client";

import { MarketData } from "@/types";
import clsx from "clsx";

interface VolatilityAlphaCardProps {
  market: MarketData;
}

export default function VolatilityAlphaCard({ market }: VolatilityAlphaCardProps) {
  const score = market.opportunity_score;
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-3">
        <div className="flex items-center">
          <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            Volatility Alpha
          </span>
        </div>

        <span
          className={clsx(
            "text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider",
            market.vol_signal === "IV EXPENSIVE"
              ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
              : market.vol_signal === "IV CHEAP"
              ? "bg-voltron-violet/15 text-voltron-violet border border-voltron-violet/30"
              : "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
          )}
        >
          {market.vol_signal}
        </span>
      </div>

      {/* Main Stats Grid & Visual Gauge */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Left: Score Gauge */}
        <div className="flex flex-col items-center justify-center p-3 rounded-lg bg-voltron-900 border border-voltron-800 relative">
          <div className="relative w-28 h-28 flex items-center justify-center">
            {/* SVG Arc Gauge */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                className="text-voltron-800"
              />
              <circle
                cx="50"
                cy="50"
                r="42"
                stroke="currentColor"
                strokeWidth="8"
                fill="transparent"
                strokeDasharray="283"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="text-voltron-cyan transition-all duration-1000 ease-out"
              />
            </svg>

            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-2xl font-mono font-bold text-white font-tabular">
                {score}
              </span>
              <span className="text-[9px] font-mono uppercase text-voltron-400">
                Alpha Score
              </span>
            </div>
          </div>

          <div className="mt-2 text-[10px] font-mono text-voltron-400 uppercase tracking-wider">
            HIGH EDGE REGIME
          </div>
        </div>

        {/* Right: Detailed Quantitative Breakdown */}
        <div className="space-y-2.5 font-mono text-xs">
          <div className="flex justify-between items-center p-2 rounded bg-voltron-900/60 border border-voltron-800">
            <span className="text-voltron-400">Implied Vol (IV)</span>
            <span className="font-bold text-voltron-cyan font-tabular">
              {market.implied_volatility.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-voltron-900/60 border border-voltron-800">
            <span className="text-voltron-400">Realized Vol (RV)</span>
            <span className="font-bold text-white font-tabular">
              {market.realized_volatility.toFixed(2)}%
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-voltron-900/60 border border-voltron-800">
            <span className="text-voltron-400">IV / RV Ratio</span>
            <span className="font-bold text-voltron-emerald font-tabular">
              {market.iv_rv_ratio.toFixed(2)}x
            </span>
          </div>

          <div className="flex justify-between items-center p-2 rounded bg-voltron-900/60 border border-voltron-800">
            <span className="text-voltron-400">Premium Spread</span>
            <span className="font-bold text-voltron-emerald font-tabular">
              +{market.iv_premium.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
