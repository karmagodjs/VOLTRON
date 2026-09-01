"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import { fetchSystemHealth } from "@/lib/api";
import { SystemHealth } from "@/types";
import {
  Server,
  Activity,
  CheckCircle2,
  Clock,
  Zap,
  Cpu,
  Database,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import clsx from "clsx";

export default function SystemHealthPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetchSystemHealth();
      setHealth(res);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  if (loading || !health) {
    return (
      <TerminalLayout>
        <div className="flex items-center justify-center h-[calc(100vh-120px)] font-mono text-sm text-voltron-cyan">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-lg border-2 border-voltron-cyan border-t-transparent animate-spin"></div>
            <span>POLLING SYSTEM PROCESS HEALTH & SERVICE LATENCIES...</span>
          </div>
        </div>
      </TerminalLayout>
    );
  }

  const formatUptime = (secs: number) => {
    const days = Math.floor(secs / (3600 * 24));
    const hours = Math.floor((secs % (3600 * 24)) / 3600);
    const mins = Math.floor((secs % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <TerminalLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="p-4 rounded-xl bg-voltron-850 border border-voltron-750 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-voltron-cyan/15 border border-voltron-cyan/30 flex items-center justify-center text-voltron-cyan shadow-cyan-glow">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base font-mono font-bold text-white flex items-center gap-2">
                <span>VOLTRON SYSTEM & SERVICE HEALTH</span>
                <span className="text-xs px-2 py-0.5 rounded bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30 font-bold">
                  ● ALL SYSTEMS OPERATIONAL
                </span>
              </div>
              <div className="text-xs font-mono text-voltron-400">
                End-to-end latency monitoring, microservice telemetry, and socket states
              </div>
            </div>
          </div>

          <button
            onClick={loadData}
            className="px-3 py-1.5 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-mono font-bold text-voltron-cyan border border-voltron-700 transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Telemetry</span>
          </button>
        </div>

        {/* 4 Overview Diagnostics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Global Health Status</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" />
              {health.system_status}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Mean Pipeline Latency</span>
            <span className="text-sm font-bold text-voltron-cyan font-tabular">
              {health.overall_latency_ms} ms
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Process Uptime</span>
            <span className="text-sm font-bold text-white font-tabular">
              {formatUptime(health.uptime_seconds)}
            </span>
          </div>

          <div className="p-3 rounded-lg bg-voltron-850 border border-voltron-750">
            <span className="text-[10px] text-voltron-400 uppercase block mb-1">Trading Safety Mode</span>
            <span className="text-sm font-bold text-voltron-cyan font-tabular">
              Alpaca Paper Active
            </span>
          </div>
        </div>

        {/* 8 Connected Services Matrix */}
        <div className="terminal-card p-5 border border-voltron-750/90 bg-voltron-850/40 space-y-4">
          <div className="flex items-center justify-between border-b border-voltron-750 pb-2 text-white font-mono font-bold uppercase text-xs">
            <span>Integrated Services & Microservice Latencies</span>
            <span className="text-[10px] text-voltron-emerald font-normal">
              8/8 SERVICES CONNECTED
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 font-mono text-xs">
            {health.services.map((srv, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-voltron-900 border border-voltron-800 hover:border-voltron-700 transition-colors flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-white text-xs">{srv.name}</span>
                    <span className="w-2 h-2 rounded-full bg-voltron-emerald animate-pulse"></span>
                  </div>
                  <div className="text-[10px] text-voltron-400 mb-2 truncate">
                    {srv.endpoint}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-voltron-800 text-[11px]">
                  <span className="text-voltron-emerald font-semibold">{srv.status}</span>
                  <span className="text-voltron-cyan font-bold font-tabular">{srv.latency_ms} ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </TerminalLayout>
  );
}
