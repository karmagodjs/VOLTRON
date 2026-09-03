import { NextRequest } from "next/server";
import { proxyToBackend } from "@/lib/backendProxy";

export async function GET(request: NextRequest) {
  return proxyToBackend(request, "/api/agent/dry-run");
}

export async function POST(request: NextRequest) {
  return proxyToBackend(request, "/api/agent/dry-run");
}
