"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ChevronRight, ArrowRight } from "lucide-react";
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
    <div className="min-h-screen lg:h-screen lg:max-h-screen bg-voltron-900 text-foreground flex flex-col justify-center selection:bg-voltron-cyan/20 selection:text-voltron-cyan relative font-mono overflow-x-hidden">

      <CursorReactiveBackground />

      <div className="scanline-overlay pointer-events-none" />

      <main className="flex-1 flex flex-col justify-between lg:justify-evenly px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full py-6 sm:py-8 lg:py-5 relative z-10 space-y-6 lg:space-y-0">

        <section className="text-center flex flex-col items-center justify-center py-2 sm:py-4 lg:py-1">

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.05}
            variants={heroVariants}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-voltron-850 border border-voltron-750 text-[9px] sm:text-[10px] text-voltron-cyan font-bold tracking-wider uppercase mb-3 sm:mb-4 shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-voltron-cyan animate-pulse inline-block" />
            <span>AUTONOMOUS OPTIONS QUANT TRADING TERMINAL</span>
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={0.12}
            variants={heroVariants}
            className="text-3xl sm:text-5xl lg:text-[52px] lg:leading-none font-black tracking-tight text-white mb-3"
          >
            VOLTRON
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={0.2}
            variants={heroVariants}
            className="text-xs sm:text-sm text-voltron-300 max-w-2xl mx-auto mb-5 sm:mb-6 leading-relaxed font-sans px-2"
          >
            An autonomous intelligence layer that analyzes volatility spreads, selects defined-risk options strategies, enforces institutional risk controls, and executes paper trades through Alpaca.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={0.28}
            variants={heroVariants}
            className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 w-full sm:w-auto max-w-xs sm:max-w-none mx-auto"
          >
            <Link
              href="/dashboard"
              className="px-5 py-2.5 sm:py-2 rounded bg-voltron-cyan hover:bg-voltron-cyan-dim text-voltron-950 font-bold text-xs transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex items-center justify-center gap-1.5 min-h-[42px]"
            >
              <span>Launch Terminal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <Link
              href="/agent"
              className="px-5 py-2.5 sm:py-2 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex items-center justify-center min-h-[42px]"
            >
              View AI Agent
            </Link>

            <Link
              href="/strategies"
              className="px-5 py-2.5 sm:py-2 rounded bg-voltron-850 hover:bg-voltron-800 text-white font-semibold text-xs border border-voltron-750 hover:border-voltron-700 transition-all duration-150 transform hover:-translate-y-0.5 active:translate-y-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan flex items-center justify-center min-h-[42px]"
            >
              Explore Strategies
            </Link>
          </motion.div>
        </section>

        <motion.section
          initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.45,
            delay: shouldReduceMotion ? 0 : 0.32,
            ease: "easeOut",
          }}
          className="w-full py-1"
        >
          <div className="p-3 sm:p-3.5 rounded-lg border border-voltron-750 bg-voltron-850/80 backdrop-blur shadow-terminal">
            <div className="flex items-center justify-between border-b border-voltron-750/80 pb-2 mb-2.5 text-xs">
              <span className="text-white font-bold tracking-wider uppercase flex items-center gap-1.5 text-[10.5px] sm:text-[11px]">
                <span className="w-1.5 h-1.5 rounded-sm bg-voltron-cyan inline-block"></span>
                AUTONOMOUS EXECUTION PIPELINE
              </span>
              <div className="flex items-center gap-1.5 text-voltron-emerald text-[9.5px] sm:text-[10px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-voltron-emerald inline-block animate-pulse"></span>
                <span>7 OF 7 NODES ACTIVE</span>
              </div>
            </div>

            <motion.div
              variants={containerStagger}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2"
            >
              {pipelineStages.map((stage, idx) => (
                <motion.div
                  key={stage.step}
                  variants={itemVariant}
                  className="group relative p-2.5 rounded bg-voltron-950 border border-voltron-800 hover:border-voltron-700 transition-all duration-200 flex flex-col justify-between text-left"
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
                    <span className="text-[10.5px] font-bold text-white block leading-tight">
                      {stage.title}
                    </span>
                  </div>
                  <div className="text-[8.5px] text-voltron-400 mt-1.5 border-t border-voltron-850 pt-1">
                    {stage.sub}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        <section className="w-full py-1">
          <motion.div
            initial={{ opacity: 0, y: shouldReduceMotion ? 0 : 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.45,
              delay: shouldReduceMotion ? 0 : 0.4,
              ease: "easeOut",
            }}
            className="grid grid-cols-1 md:grid-cols-3 gap-3 text-left"
          >
            {pillarCards.map((card, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-lg bg-voltron-850/60 border border-voltron-800 hover:border-voltron-700/90 transition-all duration-200 transform hover:-translate-y-0.5 hover:shadow-terminal flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[8.5px] font-bold text-voltron-cyan px-1.5 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/20 uppercase tracking-wider">
                      {card.tag}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-1.5">
                    {card.title}
                  </h3>
                  <p className="text-[11px] text-voltron-300 leading-relaxed font-sans">
                    {card.description}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>
      </main>
    </div>
  );
}
