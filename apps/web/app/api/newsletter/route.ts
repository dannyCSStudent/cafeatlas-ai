import { NextResponse } from "next/server";

const API_URL = process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000";

export async function POST(request: Request) {
  try {
    const response = await fetch(`${API_URL}/api/v1/newsletter/subscribe`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: await request.text(),
      cache: "no-store",
    });
    const body = await response.text();
    const contentType = response.headers.get("content-type") ?? "application/json";
    return new NextResponse(body, { status: response.status, headers: { "content-type": contentType } });
  } catch {
    return NextResponse.json({ detail: "Newsletter service is temporarily unavailable." }, { status: 503 });
  }
}
