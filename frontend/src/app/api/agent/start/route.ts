import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ status: "ACTIVE", message: "Autonomous agent started." });
}
