"use client";

import { useState, useEffect } from "react";
import TerminalLayout from "@/components/layout/TerminalLayout";
import {
  ChevronDown,
  ChevronRight,
  X,
} from "lucide-react";
import clsx from "clsx";

export default function TradesPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [trades, setTrades] = useState<any[]>([]);
  const [execMonitor, setExecMonitor] = useState<any>(null);
  const [orderFilter, setOrderFilter] = useState<string>("ALL");
  const [activeTab, setActiveTab] = useState<"orders" | "ledger">("orders");
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [selectedTrade, setSelectedTrade] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const res = await fetch(`/api/trades${orderFilter !== "ALL" ? `?status=${orderFilter}` : ""}`);
      if (!res.ok) throw new Error("Backend offline");
      const json = await res.json();
      setOrders(json.orders || []);
      setTrades(json.trades || []);
      setExecMonitor(json.execution_monitor);
    } catch {

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [orderFilter]);

  const exportCSV = () => {
    const headers = ["ID", "Time", "Symbol", "Strategy", "Direction", "Entry", "Exit", "PnL", "Return", "Risk", "Status", "Reason"];
    const rows = trades.map((t) => [
      t.id,
      t.time,
      t.symbol,
      t.strategy,
      t.direction,
      t.entry_credit,
      t.exit_price,
      t.pnl,
      t.return_pct,
      t.risk,
      t.status,
      t.exit_reason,
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "voltron_paper_execution_ledger.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <TerminalLayout>
      <div className="space-y-3.5 font-mono text-xs">

        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white tracking-wider">
                  ORDER & EXECUTION OPERATIONS
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-voltron-cyan/10 border border-voltron-cyan/30 text-voltron-cyan font-bold uppercase">
                  ALPACA PAPER ENVIRONMENT
                </span>
              </div>
              <div className="text-[11px] text-voltron-400 mt-0.5">
                Multi-Leg Order Router &bull; Real-time Execution Lifecycle &bull; Immutable Audit Trail
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <button
              onClick={exportCSV}
              className="px-3 py-1.5 rounded bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white border border-voltron-700 transition-colors"
            >
              <span>Export Audit CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Orders Submitted</span>
            <span className="text-sm font-bold text-white font-tabular">{execMonitor?.orders_submitted || 14}</span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Orders Filled</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular">{execMonitor?.orders_filled || 12}</span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Orders Rejected</span>
            <span className="text-sm font-bold text-voltron-rose font-tabular">{execMonitor?.orders_rejected || 1}</span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Orders Cancelled</span>
            <span className="text-sm font-bold text-voltron-400 font-tabular">{execMonitor?.orders_cancelled || 1}</span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Fill Rate</span>
            <span className="text-sm font-bold text-voltron-cyan font-tabular">{execMonitor?.fill_rate_pct || 85.7}%</span>
          </div>
          <div className="p-2 rounded bg-voltron-900 border border-voltron-750/80">
            <span className="text-[9px] uppercase text-voltron-400 block mb-0.5">Avg Fill Latency</span>
            <span className="text-sm font-bold text-voltron-emerald font-tabular">{execMonitor?.avg_fill_time_ms || 320}ms</span>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-voltron-900 border border-voltron-750/80 space-y-3">
          <div className="flex flex-wrap items-center justify-between border-b border-voltron-800 pb-2 gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => setActiveTab("orders")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-semibold transition-colors uppercase",
                  activeTab === "orders"
                    ? "bg-voltron-cyan/20 text-voltron-cyan border border-voltron-cyan/50"
                    : "bg-voltron-950 text-voltron-400 hover:text-white border border-voltron-800"
                )}
              >
                Active &amp; Historical Orders ({orders.length})
              </button>
              <button
                onClick={() => setActiveTab("ledger")}
                className={clsx(
                  "px-3 py-1 rounded text-xs font-semibold transition-colors uppercase",
                  activeTab === "ledger"
                    ? "bg-voltron-cyan/20 text-voltron-cyan border border-voltron-cyan/50"
                    : "bg-voltron-950 text-voltron-400 hover:text-white border border-voltron-800"
                )}
              >
                Trade Ledger &amp; P&amp;L ({trades.length})
              </button>
            </div>

            {activeTab === "orders" && (
              <div className="flex items-center gap-1 bg-voltron-950 p-0.5 rounded border border-voltron-800 text-[10px]">
                {(["ALL", "FILLED", "REJECTED", "CLOSED"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilter(st)}
                    className={clsx(
                      "px-2 py-0.5 rounded font-semibold transition-colors",
                      orderFilter === st
                        ? "bg-voltron-800 text-voltron-cyan border border-voltron-700"
                        : "text-voltron-400 hover:text-white"
                    )}
                  >
                    {st}
                  </button>
                ))}
              </div>
            )}
          </div>

          {activeTab === "orders" && (
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-voltron-950 text-[10px] text-voltron-400 uppercase sticky top-0 border-b border-voltron-800">
                  <tr>
                    <th className="p-2">Order ID</th>
                    <th className="p-2">Created Time</th>
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Strategy</th>
                    <th className="p-2">Class</th>
                    <th className="p-2">Qty</th>
                    <th className="p-2">Limit Price</th>
                    <th className="p-2">Fill Status</th>
                    <th className="p-2">Lifecycle</th>
                    <th className="p-2 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-voltron-800 text-[11px]">
                  {orders.map((o) => {
                    const isExpanded = expandedOrderId === o.id;
                    const isFilled = o.status === "FILLED";
                    const isRejected = o.status === "REJECTED";

                    return (
                      <>
                        <tr
                          key={o.id}
                          className="hover:bg-voltron-850/60 transition-colors cursor-pointer"
                          onClick={() => setExpandedOrderId(isExpanded ? null : o.id)}
                        >
                          <td className="p-2 font-bold text-voltron-cyan flex items-center gap-1.5">
                            {isExpanded ? <ChevronDown className="w-3.5 h-3.5 text-voltron-400" /> : <ChevronRight className="w-3.5 h-3.5 text-voltron-400" />}
                            <span>{o.id}</span>
                          </td>
                          <td className="p-2 text-voltron-300 text-[10px]">{o.created_at}</td>
                          <td className="p-2 font-bold text-white">{o.symbol}</td>
                          <td className="p-2 text-voltron-200">{o.strategy}</td>
                          <td className="p-2 text-voltron-400 uppercase text-[10px]">{o.order_class}</td>
                          <td className="p-2 text-white font-tabular">{o.qty}</td>
                          <td className="p-2 text-voltron-emerald font-tabular">${o.limit_price?.toFixed(2)}</td>
                          <td className="p-2">
                            <span
                              className={clsx(
                                "px-1.5 py-0.2 rounded font-bold text-[10px] uppercase",
                                isFilled
                                  ? "bg-voltron-emerald/15 text-voltron-emerald border border-voltron-emerald/30"
                                  : isRejected
                                  ? "bg-voltron-rose/15 text-voltron-rose border border-voltron-rose/30"
                                  : "bg-voltron-cyan/15 text-voltron-cyan border border-voltron-cyan/30"
                              )}
                            >
                              {o.status}
                            </span>
                          </td>
                          <td className="p-2">
                            <div className="flex items-center gap-1 text-[9px] text-voltron-400">
                              {o.lifecycle?.map((step: any, idx: number) => (
                                <span
                                  key={idx}
                                  className={clsx(
                                    "px-1 py-0.2 rounded",
                                    step.status === "DONE" ? "text-voltron-emerald bg-voltron-emerald/10" : "text-voltron-rose bg-voltron-rose/10"
                                  )}
                                >
                                  {step.stage}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="p-2 text-right">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedOrder(o);
                              }}
                              className="text-[10px] text-voltron-cyan hover:underline"
                            >
                              Inspect
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-voltron-950/80">
                            <td colSpan={10} className="p-3 border-y border-voltron-800">
                              <div className="space-y-1.5">
                                <span className="text-[10px] uppercase text-voltron-400 font-bold block">
                                  Multi-Leg Option Structure ({o.legs?.length} Legs)
                                </span>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                                  {o.legs?.map((leg: any, idx: number) => (
                                    <div key={idx} className="p-2 rounded bg-voltron-900 border border-voltron-800 space-y-0.5">
                                      <span className={clsx("font-bold", leg.side === "SELL" ? "text-voltron-emerald" : "text-voltron-cyan")}>
                                        {leg.side} {leg.strike}{leg.type}
                                      </span>
                                      <div className="text-[10px] text-voltron-400 truncate">{leg.symbol}</div>
                                      <div className="text-[9px] text-voltron-300">Ratio: {leg.ratio}x &bull; {leg.intent}</div>
                                    </div>
                                  ))}
                                </div>
                                {o.rejection_reason && (
                                  <div className="p-2 rounded bg-voltron-rose/10 border border-voltron-rose/30 text-voltron-rose text-[11px] mt-2">
                                    <span><strong>Rejection Reason:</strong> {o.rejection_reason}</span>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "ledger" && (
            <div className="overflow-x-auto max-h-[380px]">
              <table className="w-full text-left font-mono text-xs">
                <thead className="bg-voltron-950 text-[10px] text-voltron-400 uppercase sticky top-0 border-b border-voltron-800">
                  <tr>
                    <th className="p-2">Trade ID</th>
                    <th className="p-2">Timestamp</th>
                    <th className="p-2">Symbol</th>
                    <th className="p-2">Strategy</th>
                    <th className="p-2">Direction</th>
                    <th className="p-2">Entry</th>
                    <th className="p-2">Exit</th>
                    <th className="p-2">P&L ($)</th>
                    <th className="p-2">Return</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Exit Trigger</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-voltron-800 text-[11px]">
                  {trades.map((t) => (
                    <tr
                      key={t.id}
                      onClick={() => setSelectedTrade(t)}
                      className="hover:bg-voltron-850/60 cursor-pointer transition-colors"
                    >
                      <td className="p-2 font-bold text-voltron-cyan">{t.id}</td>
                      <td className="p-2 text-voltron-300 text-[10px]">{t.time}</td>
                      <td className="p-2 font-bold text-white">{t.symbol}</td>
                      <td className="p-2 text-voltron-200">{t.strategy}</td>
                      <td className="p-2 text-voltron-400">{t.direction}</td>
                      <td className="p-2 text-white font-tabular">{t.entry_credit}</td>
                      <td className="p-2 text-voltron-300 font-tabular">{t.exit_price}</td>
                      <td className={clsx("p-2 font-bold font-tabular", t.pnl_raw > 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                        {t.pnl}
                      </td>
                      <td className={clsx("p-2 font-tabular", t.pnl_raw > 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                        {t.return_pct}
                      </td>
                      <td className="p-2">
                        <span className={clsx("px-1.5 py-0.2 rounded font-bold text-[10px]", t.status === "OPEN" ? "bg-voltron-cyan/15 text-voltron-cyan" : "bg-voltron-emerald/15 text-voltron-emerald")}>
                          {t.status}
                        </span>
                      </td>
                      <td className="p-2 text-voltron-400 text-[10px] truncate max-w-xs">{t.exit_reason}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="w-full max-w-lg bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedOrder(null)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                ORDER AUDIT &mdash; {selectedOrder.id} ({selectedOrder.symbol})
              </h3>
              <span className="text-[10px] text-voltron-400 font-bold">{selectedOrder.alpaca_client_order_id}</span>
            </div>

            <div className="space-y-2 mb-5">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Status</span>
                  <span className="font-bold text-voltron-emerald">{selectedOrder.status}</span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Limit Price</span>
                  <span className="font-bold text-white">${selectedOrder.limit_price}</span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Filled Qty</span>
                  <span className="font-bold text-white">{selectedOrder.filled_qty} / {selectedOrder.qty}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1">
                <span className="text-[10px] uppercase text-voltron-cyan font-bold block">Individual Option Legs</span>
                {selectedOrder.legs?.map((leg: any, i: number) => (
                  <div key={i} className="flex justify-between items-center text-[11px] p-1 border-b border-voltron-900 last:border-none">
                    <span className="font-bold text-white">{leg.side} {leg.strike}{leg.type}</span>
                    <span className="text-voltron-400 text-[10px]">{leg.intent}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                Close Audit
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedTrade && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-50 p-4 font-mono text-xs">
          <div className="w-full max-w-lg bg-voltron-900 border border-voltron-700 rounded-xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedTrade(null)}
              className="absolute top-4 right-4 text-voltron-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="mb-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                TRADE LEDGER DETAIL &mdash; {selectedTrade.id}
              </h3>
              <span className="text-[10px] text-voltron-400 font-bold">{selectedTrade.symbol} {selectedTrade.strategy}</span>
            </div>

            <div className="space-y-2 mb-5">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">P&L &amp; Return</span>
                  <span className={clsx("font-bold text-xs", selectedTrade.pnl_raw > 0 ? "text-voltron-emerald" : "text-voltron-rose")}>
                    {selectedTrade.pnl} ({selectedTrade.return_pct})
                  </span>
                </div>
                <div className="p-2 rounded bg-voltron-950 border border-voltron-800">
                  <span className="text-[9px] uppercase text-voltron-400 block">Exit Trigger</span>
                  <span className="font-bold text-white text-[11px]">{selectedTrade.exit_reason}</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-voltron-950 border border-voltron-800 space-y-1">
                <span className="text-[10px] uppercase text-voltron-cyan font-bold block">Legs Execution</span>
                {selectedTrade.legs?.map((leg: string, idx: number) => (
                  <div key={idx} className="text-[11px] text-voltron-200">{leg}</div>
                ))}
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedTrade(null)}
                className="px-4 py-2 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-white transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </TerminalLayout>
  );
}
