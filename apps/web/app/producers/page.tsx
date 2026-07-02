import Link from "next/link";

import { fetchProducers, type ProducerRead } from "@/lib/cafeatlas-api";
import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ProducersPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = firstParam(resolvedSearchParams.q)?.trim() ?? "";

  let producers: ProducerRead[] = [];
  let error: string | null = null;

  try {
    producers = await fetchProducers(q || undefined);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load producers.";
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Producers
          </span>
        </div>

        <header className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Producer profiles
          </h1>
          <p className="text-lg leading-8 text-[var(--site-text-soft)]">
            Browse the people and collectives behind the coffees in the catalog.
          </p>
        </header>

        <form>
          <SearchToolbar
            label="Search producers"
            name="q"
            defaultValue={q}
            placeholder="Name, slug, family, or related farm"
            clearHref={q ? "/producers" : undefined}
          />
        </form>

        {error ? (
          <StatusPanel title="Could not load producers." message={error} tone="error" />
        ) : producers.length === 0 ? (
          <StatusPanel
            title={q ? "No producers matched your search." : "No producers yet."}
            message={
              q
                ? "Try a different search term or clear the filter."
                : "Seed data has not been loaded yet."
            }
            tone="empty"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {producers.map((producer) => (
              <article
                key={producer.id}
                className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Producer</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{producer.name}</h2>
                  </div>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                    {producer.farms.length} farms
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--site-text-soft)]">
                  {producer.description || "A producer profile without a description yet."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {producer.family ? (
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {producer.family}
                    </span>
                  ) : null}
                  {producer.farms[0] ? (
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {producer.farms[0].state}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-[var(--site-border)] pt-4">
                  <p className="text-sm text-[var(--site-text-soft)]">
                    {producer.farms.length > 0 ? `Lead farm: ${producer.farms[0].name}` : "No farms yet"}
                  </p>
                  <Link
                    href={`/producers/${producer.slug}`}
                    className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                  >
                    Open
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
