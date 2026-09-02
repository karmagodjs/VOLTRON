"use client";

import { TimelineEvent } from "@/types";
import {
  Radar,
  Zap,
  Bot,
  SlidersHorizontal,
  ShieldCheck,
  Send,
  Eye,
  CheckCircle2,
  AlertCircle,
  Clock,
} from "lucide-react";
import clsx from "clsx";

interface AgentTimelineCardProps {
  events: TimelineEvent[];
  cycle: number;
}

export default function AgentTimelineCard({ events, cycle }: AgentTimelineCardProps) {
  const getStageIcon = (type: string) => {
    switch (type) {
      case "scan":
        return Radar;
      case "volatility":
        return Zap;
      case "ai":
        return Bot;
      case "strategy":
        return SlidersHorizontal;
      case "risk":
        return ShieldCheck;
      case "execution":
        return Send;
      case "monitor":
        return Eye;
      default:
        return CheckCircle2;
    }
  };

  return (
    <div className="terminal-card p-4 border border-voltron-750/80 bg-voltron-850/40 flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-voltron-750/60 pb-3 mb-3">
        <div className="flex items-center">
          <span className="text-xs font-mono font-bold text-white tracking-wider uppercase">
            Autonomous Agent Timeline
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-voltron-400">
            Cycle #{cycle}
          </span>
          <span className="px-2 py-0.5 rounded bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30 text-[10px] font-mono font-bold">
            LIVE STREAM
          </span>
        </div>
      </div>

      {/* Timeline Steps Stream */}
      <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
        {events.map((evt, idx) => {
          const Icon = getStageIcon(evt.type);
          const isLatest = idx === events.length - 1;

          return (
            <div
              key={evt.id}
              className={clsx(
                "p-2.5 rounded-lg border transition-all text-xs font-mono relative overflow-hidden",
                isLatest
                  ? "bg-voltron-900 border-voltron-cyan/40 shadow-cyan-glow"
                  : "bg-voltron-900/60 border-voltron-800 hover:border-voltron-700"
              )}
            >
              {/* Top Row: Timestamp, Stage, Status */}
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className={clsx(
                      "w-5 h-5 rounded flex items-center justify-center text-[10px]",
                      isLatest
                        ? "bg-voltron-cyan/20 text-voltron-cyan border border-voltron-cyan/40"
                        : "bg-voltron-800 text-voltron-400"
                    )}
                  >
                    <Icon className="w-3 h-3" />
                  </div>

                  <span className="font-bold text-white tracking-wide">
                    {evt.stage}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-voltron-400 font-tabular flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {evt.timestamp}
                  </span>
                  <span
                    className={clsx(
                      "px-1.5 py-0.2 rounded text-[9px] font-bold",
                      evt.status === "PASS"
                        ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                        : evt.status === "ACTIVE"
                        ? "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30 animate-pulse"
                        : "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                    )}
                  >
                    {evt.status}
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="text-[11px] font-semibold text-voltron-200 pl-7">
                {evt.summary}
              </div>

              {/* Details Subtitle */}
              <div className="text-[10px] text-voltron-400 pl-7 mt-0.5">
                {evt.details}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Pipeline Summary */}
      <div className="mt-3 pt-2 border-t border-voltron-750/60 flex items-center justify-between text-[10px] font-mono text-voltron-400">
        <span className="text-voltron-cyan">Pipeline: SCAN → ANALYZE → RISK → EXECUTE → MONITOR</span>
        <span className="text-voltron-emerald">● Optimal State</span>
      </div>
    </div>
  );
}
