"use client";

import Link from "next/link";

export default function LandingPage() {
  const pipelineStages = [
    { title: "MARKET DATA", sub: "SIP Real-Time Feed" },
    { title: "VOLATILITY ENGINE", sub: "IV/RV Spread & Skew" },
    { title: "AI ANALYST", sub: "Gemini 3.6 Reasoning" },
    { title: "STRATEGY ENGINE", sub: "Defined-Risk Selection" },
    { title: "RISK ENGINE", sub: "7-Gate Safety Verification" },
    { title: "EXECUTION", sub: "Alpaca Paper Multi-Leg" },
    { title: "MONITORING", sub: "Dynamic Take-Profit & Stop" },
  ];

  return (
    <div className="min-h-screen bg-voltron-950 text-foreground flex flex-col justify-between selection:bg-voltron-cyan/20 selection:text-voltron-cyan relative overflow-hidden font-mono">
      {/* Header */}
      <header className="h-14 px-6 sm:px-10 flex items-center justify-between border-b border-voltron-800 bg-voltron-950 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-sm text-white">
            VOLTRON
          </span>
          <span className="text-[9px] px-1.5 py-0.2 rounded bg-voltron-900 text-voltron-400 border border-voltron-800 uppercase tracking-wider">
            VOLATILITY ALPHA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-voltron-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">Terminal</Link>
          <Link href="/markets" className="hover:text-white transition-colors">Volatility</Link>
          <Link href="/options" className="hover:text-white transition-colors">Options Chain</Link>
          <Link href="/agent" className="hover:text-white transition-colors">AI Agent</Link>
          <Link href="/risk" className="hover:text-white transition-colors">Risk Engine</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-800 text-[11px] text-voltron-400">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block"></span>
            Paper Environment
          </div>
          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 text-xs font-bold transition-colors"
          >
            <span>Launch Terminal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-14 sm:py-20 max-w-5xl mx-auto text-center">
        <div className="inline-block px-3 py-1 rounded bg-voltron-900 border border-voltron-800 text-[10px] text-voltron-cyan font-bold tracking-wider uppercase mb-5">
          AUTONOMOUS OPTIONS QUANT TRADING TERMINAL
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white mb-3">
          VOLTRON — VOLATILITY ALPHA
        </h1>

        <p className="text-sm sm:text-base text-voltron-300 max-w-2xl mx-auto mb-8 leading-relaxed font-sans">
          An autonomous intelligence layer that analyzes volatility spreads, selects defined-risk options strategies, enforces institutional risk controls, and executes paper trades through Alpaca.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-bold text-xs transition-colors"
          >
            Launch Terminal
          </Link>

          <Link
            href="/agent"
            className="px-5 py-2.5 rounded bg-voltron-900 hover:bg-voltron-850 text-white font-semibold text-xs border border-voltron-800 transition-colors"
          >
            View AI Agent
          </Link>

          <Link
            href="/strategies"
            className="px-5 py-2.5 rounded bg-voltron-900 hover:bg-voltron-850 text-white font-semibold text-xs border border-voltron-800 transition-colors"
          >
            Explore Strategies
          </Link>
        </div>

        {/* Hero Interactive Pipeline Diagram */}
        <div className="p-4 rounded-lg border border-voltron-800 bg-voltron-900/80 max-w-5xl mx-auto text-left">
          <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-4 text-xs">
            <span className="text-white font-bold tracking-wider uppercase">
              AUTONOMOUS EXECUTION PIPELINE
            </span>
            <span className="text-voltron-emerald text-[11px] font-bold">
              ● 7 OF 7 NODES ACTIVE
            </span>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
            {pipelineStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded bg-voltron-950 border border-voltron-850 flex flex-col justify-between text-left"
              >
                <div>
                  <span className="text-[9px] text-voltron-500 block mb-0.5 font-tabular">
                    0{idx + 1}
                  </span>
                  <span className="text-[11px] font-bold text-white block leading-tight mb-1">
                    {stage.title}
                  </span>
                </div>
                <div className="text-[9px] text-voltron-400 mt-2 border-t border-voltron-900 pt-1">
                  {stage.sub}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="px-6 py-12 max-w-5xl mx-auto border-t border-voltron-800 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left">
          <div className="p-4 rounded-lg bg-voltron-900/60 border border-voltron-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Quant Volatility Alpha
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed font-sans">
              Calculates 20-day realized volatility from SIP bar data and compares it directly with real-time implied volatility skew to quantify edge (IV/RV &gt; 1.40x).
            </p>
          </div>

          <div className="p-4 rounded-lg bg-voltron-900/60 border border-voltron-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              Institutional AI Reasoning
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed font-sans">
              Gemini 3.6 synthesizes multi-timeframe vol surfaces, market regime drifts, and macro conditions to articulate explainable hypotheses before any trade enters the queue.
            </p>
          </div>

          <div className="p-4 rounded-lg bg-voltron-900/60 border border-voltron-800">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
              7-Gate Risk Architecture
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed font-sans">
              Every paper execution is strictly vetted against Max 1% Trade Risk, 2% Daily Loss Circuit Breakers, 30% Aggregate Exposure, and an armed Emergency Kill Switch.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-voltron-800 bg-voltron-950 text-xs text-voltron-400 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-white font-bold">
          <span>VOLTRON TRADING TERMINAL</span>
        </div>
        <div>
          Alpaca Paper Trading Environment &bull; Real money trading disabled
        </div>
        <div className="text-voltron-400">
          Autonomous Options Operations
        </div>
      </footer>
    </div>
  );
}
