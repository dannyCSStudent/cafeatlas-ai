import Link from "next/link";
import { redirect } from "next/navigation";

import { signOutAction } from "@/app/auth/actions";
import { CustomerDashboard } from "@/components/customer-dashboard";
import { ProfilePanel } from "@/components/profile-panel";
import { SessionPanel } from "@/components/session-panel";
import { getCurrentSupabaseUser, isSupabaseAdminUser } from "@/lib/supabase-auth";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default async function AccountPage() {
  const user = await getCurrentSupabaseUser();
  const userMetadata = user?.user_metadata ?? {};
  const displayName =
    (typeof userMetadata.display_name === "string" && userMetadata.display_name.trim()) ||
    (typeof userMetadata.full_name === "string" && userMetadata.full_name.trim()) ||
    (typeof userMetadata.name === "string" && userMetadata.name.trim()) ||
    "";
  const headline = displayName || user?.email || "Your account";
  const isAdmin = isSupabaseAdminUser(user);

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
                {headline}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                The session is live. This page is the home base for your account, profile, and future customer
                dashboard sections.
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

        {isAdmin ? (
          <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(58,34,18,0.96),rgba(101,62,32,0.94))] p-5 text-white shadow-[0_16px_50px_rgba(102,62,22,0.14)]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-white/70">Admin access</p>
                <p className="mt-2 text-lg font-semibold">This account can open the admin dashboard.</p>
              </div>
              <Link
                href="/admin"
                className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
              >
                Open admin
              </Link>
            </div>
          </section>
        ) : null}

        <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
          <ProfilePanel email={user.email} displayName={displayName} />
          <CustomerDashboard
            userId={user.id}
            email={user.email}
            displayName={displayName}
            createdAt={user.created_at}
            lastSignInAt={user.last_sign_in_at}
            emailConfirmedAt={user.email_confirmed_at ?? user.confirmed_at ?? null}
          />
        </div>

        <SessionPanel />
      </section>
    </main>
  );
}
