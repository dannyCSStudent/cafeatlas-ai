import type { Metadata } from "next";
import Link from "next/link";

import { FlavorMemoryPanel } from "@/components/flavor-memory-panel";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "Memory | CafeAtlas AI",
  description: "Remember purchases, ratings, brew methods, and taste evolution.",
};

export default async function MemoryPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const initialSlug = firstParam(resolvedSearchParams.coffee)?.trim() || undefined;
  const catalog = await fetchCoffeeCatalog({ pageSize: 100, sort: "featured" });

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/recommendations"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to recommendations
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Memory
          </span>
        </div>

        <FlavorMemoryPanel coffees={catalog.items} initialSlug={initialSlug} />
      </section>
    </main>
  );
}
