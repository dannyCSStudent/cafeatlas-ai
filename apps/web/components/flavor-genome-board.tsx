import Link from "next/link";

import type { CoffeeRead } from "@/lib/cafeatlas-api";
import {
  buildFlavorGenomeEntry,
  buildGenomeAverage,
  buildGenomeDeck,
  FLAVOR_GENOME_DIMENSIONS,
} from "@/lib/flavor-genome";

type FlavorGenomeBoardProps = {
  coffees: CoffeeRead[];
  selectedSlug?: string;
};

function formatScore(value: number) {
  return `${Math.round(value)}`;
}

function selectHref(slug: string) {
  return `/genome?coffee=${encodeURIComponent(slug)}`;
}

export function FlavorGenomeBoard({ coffees, selectedSlug }: FlavorGenomeBoardProps) {
  const deck = buildGenomeDeck(coffees);
  const selectedEntry = deck.find((entry) => entry.coffee.slug === selectedSlug) ?? deck[0] ?? null;
  const averages = buildGenomeAverage(deck);
  const selectedPreview = selectedEntry ?? (coffees[0] ? buildFlavorGenomeEntry(coffees[0]) : null);
  const averagedDimensions = FLAVOR_GENOME_DIMENSIONS.map((dimension) => ({
    ...dimension,
    value: averages[dimension.key],
  })).sort((left, right) => right.value - left.value);
  const dominantAverage = averagedDimensions[0];

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(57,32,18,0.98),rgba(128,77,39,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.06fr_0.94fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Flavor genome</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn each coffee into a multidimensional flavor vector.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            The genome converts the live catalog into a readable matrix across sweetness, acidity, chocolate,
            caramel, floral, fruity, nutty, smoky, body, finish, and roast.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/explore"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open explorer
            </Link>
            <Link
              href="/sommelier"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Ask the sommelier
            </Link>
            <Link
              href="/genome"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Reset selection
            </Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Entries</p>
              <p className="mt-2 text-2xl font-semibold">{coffees.length}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Average</p>
              <p className="mt-2 text-2xl font-semibold">
                {selectedPreview ? formatScore(selectedPreview.average) : "0"}
              </p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Leader</p>
              <p className="mt-2 text-2xl font-semibold">{dominantAverage ? dominantAverage.label : "n/a"}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Catalog signal</p>
            <p className="mt-2 text-xl font-semibold">{dominantAverage?.label ?? "Genome"} leads the catalog</p>
            <p className="mt-2 text-sm leading-7 text-white/75">
              On average the strongest signal is {dominantAverage?.description.toLowerCase() ?? "not yet available."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Selected genome</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {selectedEntry?.coffee.name ?? "No coffee selected"}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
                {selectedEntry
                  ? `${selectedEntry.coffee.origin_state} • ${selectedEntry.coffee.producer_name} • ${selectedEntry.coffee.process ?? "Process n/a"}`
                  : "Select a coffee from the genome database to inspect its vector."}
              </p>
            </div>
            {selectedEntry ? (
              <Link
                href={`/coffees/${selectedEntry.coffee.slug}`}
                className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
              >
                Open coffee
              </Link>
            ) : null}
          </div>

          {selectedEntry ? (
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Genome score</p>
                    <p className="mt-2 text-3xl font-semibold">{formatScore(selectedEntry.average)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedEntry.signature.map((dimension) => (
                      <span
                        key={dimension.key}
                        className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                      >
                        {dimension.label} {formatScore(dimension.value)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {FLAVOR_GENOME_DIMENSIONS.map((dimension) => {
                  const selectedValue = selectedEntry.vector[dimension.key];
                  const averageValue = averages[dimension.key];
                  const leading = selectedValue >= averageValue;

                  return (
                    <div
                      key={dimension.key}
                      className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold">{dimension.label}</p>
                          <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">{dimension.description}</p>
                        </div>
                        <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                          {formatScore(selectedValue)} vs {formatScore(averageValue)}
                        </span>
                      </div>
                      <div className="mt-4 grid gap-3">
                        <div>
                          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[var(--site-muted)]">
                            <span>Selected</span>
                            <span>{leading ? "Ahead of catalog" : "Below catalog"}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(102,62,22,0.95),rgba(236,190,136,0.98))]"
                              style={{ width: `${selectedValue}%` }}
                            />
                          </div>
                        </div>
                        <div>
                          <div className="mb-2 flex items-center justify-between text-[10px] uppercase tracking-[0.22em] text-[var(--site-muted)]">
                            <span>Catalog average</span>
                            <span>{formatScore(averageValue)}</span>
                          </div>
                          <div className="h-2 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                            <div
                              className="h-full rounded-full bg-[linear-gradient(90deg,rgba(120,83,45,0.95),rgba(188,150,102,0.98))]"
                              style={{ width: `${averageValue}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : null}
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Genome database</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Ranked coffee vectors</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            Each card compresses a coffee into its strongest genes, making it easier to compare the catalog at a
            glance.
          </p>

          <div className="mt-5 grid gap-3">
            {deck.slice(0, 12).map((entry, index) => {
              const active = entry.coffee.slug === selectedEntry?.coffee.slug;

              return (
                <Link
                  key={entry.coffee.slug}
                  href={selectHref(entry.coffee.slug)}
                  className={`rounded-[1.5rem] border p-4 transition hover:-translate-y-0.5 ${
                    active
                      ? "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"
                      : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-accent)]"
                  }`}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Gene {index + 1}</p>
                      <h3 className="mt-2 text-lg font-semibold">{entry.coffee.name}</h3>
                      <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                        {entry.coffee.origin_state} • {entry.coffee.producer_name}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                      {formatScore(entry.average)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {entry.signature.map((dimension) => (
                      <span
                        key={dimension.key}
                        className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                      >
                        {dimension.label} {formatScore(dimension.value)}
                      </span>
                    ))}
                  </div>
                </Link>
              );
            })}
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Genome average</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Catalog-wide flavor map</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {averagedDimensions.map((dimension) => (
            <div
              key={dimension.key}
              className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold">{dimension.label}</p>
                  <p className="mt-1 text-xs leading-6 text-[var(--site-text-soft)]">{dimension.description}</p>
                </div>
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                  {formatScore(dimension.value)}
                </span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,rgba(102,62,22,0.9),rgba(236,190,136,0.92))]"
                  style={{ width: `${dimension.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
