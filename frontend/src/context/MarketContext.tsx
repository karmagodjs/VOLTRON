"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { SUPPORTED_ASSETS, AssetMarketRecord } from "@/lib/marketData";

export const SUPPORTED_SYMBOLS = ["SPY", "QQQ", "IWM", "NVDA", "AAPL", "TSLA", "MSFT", "AMZN"] as const;
export type SupportedSymbol = typeof SUPPORTED_SYMBOLS[number];

export interface CanonicalMarketState {
  symbol: string;
  name: string;
  price: number;
  change: number;
  change_percent: number;
  realized_volatility: number;
  implied_volatility: number;
  iv_rv_ratio: number;
  iv_premium: number;
  market_regime: string;
  vol_signal: "EXPENSIVE" | "CHEAP" | "FAIR";
  opportunity_score: number;
  strategy: string;
  market_status: string;
  timestamp: string;
  history?: any[];
}

interface MarketContextType {
  selectedSymbol: string;
  setSelectedSymbol: (symbol: string, updateUrl?: boolean) => void;
  marketData: CanonicalMarketState | null;
  allAssets: AssetMarketRecord[];
  isLoading: boolean;
  error: string | null;
  refreshMarketData: () => Promise<void>;
  getLinkWithSymbol: (path: string, sym?: string) => string;
}

const MarketContext = createContext<MarketContextType | undefined>(undefined);

const STORAGE_KEY = "voltron_selected_symbol";

function MarketProviderInner({ children }: { children: React.ReactNode }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const querySymbol = searchParams.get("symbol")?.toUpperCase();

  const [selectedSymbol, setSelectedSymbolState] = useState<string>(() => {
    if (querySymbol && SUPPORTED_SYMBOLS.includes(querySymbol as any)) {
      return querySymbol;
    }
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY)?.toUpperCase();
      if (stored && SUPPORTED_SYMBOLS.includes(stored as any)) {
        return stored;
      }
    }
    return "SPY";
  });

  const [marketData, setMarketData] = useState<CanonicalMarketState | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (querySymbol && SUPPORTED_SYMBOLS.includes(querySymbol as any) && querySymbol !== selectedSymbol) {
      setSelectedSymbolState(querySymbol);
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, querySymbol);
      }
    }
  }, [querySymbol, selectedSymbol]);

  const fetchCurrentMarketData = useCallback(async (sym: string) => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/market?symbol=${sym}`);
      if (!res.ok) {
        throw new Error(`Market data service unavailable for ${sym}`);
      }
      const data = await res.json();
      setMarketData(data);
      setError(null);
    } catch (err: any) {
      setMarketData(null);
      setError(err?.message || "Market data service temporarily unavailable");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCurrentMarketData(selectedSymbol);
    const interval = setInterval(() => {
      fetchCurrentMarketData(selectedSymbol);
    }, 10000);
    return () => clearInterval(interval);
  }, [selectedSymbol, fetchCurrentMarketData]);

  const setSelectedSymbol = useCallback((newSymbol: string, updateUrl = true) => {
    const upper = newSymbol.toUpperCase();
    if (!SUPPORTED_SYMBOLS.includes(upper as any)) {
      return;
    }

    setMarketData(null);
    setIsLoading(true);
    setSelectedSymbolState(upper);

    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, upper);
    }

    if (updateUrl && pathname) {
      const currentParams = new URLSearchParams(searchParams ? searchParams.toString() : "");
      currentParams.set("symbol", upper);
      router.replace(`${pathname}?${currentParams.toString()}`, { scroll: false });
    }
  }, [pathname, searchParams, router]);

  const getLinkWithSymbol = useCallback((path: string, sym?: string) => {
    const targetSym = (sym || selectedSymbol).toUpperCase();
    return `${path}?symbol=${targetSym}`;
  }, [selectedSymbol]);

  const value: MarketContextType = {
    selectedSymbol,
    setSelectedSymbol,
    marketData,
    allAssets: Object.values(SUPPORTED_ASSETS),
    isLoading,
    error,
    refreshMarketData: () => fetchCurrentMarketData(selectedSymbol),
    getLinkWithSymbol,
  };

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function MarketProvider({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <MarketProviderInner>{children}</MarketProviderInner>
    </Suspense>
  );
}

export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket must be used within a MarketProvider");
  }
  return context;
}
