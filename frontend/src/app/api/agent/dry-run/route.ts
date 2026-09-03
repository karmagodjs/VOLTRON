import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "SPY";
  return proxyToBackend(request, `/api/agent/dry-run?symbol=${symbol}`);
}

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get("symbol") || "SPY";
  return proxyToBackend(request, `/api/agent/dry-run?symbol=${symbol}`);
}
