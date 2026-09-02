import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { MarketProvider } from "@/context/MarketContext";
import { ThemeProvider } from "@/context/ThemeContext";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VOLTRON — Volatility Alpha | Autonomous AI Options Trading",
  description: "Institutional autonomous AI options trading terminal analyzing volatility, selecting defined-risk strategies, and executing paper orders through Alpaca.",
  keywords: ["VOLTRON", "Options Trading", "Volatility Alpha", "AI Quant", "Implied Volatility", "Alpaca Trading", "Iron Condor"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const stored = localStorage.getItem('voltron-theme');
                if (stored === 'light') {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.classList.add('light');
                  document.documentElement.setAttribute('data-theme', 'light');
                } else {
                  document.documentElement.classList.remove('light');
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-voltron-900 text-foreground min-h-screen selection:bg-voltron-cyan/20 selection:text-voltron-cyan`}>
        <ThemeProvider>
          <MarketProvider>{children}</MarketProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
