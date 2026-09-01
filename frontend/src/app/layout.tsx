import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${jetbrainsMono.variable} font-sans bg-voltron-900 text-foreground min-h-screen selection:bg-voltron-cyan/20 selection:text-voltron-cyan`}>
        {children}
      </body>
    </html>
  );
}
