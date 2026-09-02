"use client";

import Link from "next/link";
import {
  Bot,
  Layers,
  ShieldCheck,
  BarChart3,
  ArrowRight,
  TrendingUp,
  SlidersHorizontal,
  Lock,
  Cpu,
  Activity,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const pipelineStages = [
    { title: "MARKET DATA", sub: "SIP Real-Time Feed", color: "cyan" },
    { title: "VOLATILITY ENGINE", sub: "IV/RV Spread & Skew", color: "cyan" },
    { title: "AI ANALYST", sub: "Gemini 3.6 Reasoning", color: "emerald" },
    { title: "STRATEGY ENGINE", sub: "Defined-Risk Selection", color: "cyan" },
    { title: "RISK ENGINE", sub: "7-Gate Safety Verification", color: "emerald" },
    { title: "EXECUTION", sub: "Alpaca Paper Multi-Leg", color: "cyan" },
    { title: "MONITORING", sub: "Dynamic Take-Profit & Stop", color: "emerald" },
  ];

  return (
    <div className="min-h-screen bg-voltron-950 text-foreground flex flex-col justify-between selection:bg-voltron-cyan/20 selection:text-voltron-cyan grid-bg relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-voltron-cyan/10 to-transparent blur-3xl pointer-events-none -z-10"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-voltron-violet/5 blur-3xl pointer-events-none -z-10"></div>

      {/* Header */}
      <header className="h-16 px-6 sm:px-12 flex items-center justify-between border-b border-voltron-750/50 bg-voltron-950/60 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold tracking-wider text-base text-white">
            VOLTRON
          </span>
          <span className="text-[10px] px-1.5 py-0.2 rounded bg-voltron-cyan/15 text-voltron-cyan font-mono border border-voltron-cyan/30">
            VOLATILITY ALPHA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs font-mono text-voltron-300">
          <Link href="/dashboard" className="hover:text-white transition-colors">Terminal</Link>
          <Link href="/markets" className="hover:text-white transition-colors">Volatility</Link>
          <Link href="/options" className="hover:text-white transition-colors">Options Chain</Link>
          <Link href="/agent" className="hover:text-white transition-colors">AI Agent</Link>
          <Link href="/risk" className="hover:text-white transition-colors">Risk Engine</Link>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-850 border border-voltron-750 text-[11px] font-mono text-voltron-300">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block"></span>
            Paper Environment
          </div>
          <Link
            href="/dashboard"
            className="px-4 py-2 rounded-lg bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 text-xs font-mono font-bold shadow-cyan-glow transition-all flex items-center gap-1.5"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-6 py-16 sm:py-24 max-w-6xl mx-auto text-center relative">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-voltron-850/80 border border-voltron-cyan/30 text-xs font-mono text-voltron-cyan mb-6 shadow-sm">
          <Activity className="w-3.5 h-3.5 text-voltron-cyan" />
          <span>AUTONOMOUS OPTIONS QUANT TRADING TERMINAL</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-mono font-black tracking-tight text-white mb-4">
          VOLTRON <span className="text-voltron-cyan">—</span> VOLATILITY ALPHA
        </h1>

        <p className="text-lg sm:text-xl font-mono text-voltron-300 max-w-3xl mx-auto mb-8 leading-relaxed font-light">
          An autonomous intelligence layer that analyzes volatility spreads, selects defined-risk options strategies, enforces institutional risk controls, and executes paper trades through Alpaca.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
          <Link
            href="/dashboard"
            className="px-6 py-3.5 rounded-lg bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-mono font-bold text-sm shadow-cyan-glow transition-all flex items-center gap-2"
          >
            <span>Launch Terminal</span>
          </Link>

          <Link
            href="/agent"
            className="px-6 py-3.5 rounded-lg bg-voltron-850 hover:bg-voltron-800 text-white font-mono font-semibold text-sm border border-voltron-700 transition-colors flex items-center gap-2"
          >
            <Bot className="w-4 h-4 text-voltron-cyan" />
            <span>View AI Agent</span>
          </Link>

          <Link
            href="/strategies"
            className="px-6 py-3.5 rounded-lg bg-voltron-850 hover:bg-voltron-800 text-white font-mono font-semibold text-sm border border-voltron-700 transition-colors flex items-center gap-2"
          >
            <SlidersHorizontal className="w-4 h-4 text-voltron-emerald" />
            <span>Explore Strategies</span>
          </Link>
        </div>

        {/* Hero Interactive Pipeline Diagram */}
        <div className="terminal-card p-6 border border-voltron-700/80 bg-voltron-900/80 shadow-2xl backdrop-blur max-w-5xl mx-auto">
          <div className="flex items-center justify-between border-b border-voltron-750 pb-3 mb-6 font-mono text-xs">
            <div className="flex items-center gap-2 text-white font-bold">
              <Cpu className="w-4 h-4 text-voltron-cyan" />
              <span>LIVE AUTONOMOUS EXECUTION PIPELINE</span>
            </div>
            <span className="text-voltron-emerald flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-voltron-emerald animate-ping"></span>
              7 OF 7 NODES ACTIVE
            </span>
          </div>

          {/* Flow Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {pipelineStages.map((stage, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-voltron-950 border border-voltron-800 flex flex-col justify-between text-left hover:border-voltron-cyan/40 transition-colors group"
              >
                <div>
                  <span className="text-[9px] font-mono text-voltron-400 block mb-1 font-tabular">
                    STAGE 0{idx + 1}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-white group-hover:text-voltron-cyan transition-colors block leading-tight mb-1">
                    {stage.title}
                  </span>
                </div>
                <div className="text-[9px] font-mono text-voltron-400 mt-2 border-t border-voltron-850 pt-1.5 flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5 text-voltron-emerald" />
                  <span>{stage.sub}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="px-6 py-16 max-w-6xl mx-auto border-t border-voltron-750/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono">
          <div className="p-6 rounded-xl bg-voltron-900/50 border border-voltron-750/70 hover:border-voltron-cyan/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/10 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan mb-4">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Quant Volatility Alpha
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed">
              Calculates 20-day realized volatility from high-precision SIP bar data and compares it directly with real-time Implied Volatility skew to quantify edge (IV/RV &gt; 1.40x).
            </p>
          </div>

          <div className="p-6 rounded-xl bg-voltron-900/50 border border-voltron-750/70 hover:border-voltron-cyan/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-voltron-emerald/10 border border-voltron-emerald/30 flex items-center justify-center text-voltron-emerald mb-4">
              <Bot className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              Palantir-Grade AI Reasoning
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed">
              Gemini 3.6 synthesizes multi-timeframe vol surfaces, market regime drifts, and macro conditions to articulate explainable hypotheses before any trade enters the queue.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-voltron-900/50 border border-voltron-750/70 hover:border-voltron-cyan/40 transition-all">
            <div className="w-10 h-10 rounded-lg bg-voltron-rose/10 border border-voltron-rose/30 flex items-center justify-center text-voltron-rose mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">
              7-Gate Institutional Risk
            </h3>
            <p className="text-xs text-voltron-300 leading-relaxed">
              Every paper execution is strictly vetted against Max 1% Trade Risk, 2% Daily Loss Circuit Breakers, 30% Aggregate Exposure, and an armed Emergency Kill Switch.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-6 border-t border-voltron-750/60 bg-voltron-950 text-xs font-mono text-voltron-400 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-white font-bold">
          <span>VOLTRON TRADING TERMINAL</span>
        </div>
        <div>
          Connected to Alpaca Paper Environment. Live money trading is strictly disabled.
        </div>
        <div className="text-voltron-cyan">
          Built for Autonomous AI Options Operations
        </div>
      </footer>
    </div>
  );
}
