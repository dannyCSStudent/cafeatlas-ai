import type { Metadata } from "next";
import Link from "next/link";

import { PassportBoard } from "@/components/passport-board";
import { fetchStates } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Passport | CafeAtlas AI",
  description: "Collect state stamps, track progress, and unlock passport badges.",
};

export default async function PassportPage() {
  const states = await fetchStates();

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/discover"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to discovery
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Passport
          </span>
        </div>

        <PassportBoard states={states} />
      </section>
    </main>
  );
}
