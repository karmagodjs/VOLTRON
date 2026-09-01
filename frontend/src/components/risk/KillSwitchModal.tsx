"use client";

import { useState } from "react";
import { ShieldAlert, AlertTriangle, X, Check } from "lucide-react";
import clsx from "clsx";

interface KillSwitchModalProps {
  isOpen: boolean;
  onClose: () => void;
  isActive: boolean;
  onToggle: (active: boolean) => Promise<void>;
}

export default function KillSwitchModal({
  isOpen,
  onClose,
  isActive,
  onToggle,
}: KillSwitchModalProps) {
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState("");

  if (!isOpen) return null;

  const handleAction = async () => {
    setLoading(true);
    try {
      await onToggle(!isActive);
      setConfirmText("");
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const isEngaging = !isActive;
  const canProceed = !isEngaging || confirmText.toUpperCase() === "STOP";

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="w-full max-w-md bg-voltron-900 border border-voltron-rose/50 rounded-xl shadow-2xl p-6 relative animate-in fade-in zoom-in duration-150">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-voltron-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-voltron-rose/15 border border-voltron-rose/30 flex items-center justify-center text-voltron-rose shadow-rose-glow">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white font-mono uppercase">
              {isEngaging ? "EMERGENCY KILL SWITCH" : "RESET KILL SWITCH"}
            </h3>
            <p className="text-xs text-voltron-400 font-mono">
              {isEngaging
                ? "Immediate trading halt and risk containment"
                : "Restore autonomous trading execution"}
            </p>
          </div>
        </div>

        <div className="p-3.5 rounded-lg bg-voltron-850/90 border border-voltron-750 mb-5 text-xs text-voltron-200 font-mono space-y-2">
          {isEngaging ? (
            <>
              <div className="flex items-start gap-2 text-voltron-rose font-bold">
                <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>CRITICAL SAFETY PROTOCOL:</span>
              </div>
              <p>1. Halts autonomous loop and cancels pending paper orders.</p>
              <p>2. Blocks all strategy execution and incoming signals.</p>
              <p>3. Locks risk engine gates until manual operator clearance.</p>
            </>
          ) : (
            <p>
              Resetting will re-enable risk engine evaluation and allow the autonomous agent to resume scanning and paper execution.
            </p>
          )}
        </div>

        {isEngaging && (
          <div className="mb-5">
            <label className="block text-[11px] font-mono text-voltron-400 uppercase mb-1.5">
              Type <span className="text-voltron-rose font-bold">STOP</span> to confirm halt:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="STOP"
              className="w-full bg-voltron-950 border border-voltron-700 focus:border-voltron-rose rounded-lg px-3 py-2 text-sm font-mono text-white outline-none"
            />
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-mono font-bold text-voltron-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={!canProceed || loading}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-xs font-mono font-bold text-white transition-all flex items-center justify-center gap-2",
              isEngaging
                ? canProceed
                  ? "bg-voltron-rose hover:bg-voltron-rose-dark shadow-rose-glow"
                  : "bg-voltron-rose/30 cursor-not-allowed opacity-50"
                : "bg-voltron-emerald hover:bg-voltron-emerald-dark shadow-emerald-glow"
            )}
          >
            {loading ? "Processing..." : isEngaging ? "ENGAGE KILL SWITCH" : "RESET CIRCUIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
