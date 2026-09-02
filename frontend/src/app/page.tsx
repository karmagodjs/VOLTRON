"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
import ThemeToggle from "@/components/common/ThemeToggle";

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

  // Animation configuration respecting reduced motion
  const heroVariants = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 12 },
    visible: (customDelay: number = 0) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.5,
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
        staggerChildren: shouldReduceMotion ? 0 : 0.08,
        delayChildren: shouldReduceMotion ? 0 : 0.45,
      },
    },
  };

  const itemVariant = {
    hidden: { opacity: 0, y: shouldReduceMotion ? 0 : 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: shouldReduceMotion ? 0 : 0.4,
        ease: "easeOut",
      },
    },
  };

  return (
    <div className="min-h-screen bg-voltron-900 text-foreground flex flex-col justify-between selection:bg-voltron-cyan/20 selection:text-voltron-cyan relative overflow-hidden font-mono grid-bg">
      {/* Subtle Institutional Scanline Overlay */}
      <div className="scanline-overlay pointer-events-none" />

      {/* Top Header Bar */}
      <header className="h-14 px-4 sm:px-8 flex items-center justify-between border-b border-voltron-800 bg-voltron-950/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <span className="font-bold tracking-wider text-sm text-white">
            VOLTRON
          </span>
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-voltron-900 text-voltron-400 border border-voltron-800 uppercase tracking-widest font-semibold">
            VOLATILITY ALPHA
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-6 text-xs text-voltron-400">
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

        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Dark / Light Theme Toggle */}
          <ThemeToggle variant="pill" />

          {/* Paper Environment Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-800 text-[11px] text-voltron-400 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
            Paper Environment
          </div>

          <Link
            href="/dashboard"
            className="px-3.5 py-1.5 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 text-xs font-bold transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
          >
            <span>Launch Terminal</span>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="px-4 sm:px-8 py-12 sm:py-16 max-w-5xl mx-auto text-center relative z-10 w-full">
        {/* Top Tag Badge */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={heroVariants}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-voltron-850 border border-voltron-750 text-[10px] text-voltron-cyan font-bold tracking-wider uppercase mb-5 shadow-sm"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse inline-block" />
          <span>AUTONOMOUS OPTIONS QUANT TRADING TERMINAL</span>
        </motion.div>

        {/* Main Headline */}
        <motion.h1
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={heroVariants}
          className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white mb-4"
        >
          VOLTRON — VOLATILITY ALPHA
        </motion.h1>

        {/* Description */}
        <motion.p
          initial="hidden"
          animate="visible"
          custom={0.32}
          variants={heroVariants}
          className="text-xs sm:text-sm md:text-base text-voltron-300 max-w-2xl mx-auto mb-8 leading-relaxed font-sans"
        >
          An autonomous intelligence layer that analyzes volatility spreads, selects defined-risk options strategies, enforces institutional risk controls, and executes paper trades through Alpaca.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          initial="hidden"
          animate="visible"
          custom={0.42}
          variants={heroVariants}
          className="flex flex-wrap items-center justify-center gap-3 mb-12"
        >
          <Link
            href="/dashboard"
            className="px-5 py-2.5 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex items-center gap-1.5"
          >
            <span>Launch Terminal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>

          <Link
            href="/agent"
            className="px-5 py-2.5 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
          >
            View AI Agent
          </Link>

          <Link
            href="/strategies"
            className="px-5 py-2.5 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
          >
            Explore Strategies
          </Link>
        </motion.div>

        {/* Autonomous Execution Pipeline Diagram */}
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.6,
            delay: shouldReduceMotion ? 0 : 0.5,
            ease: "easeOut",
          }}
          className="p-4 sm:p-5 rounded-lg border border-voltron-750 bg-voltron-850/80 backdrop-blur max-w-5xl mx-auto text-left shadow-terminal relative"
        >
          <div className="flex items-center justify-between border-b border-voltron-750/80 pb-2.5 mb-4 text-xs">
            <span className="text-white font-bold tracking-wider uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-sm bg-voltron-cyan inline-block"></span>
              AUTONOMOUS EXECUTION PIPELINE
            </span>
            <div className="flex items-center gap-1.5 text-voltron-emerald text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
              <span>7 OF 7 NODES ACTIVE</span>
            </div>
          </div>

          {/* Sequential Animated Pipeline Nodes */}
          <motion.div
            variants={containerStagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 relative"
          >
            {pipelineStages.map((stage, idx) => (
              <motion.div
                key={stage.step}
                variants={itemVariant}
                className="group relative p-3 rounded bg-voltron-950 border border-voltron-800 hover:border-voltron-700 transition-all duration-200 flex flex-col justify-between text-left"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[9px] text-voltron-500 font-tabular font-bold">
                      {stage.step}
                    </span>
                    {idx < pipelineStages.length - 1 && (
                      <ChevronRight className="hidden lg:block w-3 h-3 text-voltron-600 group-hover:text-voltron-cyan transition-colors" />
                    )}
                  </div>
                  <span className="text-[11px] font-bold text-white block leading-tight mb-1">
                    {stage.title}
                  </span>
                </div>
                <div className="text-[9px] text-voltron-400 mt-2 border-t border-voltron-850 pt-1.5">
                  {stage.sub}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* Core Architectural Pillars */}
      <section className="px-4 sm:px-8 py-12 max-w-5xl mx-auto border-t border-voltron-800 w-full relative z-10">
        <motion.div
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left"
        >
          {pillarCards.map((card, idx) => (
            <div
              key={idx}
              className="p-5 rounded-lg bg-voltron-850/60 border border-voltron-800 hover:border-voltron-700/90 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-terminal flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[9px] font-bold text-voltron-cyan px-1.5 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/20 uppercase tracking-wider">
                    {card.tag}
                  </span>
                </div>
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2">
                  {card.title}
                </h3>
                <p className="text-xs text-voltron-300 leading-relaxed font-sans">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="px-4 sm:px-8 py-4 border-t border-voltron-800 bg-voltron-950 text-xs text-voltron-400 flex flex-wrap items-center justify-between gap-3 relative z-10">
        <div className="flex items-center gap-2 text-white font-bold">
          <span>VOLTRON TRADING TERMINAL</span>
        </div>
        <div className="text-[11px] text-voltron-400">
          Alpaca Paper Trading Environment &bull; Real money trading disabled
        </div>
        <div className="text-[11px] text-voltron-400">
          Autonomous Options Operations
        </div>
      </footer>
    </div>
  );
}
