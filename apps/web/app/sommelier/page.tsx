import type { Metadata } from "next";
import Link from "next/link";

import { SommelierPanel } from "@/components/sommelier-panel";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Sommelier | CafeAtlas AI",
  description: "Ask for coffee recommendations and read flavor explanations.",
};

export default async function SommelierPage() {
  const catalog = await fetchCoffeeCatalog({ pageSize: 48, sort: "featured" });

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
            Sommelier
          </span>
        </div>

        <SommelierPanel coffees={catalog.items} />
      </section>
    </main>
  );
}
