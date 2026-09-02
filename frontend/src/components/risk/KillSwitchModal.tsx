"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
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

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

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
    <div
      role="dialog"
      aria-label={isEngaging ? "Emergency Kill Switch Modal" : "Reset Kill Switch Modal"}
      aria-modal="true"
      className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-3 sm:p-4"
    >
      <div className="w-full max-w-md bg-voltron-900 border border-voltron-rose/50 rounded-xl shadow-2xl p-4 sm:p-6 relative animate-in fade-in zoom-in duration-150 font-mono">
        <button
          onClick={onClose}
          aria-label="Close modal"
          className="absolute top-4 right-4 text-voltron-400 hover:text-white p-1 rounded transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-4 pr-6">
          <h3 className="text-sm sm:text-base font-bold text-white uppercase tracking-wider">
            {isEngaging ? "EMERGENCY KILL SWITCH" : "RESET KILL SWITCH"}
          </h3>
          <p className="text-[11px] sm:text-xs text-voltron-400 mt-0.5">
            {isEngaging
              ? "Immediate trading halt and risk containment"
              : "Restore autonomous trading execution"}
          </p>
        </div>

        <div className="p-3 sm:p-3.5 rounded-lg bg-voltron-850/90 border border-voltron-750 mb-4 sm:mb-5 text-xs text-voltron-200 space-y-1.5">
          {isEngaging ? (
            <>
              <div className="text-voltron-rose font-bold uppercase tracking-wider text-[11px]">
                CRITICAL SAFETY PROTOCOL:
              </div>
              <p className="text-[11px] leading-relaxed">1. Halts autonomous loop and cancels pending paper orders.</p>
              <p className="text-[11px] leading-relaxed">2. Blocks all strategy execution and incoming signals.</p>
              <p className="text-[11px] leading-relaxed">3. Locks risk engine gates until manual operator clearance.</p>
            </>
          ) : (
            <p className="text-[11px] leading-relaxed">
              Resetting will re-enable risk engine evaluation and allow the autonomous agent to resume scanning and paper execution.
            </p>
          )}
        </div>

        {isEngaging && (
          <div className="mb-4 sm:mb-5">
            <label className="block text-[10px] sm:text-[11px] text-voltron-400 uppercase mb-1.5">
              Type <span className="text-voltron-rose font-bold">STOP</span> to confirm halt:
            </label>
            <input
              type="text"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder="STOP"
              className="w-full bg-voltron-950 border border-voltron-700 focus:border-voltron-rose rounded-lg px-3 py-2 text-xs sm:text-sm text-white outline-none"
            />
          </div>
        )}

        <div className="flex gap-2.5 sm:gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg bg-voltron-800 hover:bg-voltron-750 text-xs font-bold text-voltron-300 transition-colors min-h-[40px]"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            disabled={!canProceed || loading}
            className={clsx(
              "flex-1 py-2.5 rounded-lg text-xs font-bold text-white transition-all flex items-center justify-center gap-2 min-h-[40px]",
              isEngaging
                ? canProceed
                  ? "bg-voltron-rose hover:bg-voltron-rose-dark"
                  : "bg-voltron-rose/30 cursor-not-allowed opacity-50"
                : "bg-voltron-emerald hover:bg-voltron-emerald-dark"
            )}
          >
            {loading ? "Processing..." : isEngaging ? "ENGAGE KILL SWITCH" : "RESET CIRCUIT"}
          </button>
        </div>
      </div>
    </div>
  );
}
