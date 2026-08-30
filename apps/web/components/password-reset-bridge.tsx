"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type RecoveryPayload = {
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
};

function readRecoveryPayload(): RecoveryPayload | null {
  if (typeof window === "undefined") {
    return null;
  }

  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const query = new URLSearchParams(window.location.search);
  const read = (name: string) => hash.get(name) ?? query.get(name);

  const accessToken = read("access_token");
  const refreshToken = read("refresh_token");
  const expiresIn = read("expires_in");

  if (accessToken && refreshToken) {
    return {
      accessToken,
      refreshToken,
      expiresIn: expiresIn ? Number.parseInt(expiresIn, 10) : undefined,
    };
  }

  return null;
}

export function PasswordResetBridge() {
  const router = useRouter();
  const [message, setMessage] = useState("Finalizing the password reset session...");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function syncSession() {
      const errorCode = new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_code");
      const errorDescription =
        new URLSearchParams(window.location.hash.replace(/^#/, "")).get("error_description") ??
        new URLSearchParams(window.location.search).get("error_description");

      if (errorCode || errorDescription) {
        if (!cancelled) {
          setError(errorDescription || "Password reset failed.");
          setMessage("Unable to finalize the reset link.");
        }
        return;
      }

      const payload = readRecoveryPayload();
      if (!payload) {
        if (!cancelled) {
          setError("The reset link is missing a recovery session.");
          setMessage("Unable to finalize the reset link.");
        }
        return;
      }

      try {
        const response = await fetch("/auth/reset-password/session", {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            expiresIn: payload.expiresIn,
          }),
        });

        if (!response.ok) {
          const payloadBody = (await response.json().catch(() => null)) as { error?: string } | null;
          throw new Error(payloadBody?.error ?? "Unable to store the reset session.");
        }

        if (!cancelled) {
          router.replace("/auth/reset-password/new");
          router.refresh();
        }
      } catch (nextError) {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "Unable to store the reset session.");
          setMessage("Password reset session could not be restored.");
        }
      }
    }

    void syncSession();

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Password reset</p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Restoring your session</h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">{message}</p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-[color:var(--site-error-foreground)]/30 bg-[var(--site-error)] px-4 py-3 text-sm text-[var(--site-error-foreground)]">
          {error}
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        <Link
          href="/auth"
          className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
        >
          Back to sign in
        </Link>
      </div>
    </section>
  );
}
