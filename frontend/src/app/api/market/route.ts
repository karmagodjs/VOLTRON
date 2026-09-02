import { NextRequest, NextResponse } from "next/server";
import { SUPPORTED_ASSETS, AssetMarketRecord } from "@/lib/marketData";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbolParam = searchParams.get("symbol");
  const allParam = searchParams.get("all");

  if (allParam === "true" || (!symbolParam && searchParams.get("scan") === "true")) {
    const assets = Object.values(SUPPORTED_ASSETS);
    return NextResponse.json({
      count: assets.length,
      assets,
      timestamp: new Date().toISOString(),
    });
  }

  const symbol = (symbolParam || "SPY").toUpperCase();
  const asset = SUPPORTED_ASSETS[symbol];

  if (!asset) {
    return NextResponse.json(
      {
        error: "SYMBOL_NOT_FOUND",
        message: `Market data for symbol '${symbol}' is unavailable. Supported assets: ${Object.keys(SUPPORTED_ASSETS).join(", ")}`,
        symbol,
      },
      { status: 404 }
    );
  }

  const { price, realized_volatility: rv, implied_volatility: iv, iv_rv_ratio: iv_rv } = asset;

  const history = Array.from({ length: 30 }).map((_, i) => ({
    date: `Aug ${i + 1}`,
    price: +(price * 0.96 + (i / 29) * (price * 0.04) + Math.sin(i * 0.7) * (price * 0.005)).toFixed(2),
    rv: +(rv * 0.92 + (i / 29) * (rv * 0.08) + Math.cos(i * 0.5) * 0.4).toFixed(2),
    iv: +(iv * 0.94 + (i / 29) * (iv * 0.06) + Math.sin(i * 0.6) * 0.8).toFixed(2),
    iv_rv: +(iv_rv * 0.95 + (i / 29) * (iv_rv * 0.05)).toFixed(2),
    volume: Math.floor(asset.volume * 0.85 + Math.sin(i) * (asset.volume * 0.2)),
  }));

  return NextResponse.json({
    ...asset,
    last_updated: new Date().toISOString(),
    history,
  });
}
