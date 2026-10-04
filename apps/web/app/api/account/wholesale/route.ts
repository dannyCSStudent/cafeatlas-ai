import { NextResponse } from "next/server";
import { getSupabaseAccessToken } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

async function relay(response: Response) {
  const body = await response.text();
  try {
    return NextResponse.json(JSON.parse(body), { status: response.status });
  } catch {
    return NextResponse.json({ detail: body || response.statusText || "Wholesale API request failed" }, { status: response.status });
  }
}

export async function POST(request: Request) {
  const token = await getSupabaseAccessToken();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const response = await fetch(`${API_URL}/api/v1/wholesale/requests`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: await request.text() });
  return relay(response);
}

export async function GET() {
  const token = await getSupabaseAccessToken();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const response = await fetch(`${API_URL}/api/v1/wholesale/requests`, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  return relay(response);
}
