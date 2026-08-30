"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";

import { signInAction, signUpAction } from "@/app/auth/actions";
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

export function AuthPanels() {
  const [signInState, signInFormAction] = useActionState(signInAction, authInitialState);
  const [signUpState, signUpFormAction] = useActionState(signUpAction, authInitialState);

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Supabase auth</p>
          <h2 className="text-3xl font-semibold tracking-tight text-balance">One account for the catalog</h2>
          <p className="max-w-xl text-sm leading-7 text-[var(--site-text-soft)]">
            Sign in to keep a session on this browser, then use the same account to unlock anything that needs
            identity later. Sessions are stored in HTTP-only cookies on the web app.
          </p>
        </div>

        <div className="mt-6 grid gap-3">
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">What it does</p>
            <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
              Email/password auth is backed directly by Supabase. Sign up can return a confirmation email, and
              sign in drops you into the account page once the session is established.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Current scope</p>
            <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
              This first pass covers the web app. The mobile client can reuse the same auth model once its storage
              and session surface are ready.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6">
        <form
          action={signInFormAction}
          className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Sign in</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Welcome back</h3>
          </div>

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

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="Your password"
              minLength={6}
              className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
            />
          </label>

          <AuthMessage state={signInState} />
          <SubmitButton label="Sign in" pendingLabel="Signing in..." />
          <Link
            href="/auth/reset-password"
            className="text-sm font-semibold text-[var(--site-accent)] transition hover:opacity-80"
          >
            Forgot your password?
          </Link>
        </form>

        <form
          action={signUpFormAction}
          className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"
        >
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Create account</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">Start a session</h3>
            <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
              New accounts are confirmed through Supabase if email verification is enabled.
            </p>
          </div>

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

          <label className="grid gap-2">
            <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Password</span>
            <input
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Create a password"
              minLength={6}
              className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
            />
          </label>

          <AuthMessage state={signUpState} />
          <SubmitButton label="Create account" pendingLabel="Creating..." />
        </form>
      </section>
    </div>
  );
}
