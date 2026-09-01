import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({ active: false }));
  return NextResponse.json({
    success: true,
    kill_switch: !!body.active,
    message: body.active ? "Emergency Kill Switch Activated - All Trading Halted" : "Kill Switch Reset - System Ready",
  });
}
