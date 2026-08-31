import type { Metadata } from "next";
import Link from "next/link";

import { RecommendationEnginePanel } from "@/components/recommendation-engine-panel";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Recommendations | CafeAtlas AI",
  description: "Personalized coffee recommendations based on taste history, passport data, and catalog similarity.",
};

export default async function RecommendationsPage() {
  const catalog = await fetchCoffeeCatalog({ pageSize: 100, sort: "featured" });

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/sommelier"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to sommelier
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Recommendations
          </span>
        </div>

        <RecommendationEnginePanel coffees={catalog.items} />
      </section>
    </main>
  );
}
