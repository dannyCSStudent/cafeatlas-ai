import { NextResponse } from "next/server";

import { getSupabaseAccessToken } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

async function requestContext() {
  return getSupabaseAccessToken();
}

export async function GET(_request: Request, { params }: { params: Promise<{ coffeeId: string }> }) {
  const { coffeeId } = await params;
  const response = await fetch(`${API_URL}/api/v1/coffees/${coffeeId}/reviews`, { cache: "no-store" });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function POST(request: Request, { params }: { params: Promise<{ coffeeId: string }> }) {
  const token = await requestContext();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { coffeeId } = await params;
  const response = await fetch(`${API_URL}/api/v1/coffees/${coffeeId}/reviews`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: await request.text() });
  return NextResponse.json(await response.json(), { status: response.status });
}
