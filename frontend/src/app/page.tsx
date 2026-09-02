"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";
import CursorReactiveBackground from "@/components/common/CursorReactiveBackground";

const pipelineStages = [
  { step: "01", title: "MARKET DATA", sub: "SIP Real-Time Feed" },
  { step: "02", title: "VOLATILITY ENGINE", sub: "IV/RV Spread & Skew" },
  { step: "03", title: "AI ANALYST", sub: "Gemini 3.6 Reasoning" },
  { step: "04", title: "STRATEGY ENGINE", sub: "Defined-Risk Selection" },
  { step: "05", title: "RISK ENGINE", sub: "7-Gate Safety Verification" },
  { step: "06", title: "EXECUTION", sub: "Alpaca Paper Multi-Leg" },
  { step: "07", title: "MONITORING", sub: "Dynamic Take-Profit & Stop" },
];

const pillarCards = [
  {
    title: "Quant Volatility Alpha",
    description:
      "Calculates 20-day realized volatility from SIP bar data and compares it directly with real-time implied volatility skew to quantify edge (IV/RV > 1.40x).",
    tag: "IV/RV SPREAD",
  },
  {
    title: "Institutional AI Reasoning",
    description:
      "Gemini 3.6 synthesizes multi-timeframe vol surfaces, market regime drifts, and macro conditions to articulate explainable hypotheses before any trade enters the queue.",
    tag: "EXPLAINABLE AI",
  },
  {
    title: "7-Gate Risk Architecture",
    description:
      "Every paper execution is strictly vetted against Max 1% Trade Risk, 2% Daily Loss Circuit Breakers, 30% Aggregate Exposure, and an armed Emergency Kill Switch.",
    tag: "CAPITAL PRESERVATION",
  },
];

export default function LandingPage() {
  const shouldReduceMotion = useReducedMotion();

  // Polished institutional entrance choreography respecting prefers-reduced-motion
  const heroVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 10 },
    visible: (customDelay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.45,
        delay: shouldReduceMotion ? 0 : customDelay,
        ease: [0.16, 1, 0.3, 1],
      },
    }),
  };

  const containerStagger = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: shouldReduceMotion ? 0 : 0.06,
        delayChildren: shouldReduceMotion ? 0 : 0.35,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 6 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.35,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-voltron-900 text-foreground flex flex-col justify-between selection:bg-voltron-cyan/20 selection:text-voltron-cyan relative font-mono overflow-x-hidden">
      {/* Interactive Cursor-Reactive Background Field */}
      <CursorReactiveBackground />

      {/* Subtle Institutional Scanline Overlay */}
      <div className="scanline-overlay pointer-events-none" />

      {/* Top Header Bar */}
      <header className="h-12 lg:h-13 px-4 sm:px-6 lg:px-8 flex-shrink-0 flex items-center justify-between border-b border-voltron-800 bg-voltron-950/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <span className="font-bold tracking-wider text-xs sm:text-sm text-white">
            VOLTRON
          </span>
          <span className="text-[8.5px] px-1.5 py-0.5 rounded bg-voltron-900 text-voltron-400 border border-voltron-800 uppercase tracking-widest font-semibold">
            VOLATILITY ALPHA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-5 text-xs text-voltron-400">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Terminal
          </Link>
          <Link href="/markets" className="hover:text-white transition-colors">
            Volatility
          </Link>
          <Link href="/options" className="hover:text-white transition-colors">
            Options Chain
          </Link>
          <Link href="/agent" className="hover:text-white transition-colors">
            AI Agent
          </Link>
          <Link href="/risk" className="hover:text-white transition-colors">
            Risk Engine
          </Link>
        </nav>

        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle variant="pill" />

          {/* Paper Environment Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded bg-voltron-900 border border-voltron-800 text-[10px] text-voltron-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
            Paper Environment
          </div>

          <Link
            href="/dashboard"
            className="px-3 py-1 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
          >
            <span>Launch Terminal</span>
          </Link>
        </div>
      </header>

      {/* Main Single-Viewport Body */}
      <main className="flex-1 flex flex-col justify-evenly px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-2 sm:py-3 lg:py-2 relative z-10">
        {/* 1. Hero Section (Compact ~35-40% Viewport on Desktop) */}
        <section className="text-center flex flex-col items-center justify-center my-auto py-1">
          {/* Top Tag Badge */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.05}
            variants={heroVariants}
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-voltron-850 border border-voltron-750 text-[9px] sm:text-[10px] text-voltron-cyan font-bold tracking-wider uppercase mb-2 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse inline-block" />
            <span>AUTONOMOUS OPTIONS QUANT TRADING TERMINAL</span>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.12}
            variants={heroVariants}
            className="text-2xl sm:text-4xl lg:text-[40px] lg:leading-tight font-black tracking-tight text-white mb-2"
          >
            VOLTRON — VOLATILITY ALPHA
          </motion.h1>

          {/* Description */}
          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={heroVariants}
            className="text-xs sm:text-[13px] text-voltron-300 max-w-2xl mx-auto mb-3.5 leading-relaxed font-sans"
          >
            An autonomous intelligence layer that analyzes volatility spreads, selects defined-risk options strategies, enforces institutional risk controls, and executes paper trades through Alpaca.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.28}
            variants={heroVariants}
            className="flex flex-wrap items-center justify-center gap-2.5"
          >
            <Link
              href="/dashboard"
              className="px-4 py-1.5 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex items-center gap-1.5"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/agent"
              className="px-4 py-1.5 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
            >
              View AI Agent
            </Link>

            <Link
              href="/strategies"
              className="px-4 py-1.5 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
            >
              Explore Strategies
            </Link>
          </motion.div>
        </section>

        {/* 2. Autonomous Execution Pipeline (Compact Horizontal Flow) */}
        <motion.section
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.32,
            ease: "easeOut",
          }}
          className="w-full my-auto py-1"
        >
          <div className="p-2.5 sm:p-3 rounded-lg border border-voltron-750 bg-voltron-850/80 backdrop-blur shadow-terminal">
            <div className="flex items-center justify-between border-b border-voltron-750/80 pb-1.5 mb-2 text-xs">
              <span className="text-white font-bold tracking-wider uppercase flex items-center gap-1.5 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-sm bg-voltron-cyan inline-block"></span>
                AUTONOMOUS EXECUTION PIPELINE
              </span>
              <div className="flex items-center gap-1.5 text-voltron-emerald text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
                <span>7 OF 7 NODES ACTIVE</span>
              </div>
            </div>

            {/* Sequential Animated Pipeline Nodes */}
            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-1.5"
            >
              {pipelineStages.map((stage, idx) => (
                <motion.div
                  key={stage.step}
                  variants={itemVariant}
                  className="group relative p-2 rounded bg-voltron-950 border border-voltron-800 hover:border-voltron-700 transition-all duration-200 flex flex-col justify-between text-left"
                >
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="text-[8.5px] text-voltron-500 font-tabular font-bold">
                        {stage.step}
                      </span>
                      {idx < pipelineStages.length - 1 && (
                        <ChevronRight className="hidden lg:block w-3 h-3 text-voltron-600 group-hover:text-voltron-cyan transition-colors" />
                      )}
                    </div>
                    <span className="text-[10px] font-bold text-white block leading-tight">
                      {stage.title}
                    </span>
                  </div>
                  <div className="text-[8px] text-voltron-400 mt-1 border-t border-voltron-850 pt-0.5">
                    {stage.sub}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* 3. Three Information Cards (Compact Single Row on Desktop) */}
        <section className="w-full my-auto py-1">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.4,
              ease: "easeOut",
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-2.5 text-left"
          >
            {pillarCards.map((card, idx) => (
              <div
                key={idx}
                className="p-3 rounded-lg bg-voltron-850/60 border border-voltron-800 hover:border-voltron-700/90 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-terminal flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[8.5px] font-bold text-voltron-cyan px-1.5 py-0.2 rounded bg-voltron-cyan/10 border border-voltron-cyan/20 uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-[11px] font-bold text-white uppercase tracking-wider mb-1">
                    {card.title}
                  </h3>
                  <p className="text-[10.5px] text-voltron-300 leading-snug font-sans">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      </main>

      {/* 4. Compact Footer Bar (Pinned at Bottom of Desktop Viewport) */}
      <footer className="h-9 lg:h-10 px-4 sm:px-6 lg:px-8 flex-shrink-0 border-t border-voltron-800 bg-voltron-950 text-xs text-voltron-400 flex flex-wrap items-center justify-between gap-2 relative z-10">
        <div className="flex items-center gap-2 text-white font-bold text-[10px] sm:text-[11px]">
          <span>VOLTRON TRADING TERMINAL</span>
        </div>
        <div className="text-[10px] text-voltron-400 hidden sm:block">
          Alpaca Paper Trading Environment &bull; Real money trading disabled
        </div>
        <div className="text-[10px] text-voltron-400">
          Autonomous Options Operations
        </div>
      </footer>
    </div>
  );
}
