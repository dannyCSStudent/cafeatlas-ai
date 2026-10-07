import { NextResponse } from "next/server";

import { getSupabaseAccessToken } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const token = await getSupabaseAccessToken();
  if (!token) return NextResponse.json({ detail: "Sign in before using voice input." }, { status: 401 });
  const body = await request.arrayBuffer();
  const response = await fetch(`${API_URL}/api/v1/ai/transcribe`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": request.headers.get("content-type") ?? "application/octet-stream" },
    body,
  });
  const responseBody = await response.text();
  try {
    return NextResponse.json(JSON.parse(responseBody), { status: response.status });
  } catch {
    return NextResponse.json({ detail: responseBody || response.statusText || "Voice transcription failed" }, { status: response.status });
  }
}
