import { NextResponse } from "next/server";

import { getAuthCookieNames, getDefaultSessionAge, verifySupabaseOtp } from "@/lib/supabase-auth";

function buildErrorRedirect(requestUrl: URL, message: string) {
  const redirectUrl = new URL("/auth", requestUrl);
  redirectUrl.searchParams.set("error", message);
  return redirectUrl;
}

async function setAuthSessionCookies(response: NextResponse, accessToken: string, refreshToken: string, expiresIn: number) {
  const { accessToken: accessTokenCookie, refreshToken: refreshTokenCookie } = getAuthCookieNames();
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  response.cookies.set(accessTokenCookie, accessToken, {
    ...baseOptions,
    maxAge: Math.max(expiresIn, 60),
  });

  response.cookies.set(refreshTokenCookie, refreshToken, {
    ...baseOptions,
    maxAge: getDefaultSessionAge(),
  });
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash")?.trim() ?? "";
  const type = requestUrl.searchParams.get("type")?.trim();
  const next = requestUrl.searchParams.get("next")?.trim();

  if (!tokenHash) {
    return NextResponse.redirect(buildErrorRedirect(requestUrl, "The confirmation link is missing a token."));
  }

  if (type !== "email") {
    return NextResponse.redirect(buildErrorRedirect(requestUrl, "This confirmation link is not supported."));
  }

  try {
    const session = await verifySupabaseOtp(tokenHash, type);
    const redirectUrl = next ? new URL(next, requestUrl) : new URL("/account", requestUrl);
    const response = NextResponse.redirect(redirectUrl);
    await setAuthSessionCookies(response, session.access_token, session.refresh_token, session.expires_in);
    return response;
  } catch (error) {
    const message = error instanceof Error && error.message ? error.message : "Unable to confirm the account.";
    const friendlyMessage = message.toLowerCase().includes("expired")
      ? "This confirmation link has expired. Request a new signup email."
      : "Unable to confirm the account. Request a new signup email.";
    return NextResponse.redirect(buildErrorRedirect(requestUrl, friendlyMessage));
  }
}
