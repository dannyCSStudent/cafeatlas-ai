import { NextResponse } from "next/server";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function GET() {
  const response = await fetch(`${API_URL}/api/v1/coffees?page=1&page_size=100&sort=newest`, { cache: "no-store" });
  const body = await response.text();
  try {
    return NextResponse.json(JSON.parse(body), { status: response.status });
  } catch {
    return NextResponse.json({ detail: body || "Could not load coffees" }, { status: response.status });
  }
}
