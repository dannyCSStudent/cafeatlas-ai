import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { getAuthCookieNames } from "@/lib/supabase-auth";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const token = (await cookies()).get(getAuthCookieNames().accessToken)?.value;
  if (!token) return NextResponse.json({ detail: "Authentication required" }, { status: 401 });
  const { id } = await context.params;
  const response = await fetch(`${API_URL}/api/v1/admin/gift-requests/${id}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }, body: await request.text() });
  return NextResponse.json(await response.json(), { status: response.status });
}
