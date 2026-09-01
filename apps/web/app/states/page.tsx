import type { Metadata } from "next";
import Link from "next/link";

import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";
import { fetchStates, type StateRead } from "@/lib/cafeatlas-api";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCount(value: number, noun: string) {
  return `${value.toLocaleString()} ${noun}${value === 1 ? "" : "s"}`;
}

export const metadata: Metadata = {
  title: "States | CafeAtlas AI",
  description: "Browse regional coffee profiles by producing state.",
};

async function loadStates(q: string): Promise<{ states: StateRead[]; error: string | null }> {
  try {
    return { states: await fetchStates(q || undefined), error: null };
  } catch (error) {
    return {
      states: [],
      error: error instanceof Error ? error.message : "Failed to load states.",
    };
  }
}

export default async function StatesPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = firstParam(resolvedSearchParams.q)?.trim() ?? "";
  const { states, error } = await loadStates(q);

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/discover"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to discovery
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            States
          </span>
        </div>

        <header className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Regional profiles</h1>
          <p className="text-lg leading-8 text-[var(--site-text-soft)]">
            Each state page layers editorial context on top of live catalog counts, so the atlas can move from map
            view into origin stories without losing the data trail.
          </p>
        </header>

        <form>
          <SearchToolbar
            label="Search states"
            name="q"
            defaultValue={q}
            placeholder="State name or slug"
            clearHref={q ? "/states" : undefined}
          />
        </form>

        {error ? (
          <StatusPanel title="Could not load states." message={error} tone="error" />
        ) : states.length === 0 ? (
          <StatusPanel
            title={q ? "No states matched your search." : "No states yet."}
            message={q ? "Try a different search term or clear the filter." : "Seed data has not been loaded yet."}
            tone="empty"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {states.map((state) => (
              <article
                key={state.slug}
                className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">State profile</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{state.name}</h2>
                  </div>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                    {state.slug}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-[var(--site-text-soft)]">
                  Regional coffee stories, climate context, and product links live on the detail page for this state.
                </p>

                <div className="mt-4 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Farms</p>
                    <p className="mt-2 text-lg font-semibold">{formatCount(state.farm_count, "farm")}</p>
                  </div>
                  <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Coffees</p>
                    <p className="mt-2 text-lg font-semibold">{formatCount(state.coffee_count, "coffee")}</p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    href={`/states/${state.slug}`}
                    className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                  >
                    Open profile
                  </Link>
                  <Link
                    href={`/discover?state=${state.slug}`}
                    className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
                  >
                    Open discovery
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
