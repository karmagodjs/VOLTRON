"use client";

import { useState, useEffect } from "react";
import {
  Radar,
  Zap,
  Bot,
  SlidersHorizontal,
  ShieldCheck,
  Send,
  Eye,
  CheckCircle2,
  Clock,
  Play,
  Pause,
  Square,
  SkipForward,
  Cpu,
} from "lucide-react";
import { controlAgent } from "@/lib/api";
import clsx from "clsx";

interface AgentActivityBarProps {
  cycle: number;
  symbol: string;
  strategy?: string;
  confidence?: number;
  opportunityScore?: number;
  lastAction?: string;
  lastUpdated?: string;
  onRefresh?: () => void;
}

const pipelineStages = [
  { name: "SCAN", icon: Radar, status: "PASSED", detail: "SPY liquid filters passed" },
  { name: "ANALYZE", icon: Bot, status: "PASSED", detail: "IV/RV 1.62x (Confidence 88%)" },
  { name: "STRATEGY", icon: SlidersHorizontal, status: "PASSED", detail: "IRON CONDOR (45 DTE)" },
  { name: "RISK", icon: ShieldCheck, status: "PASSED", detail: "7 Gates Approved (0.31% Risk)" },
  { name: "EXECUTE", icon: Send, status: "PASSED", detail: "Order #VLT-8941 Submitted @ $1.85" },
  { name: "MONITOR", icon: Eye, status: "ACTIVE", detail: "Unrealized P&L +$145.00 (+7.8%)" },
];

const systemServices = [
  { name: "ALPACA", status: "CONNECTED", type: "emerald" },
  { name: "MARKET DATA", status: "CONNECTED", type: "emerald" },
  { name: "OPTIONS DATA", status: "CONNECTED", type: "emerald" },
  { name: "AI", status: "CONNECTED", type: "emerald" },
  { name: "RISK ENGINE", status: "ACTIVE", type: "cyan" },
  { name: "EXECUTION", status: "PAPER", type: "cyan" },
  { name: "POSITION MONITOR", status: "ACTIVE", type: "cyan" },
];

export default function AgentActivityBar({
  cycle: initialCycle,
  symbol,
  strategy = "IRON_CONDOR",
  confidence = 88,
  opportunityScore = 94,
  lastAction = "Risk evaluation passed / Paper order #VLT-8941 routed",
  lastUpdated,
  onRefresh,
}: AgentActivityBarProps) {
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "STOPPED">("ACTIVE");
  const [cycle, setCycle] = useState(initialCycle || 142);
  const [secondsToNext, setSecondsToNext] = useState(24);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsToNext((prev) => {
        if (prev <= 1) {
          if (status === "ACTIVE") {
            setCycle((c) => c + 1);
            if (onRefresh) onRefresh();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onRefresh]);

  const handleControl = async (action: "start" | "pause" | "stop" | "step") => {
    if (action === "start") setStatus("ACTIVE");
    else if (action === "pause") setStatus("PAUSED");
    else if (action === "stop") setStatus("STOPPED");
    else if (action === "step") setCycle((c) => c + 1);

    await controlAgent(action);
    if (onRefresh) onRefresh();
  };

  return (
    <div className="space-y-3 font-mono">
      {/* 1. Horizontal Pipeline Workflow Bar */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80">
        <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-voltron-cyan" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              AUTONOMOUS EXECUTION PIPELINE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-voltron-400">Next Scan in: <strong className="text-voltron-cyan font-tabular">{secondsToNext}s</strong></span>
            <span
              className={clsx(
                "px-2 py-0.5 rounded text-[10px] font-bold uppercase",
                status === "ACTIVE"
                  ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                  : status === "PAUSED"
                  ? "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
                  : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
              )}
            >
              ● {status}
            </span>
          </div>
        </div>

        {/* 6 Pipeline Stage Steps */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage, idx) => {
            const Icon = stage.icon;
            const isCompleted = stage.status === "PASSED";
            const isActive = stage.status === "ACTIVE";

            return (
              <div
                key={stage.name}
                className={clsx(
                  "p-2.5 rounded border transition-all flex flex-col justify-between",
                  isActive
                    ? "bg-voltron-950 border-voltron-cyan shadow-cyan-glow"
                    : isCompleted
                    ? "bg-voltron-950/80 border-voltron-800"
                    : "bg-voltron-950/40 border-voltron-850 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <div
                      className={clsx(
                        "w-5 h-5 rounded flex items-center justify-center text-[10px]",
                        isActive
                          ? "bg-voltron-cyan/20 text-voltron-cyan"
                          : isCompleted
                          ? "bg-voltron-emerald/20 text-voltron-emerald"
                          : "bg-voltron-800 text-voltron-400"
                      )}
                    >
                      <Icon className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-bold text-white tracking-wider">
                      {stage.name}
                    </span>
                  </div>

                  <span
                    className={clsx(
                      "text-[9px] font-bold px-1 rounded",
                      isActive
                        ? "text-voltron-cyan bg-voltron-cyan/15 animate-pulse"
                        : isCompleted
                        ? "text-voltron-emerald bg-voltron-emerald/15"
                        : "text-voltron-400"
                    )}
                  >
                    {isCompleted ? "✓ PASS" : isActive ? "● LIVE" : "— WAIT"}
                  </span>
                </div>

                <div className="text-[10px] text-voltron-300 truncate">
                  {stage.detail}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Agent Telemetry & Autonomous Control Strip */}
      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left Telemetry Badges */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Cycle</span>
            <span className="font-bold text-white font-tabular">#{cycle}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Symbol</span>
            <span className="font-bold text-voltron-cyan">{symbol}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Strategy</span>
            <span className="font-bold text-white">{strategy}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Confidence</span>
            <span className="font-bold text-voltron-cyan font-tabular">{confidence}%</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Opportunity</span>
            <span className="font-bold text-voltron-emerald font-tabular">{opportunityScore}/100</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2 hidden xl:flex">
            <span className="text-voltron-400 text-[10px] uppercase">Last Action</span>
            <span className="font-semibold text-voltron-200 text-[11px] truncate max-w-[260px]">
              {lastAction}
            </span>
          </div>
        </div>

        {/* Right Execution Controls */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => handleControl("start")}
            disabled={status === "ACTIVE"}
            className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 text-[11px] font-bold text-voltron-emerald border border-voltron-700/80 transition-colors flex items-center gap-1"
          >
            <Play className="w-3 h-3 fill-voltron-emerald" />
            <span>START</span>
          </button>

          <button
            onClick={() => handleControl("pause")}
            disabled={status === "PAUSED"}
            className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 text-[11px] font-bold text-voltron-amber border border-voltron-700/80 transition-colors flex items-center gap-1"
          >
            <Pause className="w-3 h-3 fill-voltron-amber" />
            <span>PAUSE</span>
          </button>

          <button
            onClick={() => handleControl("stop")}
            disabled={status === "STOPPED"}
            className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 text-[11px] font-bold text-voltron-rose border border-voltron-700/80 transition-colors flex items-center gap-1"
          >
            <Square className="w-3 h-3 fill-voltron-rose" />
            <span>STOP</span>
          </button>

          <button
            onClick={() => handleControl("step")}
            className="px-2.5 py-1 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-bold text-voltron-cyan border border-voltron-700/80 transition-colors flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            <span>STEP</span>
          </button>
        </div>
      </div>

      {/* 3. Small System Health Microservices Strip */}
      <div className="p-2.5 rounded-lg bg-voltron-900/60 border border-voltron-800 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-voltron-400 font-bold uppercase">System Telemetry:</span>
          {systemServices.map((srv) => (
            <div key={srv.name} className="flex items-center gap-1.5">
              <span
                className={clsx(
                  "w-1.5 h-1.5 rounded-full inline-block",
                  srv.type === "emerald" ? "bg-voltron-emerald" : "bg-voltron-cyan"
                )}
              ></span>
              <span className="text-voltron-400">{srv.name}:</span>
              <span className="text-white font-bold">{srv.status}</span>
            </div>
          ))}
        </div>

        <div className="text-voltron-400">
          Last Check: <span className="text-white font-tabular">{lastUpdated || "Live"}</span>
        </div>
      </div>
    </div>
  );
}
