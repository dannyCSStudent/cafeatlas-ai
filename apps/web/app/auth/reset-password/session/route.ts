import { NextResponse } from "next/server";

import { getAuthCookieNames, getDefaultSessionAge } from "@/lib/supabase-auth";

type RecoverySessionPayload = {
  accessToken?: unknown;
  refreshToken?: unknown;
  expiresIn?: unknown;
};

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as RecoverySessionPayload | null;
  const accessToken = typeof payload?.accessToken === "string" ? payload.accessToken.trim() : "";
  const refreshToken = typeof payload?.refreshToken === "string" ? payload.refreshToken.trim() : "";
  const expiresIn =
    typeof payload?.expiresIn === "number" && Number.isFinite(payload.expiresIn) ? payload.expiresIn : null;

  if (!accessToken || !refreshToken) {
    return NextResponse.json({ error: "Missing recovery session." }, { status: 400 });
  }

  const { accessToken: accessTokenCookie, refreshToken: refreshTokenCookie } = getAuthCookieNames();
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  const response = NextResponse.json({ ok: true });
  response.cookies.set(accessTokenCookie, accessToken, {
    ...baseOptions,
    maxAge: Math.max(expiresIn ?? 3600, 60),
  });
  response.cookies.set(refreshTokenCookie, refreshToken, {
    ...baseOptions,
    maxAge: getDefaultSessionAge(),
  });

  return response;
}
