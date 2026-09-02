import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#08090C",
        foreground: "#EDEDED",
        voltron: {
          950: "#050608",
          900: "#08090C",
          850: "#0D1017",
          800: "#131722",
          750: "#181E2C",
          700: "#1E2638",
          600: "#2B364F",
          500: "#3F4E70",
          400: "#6B7C9E",
          300: "#9BA8C4",
          200: "#C7D0E3",
          100: "#E3E8F3",
          50: "#F4F6FB",
          cyan: {
            DEFAULT: "#00F0FF",
            glow: "rgba(0, 240, 255, 0.25)",
            dim: "#00B4D8",
            dark: "#005F73",
          },
          emerald: {
            DEFAULT: "#00E676",
            glow: "rgba(0, 230, 118, 0.25)",
            dark: "#008744",
          },
          rose: {
            DEFAULT: "#FF3B30",
            glow: "rgba(255, 59, 48, 0.25)",
            dark: "#9E1912",
          },
          amber: {
            DEFAULT: "#FFB300",
            glow: "rgba(255, 179, 0, 0.25)",
            dark: "#B27B00",
          },
          violet: {
            DEFAULT: "#8B5CF6",
            glow: "rgba(139, 92, 246, 0.25)",
            dark: "#5B21B6",
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
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "scan-line": "scanline 8s linear infinite",
      },
      keyframes: {
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(1000%)" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
