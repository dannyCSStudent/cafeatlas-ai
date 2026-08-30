"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { refreshSessionAction } from "@/app/auth/actions";
import { authInitialState } from "@/app/auth/types";

function AuthMessage({ tone, message }: { tone: "neutral" | "success" | "error"; message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        tone === "success"
          ? "border-[color:var(--site-success-foreground)]/30 bg-[var(--site-success)] text-[var(--site-success-foreground)]"
          : tone === "error"
            ? "border-[color:var(--site-error-foreground)]/30 bg-[var(--site-error)] text-[var(--site-error-foreground)]"
            : "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
      }`}
      aria-live="polite"
    >
      {message}
    </div>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? "Refreshing..." : "Refresh session"}
    </button>
  );
}

export function SessionPanel() {
  const router = useRouter();
  const [state, formAction] = useActionState(refreshSessionAction, authInitialState);

  useEffect(() => {
    if (state.tone === "success") {
      router.refresh();
    }
  }, [router, state.message, state.tone]);

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <form action={formAction} className="grid gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Session</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight">Keep the browser session current</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
            If the access token ages out, refresh the session cookie pair before you sign out or lose access to the
            account surface.
          </p>
        </div>

        <AuthMessage tone={state.tone} message={state.message} />
        <div>
          <SubmitButton />
        </div>
      </form>
    </section>
  );
}
