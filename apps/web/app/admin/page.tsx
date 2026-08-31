import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { AdminDashboard } from "@/components/admin-dashboard";
import { getCurrentSupabaseUser, isSupabaseAdminUser } from "@/lib/supabase-auth";

export const metadata: Metadata = {
  title: "Admin | CafeAtlas AI",
  description: "Internal admin dashboard for CafeAtlas AI.",
};

export default async function AdminPage() {
  const user = await getCurrentSupabaseUser();

  if (!user) {
    redirect("/auth");
  }

  if (!isSupabaseAdminUser(user)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/account"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to account
          </Link>
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Catalog
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Admin
          </span>
        </div>

        <AdminDashboard />
      </section>
    </main>
  );
}
