import { redirect } from "next/navigation";
import Link from "next/link";

import { AuthPanels } from "@/components/auth-panels";
import { getCurrentSupabaseUser } from "@/lib/supabase-auth";

type AuthPageProps = {
  searchParams?: {
    error?: string;
  };
};

export default async function AuthPage({ searchParams }: AuthPageProps) {
  const user = await getCurrentSupabaseUser();
  const errorMessage = typeof searchParams?.error === "string" ? searchParams.error : "";

  if (user) {
    redirect("/account");
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Auth
          </span>
        </div>

        {errorMessage ? (
          <div className="rounded-2xl border border-[color:var(--site-error-foreground)]/30 bg-[var(--site-error)] px-4 py-3 text-sm text-[var(--site-error-foreground)]">
            {errorMessage}
          </div>
        ) : null}

        <header className="grid gap-6 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-4">
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">CafeAtlas AI</p>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Sign in with Supabase and keep the catalog connected to your session.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
              This first auth pass uses Supabase email/password accounts and HTTP-only cookies on the web app.
              Sign in for a session, or create an account if you are starting fresh.
            </p>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Session model</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                Supabase stores the account; this app stores the session token in secure cookies so the server can
                render account-aware UI.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Next step</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                Once the auth flow is stable here, the same session model can be reused for privileged editing or
                admin surfaces.
              </p>
            </div>
          </div>
        </header>

        <AuthPanels />
      </section>
    </main>
  );
}
