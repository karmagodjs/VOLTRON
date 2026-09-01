import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({ cycle: 143, status: "STEP_COMPLETE" });
}
