import { NextResponse } from "next/server";

import { getSupabaseAccessToken } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

async function getToken() {
  return getSupabaseAccessToken();
}

export async function PUT(_request: Request, context: { params: Promise<{ coffeeId: string }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { coffeeId } = await context.params;
  const response = await fetch(`${API_URL}/api/v1/wishlist/${coffeeId}`, { method: "PUT", headers: { Authorization: `Bearer ${token}` } });
  return NextResponse.json(await response.json(), { status: response.status });
}

export async function DELETE(_request: Request, context: { params: Promise<{ coffeeId: string }> }) {
  const token = await getToken();
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { coffeeId } = await context.params;
  const response = await fetch(`${API_URL}/api/v1/wishlist/${coffeeId}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
  if (response.status === 204) return new NextResponse(null, { status: 204 });
  return NextResponse.json(await response.json(), { status: response.status });
}
