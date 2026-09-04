import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL =
  process.env.BACKEND_URL ||
  process.env.VOLTRON_BACKEND_URL ||
  "http://127.0.0.1:8000";

export async function proxyToBackend(
  request: NextRequest,
  backendPath: string
) {
  const url = new URL(request.url);
  const targetUrl = backendPath.includes("?")
    ? `${BACKEND_URL}${backendPath}`
    : `${BACKEND_URL}${backendPath}${url.search}`;

  try {
    const init: RequestInit = {
      method: request.method,
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    };

    if (request.method !== "GET" && request.method !== "HEAD") {
      try {
        const bodyText = await request.text();
        if (bodyText) {
          init.body = bodyText;
        }
      } catch {

      }
    }

    const resp = await fetch(targetUrl, init);
    const data = await resp.json();
    return NextResponse.json(data, { status: resp.status });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "BACKEND_UNAVAILABLE",
        message: `VOLTRON Python backend is unreachable at ${BACKEND_URL}. Ensure backend is running.`,
        details: err?.message,
      },
      { status: 503 }
    );
  }
}
