import { NextResponse } from "next/server";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  const response = await fetch(`${API_URL}/api/v1/affiliate/click`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: await request.text(),
  });
  return new NextResponse(null, { status: response.status });
}
