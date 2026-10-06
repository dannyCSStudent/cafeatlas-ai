import { NextResponse } from "next/server";

import { getSupabaseAccessToken } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  const token = await getSupabaseAccessToken();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const response = await fetch(`${API_URL}/api/v1/admin/analytics/customer`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  const body = await response.text();
  try {
    return NextResponse.json(JSON.parse(body), { status: response.status });
  } catch {
    return NextResponse.json({ detail: body || response.statusText || "Customer analytics request failed" }, { status: response.status });
  }
}
