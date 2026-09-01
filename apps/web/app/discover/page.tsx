import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { fetchCoffeeCatalog, fetchStates, formatPrice, type StateRead } from "@/lib/cafeatlas-api";
import { StatusPanel } from "@/components/status-panel";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatCount(value: number, noun: string) {
  return `${value.toLocaleString()} ${noun}${value === 1 ? "" : "s"}`;
}

function buildMexicoMatrix() {
  return [
    { slug: "chiapas", label: "Chiapas", x: "18%", y: "28%", accent: "from-[#6d3f26] to-[#b57a47]" },
    { slug: "oaxaca", label: "Oaxaca", x: "42%", y: "55%", accent: "from-[#3f281c] to-[#9a6a40]" },
    { slug: "veracruz", label: "Veracruz", x: "68%", y: "34%", accent: "from-[#4a2b17] to-[#c08457]" },
  ] as const;
}

export const metadata: Metadata = {
  title: "Discover | CafeAtlas AI",
  description: "Explore Mexican coffee by state, origin counts, and live catalog data.",
};

export default async function DiscoverPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const selectedSlug = firstParam(resolvedSearchParams.state)?.toLowerCase().trim() || "";

  let states: StateRead[] = [];
  let statesError: string | null = null;

  try {
    states = await fetchStates();
  } catch (error) {
    statesError = error instanceof Error ? error.message : "Failed to load discovery data.";
  }

  const selectedState = states.find((state) => state.slug === selectedSlug) ?? states[0] ?? null;

  let coffeeError: string | null = null;
  const coffeePage =
    selectedState && !statesError
      ? await fetchCoffeeCatalog({ state: selectedState.name, sort: "featured", pageSize: 8 }).catch((error) => {
          coffeeError = error instanceof Error ? error.message : "Failed to load state coffees.";
          return null;
        })
      : null;

  const coffeeItems = coffeePage?.items ?? [];
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.6),rgba(243,231,219,0.95)_38%,rgba(238,222,203,0.98)_100%)] px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="grid gap-6 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              Discovery
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-success-foreground)]" />
              Interactive Mexico map
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Explore Mexican coffee by state, then drop into the catalog with the origin chain already in view.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
              This page uses live state counts and catalog data so the map, the explorer, and the product entries all
              point at the same backend.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] shadow-lg shadow-stone-950/15 transition hover:-translate-y-0.5"
              >
                Back to catalog
              </Link>
              <Link
                href="/explore"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
              >
                Open explorer
              </Link>
              <Link
                href="/producers"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
              >
                Producers
              </Link>
              <Link
                href="/farms"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
              >
                Farms
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">States</p>
                <p className="mt-2 text-2xl font-semibold">{states.length || 3}</p>
              </article>
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Coffees</p>
                <p className="mt-2 text-2xl font-semibold">
                  {selectedState ? formatCount(selectedState.coffee_count, "coffee") : "n/a"}
                </p>
              </article>
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Farms</p>
                <p className="mt-2 text-2xl font-semibold">
                  {selectedState ? formatCount(selectedState.farm_count, "farm") : "n/a"}
                </p>
              </article>
            </div>

            <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(240,220,196,0.65))] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Selected region</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">{selectedState?.name ?? "Choose a state"}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                {selectedState
                  ? "Tap a different region on the map to update the explorer and the live catalog results."
                  : "State data is still loading or unavailable."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedState ? (
                  <>
                    <span className="rounded-full bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {formatCount(selectedState.farm_count, "farm")}
                    </span>
                    <span className="rounded-full bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {formatCount(selectedState.coffee_count, "coffee")}
                    </span>
                    <Link
                      href={`/?state=${encodeURIComponent(selectedState.name)}`}
                      className="rounded-full bg-[var(--site-inverse)] px-3 py-1 text-xs font-medium text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                    >
                      Open catalog filter
                    </Link>
                    <Link
                      href={`/states/${selectedState.slug}`}
                      className="rounded-full bg-[color:var(--site-inverse-foreground)]/10 px-3 py-1 text-xs font-medium text-[var(--site-inverse-muted)] transition hover:bg-[color:var(--site-inverse-foreground)]/15"
                    >
                      Open state profile
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </header>

        {statesError ? (
          <StatusPanel title="Could not load discovery states." message={statesError} tone="error" />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[1.02fr_0.98fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(180deg,var(--site-surface-card),var(--site-surface-soft))] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Mexico map</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Click a state to focus the explorer</h2>
              </div>
              <span className="rounded-full bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                Interactive links
              </span>
            </div>

            <div className="relative mt-6 min-h-[30rem] overflow-hidden rounded-[2rem] border border-[var(--site-border)] bg-[radial-gradient(circle_at_top,rgba(120,69,29,0.2),transparent_48%),linear-gradient(180deg,rgba(255,255,255,0.82),rgba(243,232,220,0.92))] p-4">
              <div className="absolute inset-x-[10%] top-[18%] h-[52%] rounded-[48%_52%_58%_42%/42%_34%_66%_58%] border border-[rgba(93,52,26,0.18)] bg-[rgba(255,255,255,0.35)] blur-[1px]" />
              <div className="absolute right-[8%] top-[12%] h-28 w-28 rounded-full bg-[rgba(120,69,29,0.08)] blur-3xl" />
              <div className="relative h-full min-h-[28rem]">
                {buildMexicoMatrix().map((region, index) => {
                  const state = states.find((item) => item.slug === region.slug);
                  const isSelected = selectedState?.slug === region.slug;

                  return (
                    <Link
                      key={region.slug}
                      href={`/discover?state=${region.slug}`}
                      className={`absolute w-[42%] max-w-[18rem] rounded-[1.6rem] border p-4 shadow-[0_16px_50px_rgba(102,62,22,0.12)] transition hover:-translate-y-1 hover:shadow-[0_22px_70px_rgba(102,62,22,0.16)] ${
                        isSelected
                          ? "border-[var(--site-accent)] bg-[var(--site-surface-card)]"
                          : "border-[var(--site-border)] bg-[var(--site-surface-card)]"
                      }`}
                      style={{ left: region.x, top: region.y }}
                    >
                      <div className={`h-2 rounded-full bg-gradient-to-r ${region.accent}`} />
                      <div className="mt-3 flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">State {index + 1}</p>
                          <h3 className="mt-1 text-xl font-semibold tracking-tight">{state?.name ?? region.label}</h3>
                        </div>
                        {isSelected ? (
                          <span className="rounded-full bg-[var(--site-accent)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-accent-foreground)]">
                            Selected
                          </span>
                        ) : null}
                      </div>
                      <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                        <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--site-muted)]">Farms</p>
                          <p className="mt-1 font-semibold">{state ? state.farm_count : "n/a"}</p>
                        </div>
                        <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-3">
                          <p className="text-[10px] uppercase tracking-[0.2em] text-[var(--site-muted)]">Coffees</p>
                          <p className="mt-1 font-semibold">{state ? state.coffee_count : "n/a"}</p>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </article>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-inverse-muted)]">Explorer</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Filter by origin first</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-inverse-muted)]">
                This page is a discovery lane, not just a catalog mirror. Start with the state, then jump into the
                live lots, producers, and farms behind it.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {states.map((state) => (
                  <Link
                    key={state.slug}
                    href={`/discover?state=${state.slug}`}
                    className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                      selectedState?.slug === state.slug
                        ? "bg-[var(--site-inverse-foreground)] text-[var(--site-inverse)]"
                        : "bg-[color:var(--site-inverse-foreground)]/10 text-[var(--site-inverse-muted)] hover:bg-[color:var(--site-inverse-foreground)]/15"
                    }`}
                  >
                    {state.name}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">State coffees</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">
                {selectedState ? `${selectedState.name} coffees` : "No state selected"}
              </h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                {selectedState
                  ? "These are the live coffees linked to the chosen origin region."
                  : "Select a region to populate the explorer."}
              </p>

              {coffeeError ? (
                <div className="mt-4">
                  <StatusPanel title="Could not load state coffees." message={coffeeError} tone="error" />
                </div>
              ) : coffeeItems.length > 0 ? (
                <div className="mt-5 grid gap-3">
                  {coffeeItems.map((coffee) => (
                    <Link
                      key={coffee.slug}
                      href={`/coffees/${coffee.slug}`}
                      className="group rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 transition hover:-translate-y-0.5 hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="relative h-16 w-16 overflow-hidden rounded-2xl bg-[var(--site-surface-soft)]">
                          {coffee.image_url ? (
                            <Image
                              src={coffee.image_url}
                              alt={`${coffee.name} artwork`}
                              fill
                              sizes="64px"
                              className="object-cover"
                              unoptimized
                            />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-base font-semibold tracking-tight">{coffee.name}</h3>
                              <p className="mt-1 text-sm text-[var(--site-text-soft)]">
                                {coffee.process || "Process n/a"}
                                {coffee.varietal ? ` • ${coffee.varietal}` : ""}
                              </p>
                            </div>
                            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                              {formatPrice(coffee.price_cents, coffee.currency_code ?? "USD")}
                            </span>
                          </div>
                          <p className="mt-2 text-sm text-[var(--site-text-soft)]">
                            {coffee.producer?.name ?? coffee.producer_name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-4 rounded-2xl border border-dashed border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4 text-sm text-[var(--site-text-soft)]">
                  No coffees are available for this region yet.
                </div>
              )}
            </div>
          </aside>
        </section>
      </section>
    </main>
  );
}
