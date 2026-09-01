import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ status: "STOPPED", message: "Autonomous agent stopped." });
}
