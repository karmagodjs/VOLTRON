"use client";

import { useState, useEffect } from "react";
import { Play, Pause, Square, SkipForward, Cpu, Clock, ShieldCheck } from "lucide-react";
import { controlAgent } from "@/lib/api";
import clsx from "clsx";

interface AutonomousControlCardProps {
  cycle: number;
  onRefreshTimeline?: () => void;
}

export default function AutonomousControlCard({
  cycle: initialCycle,
  onRefreshTimeline,
}: AutonomousControlCardProps) {
  const [status, setStatus] = useState<"ACTIVE" | "PAUSED" | "STOPPED">("ACTIVE");
  const [cycle, setCycle] = useState(initialCycle || 142);
  const [secondsToNext, setSecondsToNext] = useState(24);
  const [lastScanSeconds, setLastScanSeconds] = useState(6);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastScanSeconds((prev) => (prev >= 60 ? 1 : prev + 1));
      setSecondsToNext((prev) => {
        if (prev <= 1) {
          if (status === "ACTIVE") {
            setCycle((c) => c + 1);
            if (onRefreshTimeline) onRefreshTimeline();
          }
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status, onRefreshTimeline]);

  const handleControl = async (action: "start" | "pause" | "stop" | "step") => {
    if (action === "start") setStatus("ACTIVE");
    else if (action === "pause") setStatus("PAUSED");
    else if (action === "stop") setStatus("STOPPED");
    else if (action === "step") setCycle((c) => c + 1);

    await controlAgent(action);
    if (onRefreshTimeline) onRefreshTimeline();
  };

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-3">
          <div className="flex items-center">
            <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
              Autonomous Mode
            </span>
          </div>

          <div
            className={clsx(
              "flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider",
              status === "ACTIVE"
                ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 shadow-emerald-glow"
                : status === "PAUSED"
                ? "bg-voltron-amber/15 text-voltron-amber border border-voltron-amber/30"
                : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
            )}
          >
            <span
              className={clsx(
                "w-1.5 h-1.5 rounded-full",
                status === "ACTIVE"
                  ? "bg-voltron-emerald animate-pulse"
                  : status === "PAUSED"
                  ? "bg-voltron-amber"
                  : "bg-voltron-rose"
              )}
            ></span>
            {status}
          </div>
        </div>

        {/* Cycle & Scan Timers */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-center">
          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Cycle
            </span>
            <span className="text-xs font-mono font-bold text-white font-tabular">
              #{cycle}
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Last Scan
            </span>
            <span className="text-xs font-mono font-bold text-voltron-300 font-tabular">
              {lastScanSeconds}s ago
            </span>
          </div>

          <div className="p-2 rounded bg-voltron-900/70 border border-voltron-800">
            <span className="text-[9px] font-mono uppercase text-voltron-400 block">
              Next Scan
            </span>
            <span className="text-xs font-mono font-bold text-voltron-cyan font-tabular">
              {secondsToNext}s
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="grid grid-cols-4 gap-2 mb-3">
          <button
            onClick={() => handleControl("start")}
            disabled={status === "ACTIVE"}
            className="py-2 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 disabled:hover:bg-voltron-800 text-[11px] font-mono font-bold text-voltron-emerald flex items-center justify-center gap-1 transition-colors border border-voltron-700/60"
          >
            <Play className="w-3 h-3 fill-voltron-emerald" />
            <span className="hidden sm:inline">Start</span>
          </button>

          <button
            onClick={() => handleControl("pause")}
            disabled={status === "PAUSED"}
            className="py-2 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 disabled:hover:bg-voltron-800 text-[11px] font-mono font-bold text-voltron-amber flex items-center justify-center gap-1 transition-colors border border-voltron-700/60"
          >
            <Pause className="w-3 h-3 fill-voltron-amber" />
            <span className="hidden sm:inline">Pause</span>
          </button>

          <button
            onClick={() => handleControl("stop")}
            disabled={status === "STOPPED"}
            className="py-2 rounded bg-voltron-800 hover:bg-voltron-750 disabled:opacity-40 disabled:hover:bg-voltron-800 text-[11px] font-mono font-bold text-voltron-rose flex items-center justify-center gap-1 transition-colors border border-voltron-700/60"
          >
            <Square className="w-3 h-3 fill-voltron-rose" />
            <span className="hidden sm:inline">Stop</span>
          </button>

          <button
            onClick={() => handleControl("step")}
            className="py-2 rounded bg-voltron-800 hover:bg-voltron-750 text-[11px] font-mono font-bold text-voltron-cyan flex items-center justify-center gap-1 transition-colors border border-voltron-700/60"
          >
            <SkipForward className="w-3 h-3" />
            <span className="hidden sm:inline">Step</span>
          </button>
        </div>
      </div>

      {/* Safety Notice */}
      <div className="p-2.5 rounded bg-voltron-900/60 border border-voltron-800 text-[10px] font-mono text-voltron-400 flex items-center gap-2">
        <ShieldCheck className="w-4 h-4 text-voltron-cyan flex-shrink-0" />
        <span>Alpaca Paper execution guardrails active. Live execution disabled.</span>
      </div>
    </div>
  );
}
