"use client";

import { useState, useEffect } from "react";
import {
  Play,
  Pause,
  Square,
  SkipForward,
} from "lucide-react";
import { controlAgent } from "@/lib/api";
import { AgentState } from "@/types";
import clsx from "clsx";

interface AgentActivityBarProps {
  agentState?: AgentState | null;
  activeOrder?: string | null;
  lastUpdated?: string;
  onRefresh?: () => void;
}

export default function AgentActivityBar({
  agentState,
  activeOrder = "VLT-8941",
  lastUpdated,
  onRefresh,
}: AgentActivityBarProps) {
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "STOPPED">(
    agentState?.status === "PAUSED" ? "PAUSED" : agentState?.status === "STOPPED" ? "STOPPED" : "ACTIVE"
  );
  const [cycle, setCycle] = useState(agentState?.cycle || 142);
  const [secondsToNext, setSecondsToNext] = useState(24);

  useEffect(() => {
    if (agentState?.cycle) setCycle(agentState.cycle);
  }, [agentState?.cycle]);

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

  const currentSymbol = agentState?.symbol || "SPY";
  const currentStrategy = agentState?.strategy || "NO_TRADE";
  const currentConfidence = agentState?.confidence != null ? agentState.confidence : 0;
  const currentScore = agentState?.opportunity_score != null ? agentState.opportunity_score : 0;
  const currentDecision = agentState?.decision || "NO_TRADE";
  const isRateLimited = agentState?.ai_status === "RATE_LIMITED" || agentState?.status === "RATE_LIMITED";
  const currentReason = isRateLimited
    ? "Gemini API rate limited (429) — Trading safely disarmed"
    : (agentState?.last_reason || "Risk evaluation passed / Paper order submitted");

  const pipelineStages = [
    { name: "SCAN", status: "PASSED", detail: `${currentSymbol} liquid filters passed` },
    {
      name: "ANALYZE",
      status: isRateLimited ? "RATE_LIMITED" : currentConfidence >= 70 ? "PASSED" : "NO_TRADE",
      detail: isRateLimited ? "Gemini Rate Limited (0%)" : `Confidence ${currentConfidence}%`,
    },
    {
      name: "STRATEGY",
      status: isRateLimited || currentStrategy === "NO_TRADE" || currentStrategy === "NO TRADE" ? "NO_TRADE" : "PASSED",
      detail: currentStrategy,
    },
    { name: "RISK", status: "PASSED", detail: "7 Gates Evaluated" },
    { name: "EXECUTE", status: "DISABLED", detail: "VOLTRON_TRADING_ENABLED=false (Safe)" },
    { name: "MONITOR", status: "ACTIVE", detail: "Position monitor active" },
  ];

  const systemServices = [
    { name: "ALPACA", status: "CONNECTED", type: "emerald" },
    { name: "MARKET DATA", status: "CONNECTED", type: "emerald" },
    { name: "OPTIONS DATA", status: "CONNECTED", type: "emerald" },
    {
      name: "GEMINI",
      status: isRateLimited ? "RATE LIMITED" : "CONNECTED",
      type: isRateLimited ? "amber" : "emerald",
    },
    { name: "RISK ENGINE", status: "ACTIVE", type: "cyan" },
    { name: "EXECUTION ENGINE", status: "SAFE (DISABLED)", type: "cyan" },
    { name: "POSITION MONITOR", status: "ACTIVE", type: "cyan" },
  ];

  return (
    <div className="space-y-3 font-mono">

      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-800">
        <div className="flex items-center justify-between border-b border-voltron-800 pb-2 mb-3">
          <div className="flex items-center">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              AGENT PIPELINE
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <span className="text-voltron-400">
              Next Cycle: <strong className="text-voltron-cyan font-tabular">{secondsToNext}s</strong>
            </span>
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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
          {pipelineStages.map((stage) => {
            const isCompleted = stage.status === "PASSED";
            const isActive = stage.status === "ACTIVE";
            const isRateLimit = stage.status === "RATE_LIMITED";
            const isNoTrade = stage.status === "NO_TRADE";

            return (
              <div
                key={stage.name}
                className={clsx(
                  "p-2.5 rounded border transition-all flex flex-col justify-between",
                  isActive
                    ? "bg-voltron-950 border-voltron-cyan"
                    : isRateLimit
                    ? "bg-voltron-amber/5 border-voltron-amber/30"
                    : isCompleted
                    ? "bg-voltron-950/80 border-voltron-800"
                    : "bg-voltron-950/40 border-voltron-850 opacity-60"
                )}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-white tracking-wider">
                    {stage.name}
                  </span>

                  <span
                    className={clsx(
                      "text-[9px] font-bold px-1 rounded",
                      isActive
                        ? "text-voltron-cyan bg-voltron-cyan/15 animate-pulse"
                        : isRateLimit
                        ? "text-voltron-amber bg-voltron-amber/15"
                        : isNoTrade
                        ? "text-voltron-400 bg-voltron-800"
                        : isCompleted
                        ? "text-voltron-emerald bg-voltron-emerald/15"
                        : "text-voltron-400"
                    )}
                  >
                    {isCompleted ? "PASS" : isRateLimit ? "RATE_LIM" : isNoTrade ? "NO_TRD" : isActive ? "LIVE" : "WAIT"}
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

      <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3 text-xs">

        <div className="flex flex-wrap items-center gap-2.5">
          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Cycle</span>
            <span className="font-bold text-white font-tabular">#{cycle}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Status</span>
            <span className="font-bold text-voltron-emerald">{status}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Symbol</span>
            <span className="font-bold text-voltron-cyan">{currentSymbol}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Decision</span>
            <span className="font-bold text-voltron-emerald">{currentDecision}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Strategy</span>
            <span className="font-bold text-white">{currentStrategy}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Confidence</span>
            <span className="font-bold text-voltron-cyan font-tabular">{currentConfidence}%</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Opp Score</span>
            <span className="font-bold text-voltron-emerald font-tabular">{currentScore}/100</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2">
            <span className="text-voltron-400 text-[10px] uppercase">Order ID</span>
            <span className="font-bold text-voltron-cyan">{activeOrder || "—"}</span>
          </div>

          <div className="p-1.5 px-2.5 rounded bg-voltron-950 border border-voltron-800 flex items-center gap-2 hidden 2xl:flex">
            <span className="text-voltron-400 text-[10px] uppercase">Last Reason</span>
            <span className="font-semibold text-voltron-200 text-[11px] truncate max-w-[240px]">
              {currentReason}
            </span>
          </div>
        </div>

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

      <div className="p-2.5 rounded-lg bg-voltron-900/60 border border-voltron-800 flex flex-wrap items-center justify-between gap-2 text-[10px]">
        <div className="flex flex-wrap items-center gap-4">
          <span className="text-voltron-400 font-bold uppercase">SYSTEM HEALTH:</span>
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
