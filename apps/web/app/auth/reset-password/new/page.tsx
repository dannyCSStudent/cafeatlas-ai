import Link from "next/link";
import { redirect } from "next/navigation";

import { PasswordUpdatePanel } from "@/components/password-reset-panels";
import { getCurrentSupabaseUser } from "@/lib/supabase-auth";

export default async function ResetPasswordNewPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/auth/reset-password");
  }

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
            New password
          </span>
        </div>

        <PasswordUpdatePanel email={user.email} />
      </section>
    </main>
  );
}
