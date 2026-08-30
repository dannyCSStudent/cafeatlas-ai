"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";

import { updateProfileAction } from "@/app/auth/actions";
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
      {pending ? "Saving..." : "Save profile"}
    </button>
  );
}

type ProfilePanelProps = {
  email: string | null;
  displayName: string;
};

export function ProfilePanel({ email, displayName }: ProfilePanelProps) {
  const router = useRouter();
  const [state, formAction] = useActionState(updateProfileAction, authInitialState);

  useEffect(() => {
    if (state.tone === "success") {
      router.refresh();
    }
  }, [router, state.message, state.tone]);

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <form action={formAction} className="grid gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Profile</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Your public identity</h2>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
            Store a display name in Supabase auth metadata so the account surface can show something friendlier than
            the login email.
          </p>
        </div>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Display name</span>
          <input
            key={displayName}
            name="display_name"
            type="text"
            autoComplete="name"
            defaultValue={displayName}
            placeholder="CafeAtlas reader"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Email</span>
          <input
            type="email"
            value={email ?? ""}
            readOnly
            className="cursor-not-allowed rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-3 text-sm text-[var(--site-text-soft)] outline-none"
          />
        </label>

        <AuthMessage tone={state.tone} message={state.message} />
        <SubmitButton />
      </form>
    </section>
  );
}
