import { Platform } from "react-native";

import * as SecureStore from "expo-secure-store";

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

export type MobileAuthSnapshot = {
  session: SupabaseAuthSession;
  user: SupabaseAuthUser;
};

type SupabaseAuthConfig = {
  url: string;
  anonKey: string;
};

const SESSION_KEY = "cafeatlas_mobile_supabase_session";
const DEFAULT_WEB_API_URL = "http://127.0.0.1:8000";
const DEFAULT_NATIVE_API_URL = "http://10.0.2.2:8000";

function getSupabaseAuthConfig(): SupabaseAuthConfig | null {
  const url =
    process.env.EXPO_PUBLIC_CAFEATLAS_SUPABASE_URL ??
    process.env.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey =
    process.env.EXPO_PUBLIC_CAFEATLAS_SUPABASE_ANON_KEY ??
    process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    return null;
  }

  return {
    url: url.replace(/\/$/, ""),
    anonKey,
  };
}

function buildHeaders(anonKey: string, token?: string) {
  const headers: Record<string, string> = {
    apikey: anonKey,
    "Content-Type": "application/json",
  };

  headers.Authorization = token ? `Bearer ${token}` : `Bearer ${anonKey}`;
  return headers;
}

function getErrorStatus(error: unknown) {
  if (typeof error === "object" && error && "status" in error) {
    const status = (error as { status?: unknown }).status;
    return typeof status === "number" ? status : null;
  }

  return null;
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message.toLowerCase() : "";
}

function isStaleSessionError(error: unknown) {
  const status = getErrorStatus(error);
  const message = getErrorMessage(error);

  return (
    status === 400 ||
    status === 401 ||
    status === 403 ||
    status === 422 ||
    message.includes("invalid jwt") ||
    message.includes("jwt expired") ||
    message.includes("token is expired") ||
    message.includes("token has expired") ||
    message.includes("signature") ||
    message.includes("expired")
  );
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
    const error = new Error(message) as Error & { status?: number };
    error.status = response.status;
    return error;
  } catch {
    const error = new Error(fallback) as Error & { status?: number };
    error.status = response.status;
    return error;
  }
}

async function requestAuth<T>(path: string, init: RequestInit = {}): Promise<T> {
  const config = getSupabaseAuthConfig();
  if (!config) {
    throw new Error("Supabase auth is not configured for the mobile app.");
  }

  const response = await fetch(new URL(path, config.url), {
    cache: "no-store",
    ...init,
    headers: {
      ...buildHeaders(config.anonKey),
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

async function readStorageValue(key: string) {
  if (Platform.OS === "web") {
    try {
      return window.localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  return SecureStore.getItemAsync(key);
}

async function writeStorageValue(key: string, value: string) {
  if (Platform.OS === "web") {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      // Ignore storage failures on web; the session can still work for the current run.
    }
    return;
  }

  await SecureStore.setItemAsync(key, value);
}

async function deleteStorageValue(key: string) {
  if (Platform.OS === "web") {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Ignore storage failures on web.
    }
    return;
  }

  await SecureStore.deleteItemAsync(key);
}

async function readStoredSession(): Promise<SupabaseAuthSession | null> {
  const raw = await readStorageValue(SESSION_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as SupabaseAuthSession;
  } catch {
    await deleteStorageValue(SESSION_KEY);
    return null;
  }
}

async function saveSession(session: SupabaseAuthSession) {
  await writeStorageValue(SESSION_KEY, JSON.stringify(session));
}

export async function clearStoredSession() {
  await deleteStorageValue(SESSION_KEY);
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

export async function signOutSupabaseSession(accessToken: string) {
  const config = getSupabaseAuthConfig();
  if (!config) {
    return;
  }

  await fetch(new URL("/auth/v1/logout", config.url), {
    method: "POST",
    cache: "no-store",
    headers: buildHeaders(config.anonKey, accessToken),
  }).catch(() => undefined);
}

export async function persistAuthSession(session: SupabaseAuthSession) {
  await saveSession(session);
}

export async function hydrateMobileSession(): Promise<MobileAuthSnapshot | null> {
  const storedSession = await readStoredSession();

  if (!storedSession) {
    return null;
  }

  try {
    const user = await getSupabaseUser(storedSession.access_token);
    return { session: storedSession, user };
  } catch (error) {
    if (!isStaleSessionError(error)) {
      throw error;
    }

    try {
      const refreshedSession = await refreshSupabaseSession(storedSession.refresh_token);
      await saveSession(refreshedSession);
      const user = await getSupabaseUser(refreshedSession.access_token);
      return { session: refreshedSession, user };
    } catch (refreshError) {
      const status = getErrorStatus(refreshError);
      if (status === 400 || status === 401 || status === 403) {
        await clearStoredSession();
        return null;
      }

      throw refreshError;
    }
  }
}

export async function signOutMobileSession(accessToken?: string | null) {
  if (accessToken) {
    await signOutSupabaseSession(accessToken);
  }

  await clearStoredSession();
}

export function getMobileSupabaseConfig() {
  return getSupabaseAuthConfig();
}

export function getMobileApiBaseUrl() {
  if (Platform.OS === "web") {
    return process.env.EXPO_PUBLIC_CAFEATLAS_API_URL_WEB ?? process.env.EXPO_PUBLIC_CAFEATLAS_API_URL ?? DEFAULT_WEB_API_URL;
  }

  return process.env.EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE ?? process.env.EXPO_PUBLIC_CAFEATLAS_API_URL ?? DEFAULT_NATIVE_API_URL;
}
