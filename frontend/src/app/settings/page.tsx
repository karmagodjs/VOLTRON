"use client";

import { useState } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState("••••••••••••••••••••••••");
  const [secretKey, setSecretKey] = useState("••••••••••••••••••••••••••••••••");
  const [geminiModel, setGeminiModel] = useState("gemini-3.6-flash");
  const [ivRvThreshold, setIvRvThreshold] = useState("1.40");
  const [maxTradeRisk, setMaxTradeRisk] = useState("1.0");
  const [maxDailyLoss, setMaxDailyLoss] = useState("2.0");
  const [maxExposure, setMaxExposure] = useState("30.0");
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <TerminalLayout>
      <div className="space-y-4 max-w-5xl font-mono text-xs">

        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center">
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON SYSTEM CONFIGURATION</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30 font-mono">
                  ACTIVE CONFIG
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                Alpaca Paper API keys, Gemini model routing, and institutional risk parameters
              </div>
            </div>
          </div>

          {saved && (
            <div className="flex items-center gap-1.5 text-xs font-mono text-voltron-emerald bg-voltron-emerald/15 px-3 py-1.5 rounded-lg border border-voltron-emerald/30 animate-in fade-in">
              <span>● Configuration saved successfully</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSave} className="space-y-4 font-mono text-xs">

          <div className="terminal-card p-5 border border-voltron-750/80 bg-voltron-850/40 space-y-4">
            <div className="border-b border-voltron-750 pb-2 text-white font-bold uppercase">
              <span>ALPACAPAPER TRADING ENVIRONMENT</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Alpaca API Key ID
                </label>
                <input
                  type="text"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-voltron-cyan font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Alpaca Secret Key
                </label>
                <input
                  type="password"
                  value={secretKey}
                  onChange={(e) => setSecretKey(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-voltron-cyan font-mono"
                />
              </div>
            </div>

            <div className="p-3 rounded-lg bg-voltron-900 border border-voltron-800 text-[11px] text-voltron-300 flex items-center justify-between">
              <span>Environment Base URL: <strong className="text-white">https://paper-api.alpaca.markets</strong></span>
              <span className="text-voltron-emerald font-bold">
                ● Paper Mode Locked
              </span>
            </div>
          </div>

          <div className="terminal-card p-5 border border-voltron-750/80 bg-voltron-850/40 space-y-4">
            <div className="border-b border-voltron-750 pb-2 text-white font-bold uppercase">
              <span>GEMINI AI VOLATILITY ANALYST CONFIGURATION</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Model Routing
                </label>
                <select
                  value={geminiModel}
                  onChange={(e) => setGeminiModel(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none focus:border-voltron-cyan font-mono"
                >
                  <option value="gemini-3.6-flash">gemini-3.6-flash (Ultra Fast Quant Reasoning)</option>
                  <option value="gemini-3.7-flash">gemini-3.7-flash (Deep Reasoning)</option>
                  <option value="gemini-1.5-pro">gemini-1.5-pro (Extended Context)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Minimum AI Confidence Required (%)
                </label>
                <input
                  type="number"
                  defaultValue={70}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="terminal-card p-5 border border-voltron-750/80 bg-voltron-850/40 space-y-4">
            <div className="border-b border-voltron-750 pb-2 text-white font-bold uppercase">
              <span>RISK ENGINE SAFETY THRESHOLDS</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Max Single Trade Risk (% Equity)
                </label>
                <input
                  type="text"
                  value={maxTradeRisk}
                  onChange={(e) => setMaxTradeRisk(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Daily Loss Circuit Breaker (%)
                </label>
                <input
                  type="text"
                  value={maxDailyLoss}
                  onChange={(e) => setMaxDailyLoss(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-voltron-400 uppercase block mb-1">
                  Max Portfolio Exposure (% Equity)
                </label>
                <input
                  type="text"
                  value={maxExposure}
                  onChange={(e) => setMaxExposure(e.target.value)}
                  className="w-full bg-voltron-950 border border-voltron-700 rounded-lg p-2.5 text-xs text-white outline-none font-mono"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-6 py-2 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-mono font-bold text-xs transition-colors"
            >
              <span>SAVE CONFIGURATION</span>
            </button>
          </div>
        </form>
      </div>
    </TerminalLayout>
  );
}
