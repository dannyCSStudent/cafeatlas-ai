import { cookies } from "next/headers";

type SupabaseAuthConfig = {
  url: string;
  anonKey: string;
};

export type SupabaseAuthUser = {
  id: string;
  email: string | null;
  created_at: string;
  confirmed_at?: string | null;
  email_confirmed_at?: string | null;
  last_sign_in_at?: string | null;
  role?: string | null;
  user_metadata?: Record<string, unknown>;
  app_metadata?: Record<string, unknown>;
};

export type SupabaseAuthSession = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  user: SupabaseAuthUser;
};

export type SupabaseOtpType = "email" | "recovery" | "invite" | "email_change" | "magiclink";

const ACCESS_TOKEN_COOKIE = "cafeatlas_supabase_access_token";
const REFRESH_TOKEN_COOKIE = "cafeatlas_supabase_refresh_token";
const DEFAULT_SESSION_AGE = 60 * 60 * 24 * 30;

function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const url =
    process.env.CAFEATLAS_SUPABASE_URL ??
    process.env.NEXT_PUBLIC_CAFEATLAS_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL;
  const anonKey =
    process.env.CAFEATLAS_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
  };
}

function buildAuthHeaders(anonKey: string, token?: string) {
  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  } else {
    headers.Authorization = `Bearer ${anonKey}`;
  }

  return headers;
}

async function parseAuthError(response: Response) {
  const fallback = `Supabase auth request failed (${response.status})`;

  try {
    const payload = (await response.json()) as Record<string, unknown>;
    const message =
      typeof payload.error_description === "string"
        ? payload.error_description
        : typeof payload.msg === "string"
          ? payload.msg
          : typeof payload.message === "string"
            ? payload.message
            : typeof payload.error === "string"
              ? payload.error
              : fallback;
    return new Error(message);
  } catch {
    return new Error(fallback);
  }
}

async function requestAuth<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseAuthConfig();
  if (!config) {
    throw new Error("Supabase auth is not configured for the web app.");
  }

  const response = await fetch(new URL(path, config.url), {
    cache: "no-store",
    ...init,
    headers: {
      ...buildAuthHeaders(config.anonKey),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await parseAuthError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

async function requestAuthWithToken<T>(path: string, accessToken: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseAuthConfig();
  if (!config) {
    throw new Error("Supabase auth is not configured for the web app.");
  }

  const response = await fetch(new URL(path, config.url), {
    cache: "no-store",
    ...init,
    headers: {
      ...buildAuthHeaders(config.anonKey, accessToken),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw await parseAuthError(response);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export async function signInWithPassword(email: string, password: string) {
  return requestAuth<SupabaseAuthSession>("/auth/v1/token?grant_type=password", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function signUpWithPassword(email: string, password: string, redirectTo?: string) {
  return requestAuth<{ user: SupabaseAuthUser | null; session: SupabaseAuthSession | null }>(
    "/auth/v1/signup",
    {
      method: "POST",
      body: JSON.stringify({
        email,
        password,
        options: redirectTo ? { emailRedirectTo: redirectTo } : undefined,
      }),
    }
  );
}

export async function requestPasswordResetEmail(email: string, redirectTo?: string) {
  const config = getSupabaseAuthConfig();
  if (!config) {
    throw new Error("Supabase auth is not configured for the web app.");
  }

  const url = new URL("/auth/v1/recover", config.url);
  if (redirectTo) {
    url.searchParams.set("redirect_to", redirectTo);
  }

  return requestAuth<unknown>(url.pathname + url.search, {
    method: "POST",
    body: JSON.stringify({ email }),
  });
}

export async function verifySupabaseOtp(
  tokenHash: string,
  type: SupabaseOtpType,
  email?: string
) {
  return requestAuth<SupabaseAuthSession>("/auth/v1/verify", {
    method: "POST",
    body: JSON.stringify({
      token_hash: tokenHash,
      type,
      ...(email ? { email } : {}),
    }),
  });
}

export async function refreshSupabaseSession(refreshToken: string) {
  return requestAuth<SupabaseAuthSession>("/auth/v1/token?grant_type=refresh_token", {
    method: "POST",
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
}

export async function getSupabaseUser(accessToken: string) {
  return requestAuth<SupabaseAuthUser>("/auth/v1/user", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
}

export async function updateSupabasePassword(accessToken: string, password: string) {
  return requestAuthWithToken<unknown>("/auth/v1/user", accessToken, {
    method: "PUT",
    body: JSON.stringify({ password }),
  });
}

export async function updateSupabaseProfile(accessToken: string, data: Record<string, unknown>) {
  return requestAuthWithToken<SupabaseAuthUser>("/auth/v1/user", accessToken, {
    method: "PUT",
    body: JSON.stringify({ data }),
  });
}

export async function signOutSupabaseSession(accessToken: string) {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return;
  }

  await fetch(new URL("/auth/v1/logout", config.url), {
    method: "POST",
    cache: "no-store",
    headers: buildAuthHeaders(config.anonKey, accessToken),
  }).catch(() => undefined);
}

export async function getCurrentSupabaseUser() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
    if (!accessToken) {
      return null;
    }

    return await getSupabaseUser(accessToken);
  } catch {
    return null;
  }
}

export function getAuthCookieNames() {
  return {
    accessToken: ACCESS_TOKEN_COOKIE,
    refreshToken: REFRESH_TOKEN_COOKIE,
  };
}

export function getDefaultSessionAge() {
  return DEFAULT_SESSION_AGE;
}
