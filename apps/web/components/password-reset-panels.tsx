"use client";

import Link from "next/link";
import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import { requestPasswordResetAction, updatePasswordAction } from "@/app/auth/actions";
import { authInitialState, type AuthFormState } from "@/app/auth/types";

function AuthMessage({ state }: { state: AuthFormState }) {
  if (!state.message) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl border px-4 py-3 text-sm ${
        state.tone === "success"
          ? "border-[color:var(--site-success-foreground)]/30 bg-[var(--site-success)] text-[var(--site-success-foreground)]"
          : state.tone === "error"
            ? "border-[color:var(--site-error-foreground)]/30 bg-[var(--site-error)] text-[var(--site-error-foreground)]"
            : "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
      }`}
      aria-live="polite"
    >
      {state.message}
    </div>
  );
}

function SubmitButton({ label, pendingLabel }: { label: string; pendingLabel: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}

export function PasswordResetRequestPanel() {
  const [state, formAction] = useActionState(requestPasswordResetAction, authInitialState);

  return (
    <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Password reset</p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Send a reset link</h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
          Enter the email address on the account. Supabase will send a reset link back to this browser, then you
          can choose a new password.
        </p>
      </div>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Email</span>
          <input
            name="email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
          />
        </label>

        <AuthMessage state={state} />

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label="Send reset link" pendingLabel="Sending..." />
          <Link
            href="/auth"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </section>
  );
}

export function PasswordUpdatePanel({ email }: { email?: string | null }) {
  const [state, formAction] = useActionState(updatePasswordAction, authInitialState);

  return (
    <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <div className="space-y-3">
        <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Set new password</p>
        <h2 className="text-3xl font-semibold tracking-tight text-balance">Choose a new password</h2>
        <p className="max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
          {email
            ? `We recovered the session for ${email}. Set the new password for this account below.`
            : "We recovered your password reset session. Set the new password for this account below."}
        </p>
      </div>

      <form action={formAction} className="grid gap-4">
        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">New password</span>
          <input
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            placeholder="Create a new password"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
          />
        </label>

        <label className="grid gap-2">
          <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Confirm password</span>
          <input
            name="confirm_password"
            type="password"
            autoComplete="new-password"
            minLength={6}
            placeholder="Confirm the new password"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
          />
        </label>

        <AuthMessage state={state} />

        <div className="flex flex-wrap items-center gap-3">
          <SubmitButton label="Update password" pendingLabel="Updating..." />
          <Link
            href="/auth"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to sign in
          </Link>
        </div>
      </form>
    </section>
  );
}
