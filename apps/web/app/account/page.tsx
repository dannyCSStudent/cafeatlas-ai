import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/auth/actions";
import { StatusPanel } from "@/components/status-panel";
import { getCurrentSupabaseUser } from "@/lib/supabase-auth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/auth");
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Account
          </span>
        </div>

        <header className="rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1fr_auto] lg:items-start">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Signed in</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {user.email ?? "Your account"}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                The session is live. This page is the simplest place to confirm auth is working and to sign out
                without hunting through the rest of the site.
              </p>
            </div>

            <form action={signOutAction}>
              <button
                type="submit"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:-translate-y-0.5 hover:bg-[var(--site-surface-hover)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Account id</p>
            <p className="mt-3 break-all text-sm leading-7 text-[var(--site-text-soft)]">{user.id}</p>
          </article>
          <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Created at</p>
            <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{formatDate(user.created_at)}</p>
          </article>
        </section>

        <StatusPanel
          title="Supabase auth is wired into the web app."
          message="Use this account page to validate sign in, then expand the same session model when privileged pages are added."
          action={
            <div className="flex flex-wrap gap-3 text-sm">
              <Link
                href="/producers"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Producers
              </Link>
              <Link
                href="/farms"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Farms
              </Link>
              <Link
                href="/learn"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Learn hub
              </Link>
            </div>
          }
        />
      </section>
    </main>
  );
}
