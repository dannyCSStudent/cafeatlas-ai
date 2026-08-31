import type { Metadata } from "next";
import Link from "next/link";

import { JournalBoard } from "@/components/journal-board";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Journal | CafeAtlas AI",
  description: "Save tasting notes, ratings, favorites, and private coffee history.",
};

export default async function JournalPage() {
  const catalog = await fetchCoffeeCatalog({ pageSize: 12, sort: "newest" });

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/passport"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to passport
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Journal
          </span>
        </div>

        <JournalBoard coffees={catalog.items} />
      </section>
    </main>
  );
}
