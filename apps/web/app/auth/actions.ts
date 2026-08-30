"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  getAuthCookieNames,
  getDefaultSessionAge,
  requestPasswordResetEmail,
  refreshSupabaseSession,
  updateSupabaseProfile,
  updateSupabasePassword,
  signInWithPassword,
  signOutSupabaseSession,
  signUpWithPassword,
} from "@/lib/supabase-auth";
import { authInitialState, type AuthFormState } from "@/app/auth/types";

function normalizeValue(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value.trim() : "";
}

async function setSessionCookies(accessToken: string, refreshToken: string, expiresIn: number) {
  const cookieStore = await cookies();
  const { accessToken: accessTokenCookie, refreshToken: refreshTokenCookie } = getAuthCookieNames();
  const baseOptions = {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  cookieStore.set(accessTokenCookie, accessToken, {
    ...baseOptions,
    maxAge: Math.max(expiresIn, 60),
  });

  cookieStore.set(refreshTokenCookie, refreshToken, {
    ...baseOptions,
    maxAge: getDefaultSessionAge(),
  });
}

async function clearSessionCookies() {
  const cookieStore = await cookies();
  const { accessToken: accessTokenCookie, refreshToken: refreshTokenCookie } = getAuthCookieNames();
  cookieStore.delete(accessTokenCookie);
  cookieStore.delete(refreshTokenCookie);
}

export async function signInAction(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeValue(formData.get("email")).toLowerCase();
  const password = normalizeValue(formData.get("password"));

  if (!email || !password) {
    return {
      tone: "error",
      message: "Enter both an email address and password.",
    };
  }

  let session: Awaited<ReturnType<typeof signInWithPassword>> | null = null;
  try {
    session = await signInWithPassword(email, password);
  } catch (error) {
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to sign in right now.",
    };
  }

  if (!session) {
    return {
      tone: "error",
      message: "Unable to sign in right now.",
    };
  }

  await setSessionCookies(session.access_token, session.refresh_token, session.expires_in);
  redirect("/account");
}

export async function signUpAction(_previousState: AuthFormState, formData: FormData): Promise<AuthFormState> {
  const email = normalizeValue(formData.get("email")).toLowerCase();
  const password = normalizeValue(formData.get("password"));

  if (!email || !password) {
    return {
      tone: "error",
      message: "Enter both an email address and password.",
    };
  }

  let response: Awaited<ReturnType<typeof signUpWithPassword>> | null = null;
  try {
    const headerStore = await headers();
    const origin = headerStore.get("origin") ?? "";
    const redirectTo = origin ? new URL("/", origin).toString() : undefined;
    response = await signUpWithPassword(email, password, redirectTo);
  } catch (error) {
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to create the account right now.",
    };
  }

  if (!response) {
    return {
      tone: "error",
      message: "Unable to create the account right now.",
    };
  }

  if (response.session) {
    await setSessionCookies(response.session.access_token, response.session.refresh_token, response.session.expires_in);
    redirect("/account");
  }

  return {
    tone: "success",
    message: "Check your inbox for a confirmation email, then sign in once the address is verified.",
  };
}

export async function requestPasswordResetAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const email = normalizeValue(formData.get("email")).toLowerCase();

  if (!email) {
    return {
      tone: "error",
      message: "Enter the email address for the account.",
    };
  }

  try {
    const headerStore = await headers();
    const origin = headerStore.get("origin") ?? "";
    const redirectTo = origin ? new URL("/auth/reset-password/confirm", origin).toString() : undefined;
    await requestPasswordResetEmail(email, redirectTo);
  } catch (error) {
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to send a reset email right now.",
    };
  }

  return {
    tone: "success",
    message: "Check your inbox for the password reset link.",
  };
}

export async function updatePasswordAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const password = normalizeValue(formData.get("password"));
  const confirmPassword = normalizeValue(formData.get("confirm_password"));

  if (!password || !confirmPassword) {
    return {
      tone: "error",
      message: "Enter and confirm your new password.",
    };
  }

  if (password !== confirmPassword) {
    return {
      tone: "error",
      message: "The passwords do not match.",
    };
  }

  const cookieStore = await cookies();
  const { accessToken: accessTokenCookie } = getAuthCookieNames();
  const accessToken = cookieStore.get(accessTokenCookie)?.value;

  if (!accessToken) {
    return {
      tone: "error",
      message: "Your reset session is missing. Request a new password reset link.",
    };
  }

  try {
    await updateSupabasePassword(accessToken, password);
  } catch (error) {
    await clearSessionCookies();
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to update the password right now.",
    };
  }

  redirect("/account");
}

export async function updateProfileAction(
  _previousState: AuthFormState,
  formData: FormData
): Promise<AuthFormState> {
  const displayName = normalizeValue(formData.get("display_name"));

  const cookieStore = await cookies();
  const { accessToken: accessTokenCookie } = getAuthCookieNames();
  const accessToken = cookieStore.get(accessTokenCookie)?.value;

  if (!accessToken) {
    return {
      tone: "error",
      message: "Your session expired. Sign in again to update your profile.",
    };
  }

  try {
    await updateSupabaseProfile(accessToken, {
      display_name: displayName || null,
    });
  } catch (error) {
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to update the profile right now.",
    };
  }

  return {
    tone: "success",
    message: "Profile updated.",
  };
}

export async function signOutAction() {
  const cookieStore = await cookies();
  const { accessToken: accessTokenCookie } = getAuthCookieNames();
  const accessToken = cookieStore.get(accessTokenCookie)?.value;

  if (accessToken) {
    await signOutSupabaseSession(accessToken);
  }

  await clearSessionCookies();
  redirect("/");
}

export async function refreshSessionAction(): Promise<AuthFormState> {
  const cookieStore = await cookies();
  const { refreshToken: refreshTokenCookie } = getAuthCookieNames();
  const refreshToken = cookieStore.get(refreshTokenCookie)?.value;

  if (!refreshToken) {
    return authInitialState;
  }

  try {
    const session = await refreshSupabaseSession(refreshToken);
    await setSessionCookies(session.access_token, session.refresh_token, session.expires_in);
    return {
      tone: "success",
      message: "Session refreshed.",
    };
  } catch (error) {
    await clearSessionCookies();
    return {
      tone: "error",
      message: error instanceof Error ? error.message : "Unable to refresh the session.",
    };
  }
}
