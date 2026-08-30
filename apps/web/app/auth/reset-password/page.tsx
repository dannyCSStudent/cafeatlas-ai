import Link from "next/link";

import { PasswordResetRequestPanel } from "@/components/password-reset-panels";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-4xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/auth"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to sign in
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Reset password
          </span>
        </div>

        <header className="rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">CafeAtlas AI</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Reset the password tied to your catalog account.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
              Supabase will send a reset email to the address on file. Follow the link to restore the session and
              choose a new password in the browser.
            </p>
          </div>
        </header>

        <PasswordResetRequestPanel />
      </section>
    </main>
  );
}
