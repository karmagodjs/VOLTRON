"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextType {
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "voltron-theme";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>("dark");

  useEffect(() => {
    try {
      const stored = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null;
      if (stored === "light" || stored === "dark") {
        setThemeState(stored);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(stored);
        document.documentElement.setAttribute("data-theme", stored);
      } else {

        document.documentElement.classList.remove("light");
        document.documentElement.classList.add("dark");
        document.documentElement.setAttribute("data-theme", "dark");
      }
    } catch {

    }
  }, []);

  const setTheme = useCallback((newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, newTheme);
      document.documentElement.classList.remove("dark", "light");
      document.documentElement.classList.add(newTheme);
      document.documentElement.setAttribute("data-theme", newTheme);
    } catch {

    }
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => {
      const nextTheme = prev === "dark" ? "light" : "dark";
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
        document.documentElement.classList.remove("dark", "light");
        document.documentElement.classList.add(nextTheme);
        document.documentElement.setAttribute("data-theme", nextTheme);
      } catch {

      }
      return nextTheme;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
