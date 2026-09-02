"use client";

import React, { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import clsx from "clsx";
import { useTheme } from "@/context/ThemeContext";

interface ThemeToggleProps {
  className?: string;
  variant?: "icon" | "pill" | "text";
}

export default function ThemeToggle({
  className,
  variant = "pill",
}: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={clsx(
          "inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-voltron-900 border border-voltron-800 text-xs font-mono text-voltron-400 opacity-60",
          className
        )}
      >
        <Moon className="w-3.5 h-3.5" />
        <span className="text-[10px] uppercase tracking-wider">DARK</span>
      </div>
    );
  }

  const isDark = theme === "dark";

  if (variant === "icon") {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
        title={isDark ? "Switch to light theme" : "Switch to dark theme"}
        className={clsx(
          "p-1.5 rounded transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan",
          "text-voltron-400 hover:text-white hover:bg-voltron-800",
          className
        )}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-voltron-amber" />
        ) : (
          <Moon className="w-4 h-4 text-voltron-cyan" />
        )}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      className={clsx(
        "group relative inline-flex items-center gap-1.5 px-2.5 py-1 rounded border transition-all duration-200 font-mono text-[10px] tracking-wider uppercase font-semibold select-none",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-voltron-cyan active:scale-[0.98]",
        isDark
          ? "bg-voltron-900 hover:bg-voltron-850 border-voltron-800 text-voltron-300 hover:text-white"
          : "bg-voltron-850 hover:bg-voltron-800 border-voltron-750 text-voltron-400 hover:text-voltron-100",
        className
      )}
    >
      <span className="flex items-center gap-1">
        {isDark ? (
          <>
            <Moon className="w-3 h-3 text-voltron-cyan" />
            <span>DARK</span>
          </>
        ) : (
          <>
            <Sun className="w-3 h-3 text-voltron-amber" />
            <span>LIGHT</span>
          </>
        )}
      </span>
      <span className="text-[8px] text-voltron-500 group-hover:text-voltron-400 border-l border-voltron-750 pl-1.5 ml-0.5">
        TOGGLE
      </span>
    </button>
  );
}
