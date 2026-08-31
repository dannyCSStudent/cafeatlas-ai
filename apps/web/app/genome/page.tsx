import type { Metadata } from "next";
import Link from "next/link";

import { FlavorGenomeBoard } from "@/components/flavor-genome-board";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export const metadata: Metadata = {
  title: "Genome | CafeAtlas AI",
  description: "Browse multidimensional flavor vectors for the live coffee catalog.",
};

export default async function GenomePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedSlug = firstParam(resolvedSearchParams.coffee)?.trim() || undefined;
  const catalog = await fetchCoffeeCatalog({ pageSize: 100, sort: "featured" });

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/explore"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to explore
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Genome
          </span>
        </div>

        <FlavorGenomeBoard coffees={catalog.items} selectedSlug={selectedSlug} />
      </section>
    </main>
  );
}
