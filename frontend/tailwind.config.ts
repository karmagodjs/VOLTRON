import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/context/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "rgb(var(--background-rgb) / <alpha-value>)",
        foreground: "rgb(var(--foreground-rgb) / <alpha-value>)",
        panel: "rgb(var(--voltron-850-rgb) / <alpha-value>)",
        border: "rgb(var(--voltron-800-rgb) / <alpha-value>)",
        voltron: {
          950: "rgb(var(--voltron-950-rgb) / <alpha-value>)",
          900: "rgb(var(--voltron-900-rgb) / <alpha-value>)",
          850: "rgb(var(--voltron-850-rgb) / <alpha-value>)",
          800: "rgb(var(--voltron-800-rgb) / <alpha-value>)",
          750: "rgb(var(--voltron-750-rgb) / <alpha-value>)",
          700: "rgb(var(--voltron-700-rgb) / <alpha-value>)",
          600: "rgb(var(--voltron-600-rgb) / <alpha-value>)",
          500: "rgb(var(--voltron-500-rgb) / <alpha-value>)",
          400: "rgb(var(--voltron-400-rgb) / <alpha-value>)",
          300: "rgb(var(--voltron-300-rgb) / <alpha-value>)",
          200: "rgb(var(--voltron-200-rgb) / <alpha-value>)",
          100: "rgb(var(--voltron-100-rgb) / <alpha-value>)",
          50: "rgb(var(--voltron-50-rgb) / <alpha-value>)",
          cyan: {
            DEFAULT: "rgb(var(--voltron-cyan-rgb) / <alpha-value>)",
            glow: "var(--voltron-cyan-glow)",
            dim: "var(--voltron-cyan-dim)",
            dark: "var(--voltron-cyan-dark)",
          },
          emerald: {
            DEFAULT: "rgb(var(--voltron-emerald-rgb) / <alpha-value>)",
            glow: "var(--voltron-emerald-glow)",
            dark: "var(--voltron-emerald-dark)",
          },
          rose: {
            DEFAULT: "rgb(var(--voltron-rose-rgb) / <alpha-value>)",
            glow: "var(--voltron-rose-glow)",
            dark: "var(--voltron-rose-dark)",
          },
          amber: {
            DEFAULT: "rgb(var(--voltron-amber-rgb) / <alpha-value>)",
            glow: "var(--voltron-amber-glow)",
            dark: "var(--voltron-amber-dark)",
          },
          violet: {
            DEFAULT: "rgb(var(--voltron-violet-rgb) / <alpha-value>)",
            glow: "var(--voltron-violet-glow)",
            dark: "var(--voltron-violet-dark)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "Geist", "system-ui", "sans-serif"],
        mono: ["var(--font-jetbrains)", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      boxShadow: {
        "cyan-glow": "none",
        "emerald-glow": "none",
        "rose-glow": "none",
        "amber-glow": "none",
        "terminal": "0 4px 12px 0 rgba(0, 0, 0, 0.4)",
        "terminal-light": "0 2px 8px 0 rgba(0, 0, 0, 0.06)",
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanline 10s linear infinite",
        "data-flow": "dataflow 2.5s ease-in-out infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
        dataflow: {
          "0%, 100%": { opacity: "0.2", transform: "scale(0.95)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
