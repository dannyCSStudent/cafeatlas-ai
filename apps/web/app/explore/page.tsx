import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StatusPanel } from "@/components/status-panel";
import { fetchCoffeeCatalog, formatPrice, type CoffeeRead } from "@/lib/cafeatlas-api";

type SearchParams = Record<string, string | string[] | undefined>;

type ExplorerParams = {
  state?: string;
  producer?: string;
  process?: string;
  roast?: string;
  flavor?: FlavorValue;
  altitude?: AltitudeValue;
};

type FacetOption = {
  value: string;
  label: string;
  count: number;
};

type FlavorValue = (typeof FLAVOR_RULES)[number]["value"];
type AltitudeValue = (typeof ALTITUDE_BANDS)[number]["value"];

const FLAVOR_RULES = [
  { value: "floral", label: "Floral", keywords: ["floral", "jasmine", "rose", "honeysuckle", "lavender"] },
  { value: "citrus", label: "Citrus", keywords: ["citrus", "orange", "lemon", "lime", "grapefruit", "bergamot"] },
  { value: "fruity", label: "Fruity", keywords: ["fruit", "fruity", "stone fruit", "peach", "plum", "berry", "apple"] },
  { value: "chocolate", label: "Chocolate", keywords: ["chocolate", "cacao", "cocoa"] },
  { value: "caramel", label: "Caramel", keywords: ["caramel", "honey", "panela", "toffee", "brown sugar"] },
  { value: "nutty", label: "Nutty", keywords: ["nut", "almond", "hazelnut", "peanut"] },
  { value: "smoky", label: "Smoky", keywords: ["smoky", "smoke", "charcoal"] },
] as const;

const ALTITUDE_BANDS = [
  { value: "under-1300", label: "Under 1,300 m", min: Number.NEGATIVE_INFINITY, max: 1299 },
  { value: "1300-1499", label: "1,300-1,499 m", min: 1300, max: 1499 },
  { value: "1500-1699", label: "1,500-1,699 m", min: 1500, max: 1699 },
  { value: "1700-plus", label: "1,700 m+", min: 1700, max: Number.POSITIVE_INFINITY },
] as const;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function getAltitudeBand(altitude?: number | null) {
  if (typeof altitude !== "number") {
    return null;
  }

  if (altitude < 1300) return "under-1300";
  if (altitude < 1500) return "1300-1499";
  if (altitude < 1700) return "1500-1699";
  return "1700-plus";
}

function getFlavorTags(coffee: CoffeeRead) {
  const text = `${coffee.tasting_notes ?? ""} ${coffee.description ?? ""}`.toLowerCase();
  return FLAVOR_RULES.filter((rule) => rule.keywords.some((keyword) => text.includes(keyword))).map((rule) => rule.value);
}

function buildExplorerHref(baseParams: ExplorerParams, updates: Partial<ExplorerParams>) {
  const query = new URLSearchParams();
  const nextParams = { ...baseParams, ...updates };

  Object.entries(nextParams).forEach(([key, value]) => {
    if (value) {
      query.set(key, value);
    }
  });

  const search = query.toString();
  return search ? `/explore?${search}` : "/explore";
}

function getFacetOptions(coffees: CoffeeRead[], selector: (coffee: CoffeeRead) => string | null) {
  const counts = new Map<string, { label: string; count: number }>();

  coffees.forEach((coffee) => {
    const value = selector(coffee);
    if (!value) return;

    const current = counts.get(value);
    if (current) {
      current.count += 1;
      return;
    }

    counts.set(value, { label: value, count: 1 });
  });

  return [...counts.entries()]
    .map(([value, entry]) => ({ value, label: entry.label, count: entry.count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label));
}

function getProcessValue(coffee: CoffeeRead) {
  return coffee.process ? toSlug(coffee.process) : null;
}

function getRoastValue(coffee: CoffeeRead) {
  return coffee.roast_level ? toSlug(coffee.roast_level) : null;
}

function getStateValue(coffee: CoffeeRead) {
  return coffee.origin_state ? toSlug(coffee.origin_state) : null;
}

function getAltitudeLabel(value: string) {
  return ALTITUDE_BANDS.find((band) => band.value === value)?.label ?? value;
}

function getFlavorLabel(value: string) {
  return FLAVOR_RULES.find((rule) => rule.value === value)?.label ?? value;
}

export const metadata: Metadata = {
  title: "Explore | CafeAtlas AI",
  description: "Browse Mexican coffee by state, flavor, roast, altitude, process, and producer.",
};

export default async function ExplorePage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const rawFlavor = firstParam(resolvedSearchParams.flavor)?.trim() ?? "";
  const rawAltitude = firstParam(resolvedSearchParams.altitude)?.trim() ?? "";
  const filters: ExplorerParams = {
    state: firstParam(resolvedSearchParams.state)?.trim() || undefined,
    producer: firstParam(resolvedSearchParams.producer)?.trim() || undefined,
    process: firstParam(resolvedSearchParams.process)?.trim() || undefined,
    roast: firstParam(resolvedSearchParams.roast)?.trim() || undefined,
    flavor: FLAVOR_RULES.some((rule) => rule.value === rawFlavor) ? (rawFlavor as FlavorValue) : undefined,
    altitude: ALTITUDE_BANDS.some((band) => band.value === rawAltitude)
      ? (rawAltitude as AltitudeValue)
      : undefined,
  };

  let catalog;
  let catalogError: string | null = null;

  try {
    catalog = await fetchCoffeeCatalog({ pageSize: 100, sort: "featured" });
  } catch (error) {
    catalogError = error instanceof Error ? error.message : "Failed to load the explorer dataset.";
  }

  const coffees = catalog?.items ?? [];

  const stateOptions = getFacetOptions(coffees, (coffee) => getStateValue(coffee)).map((option) => ({
    ...option,
    label: coffees.find((coffee) => getStateValue(coffee) === option.value)?.origin_state ?? option.label,
  }));
  const producerOptions = getFacetOptions(coffees, (coffee) => coffee.producer?.slug ?? null).map((option) => ({
    ...option,
    label: coffees.find((coffee) => coffee.producer?.slug === option.value)?.producer?.name ?? option.label,
  }));
  const processOptions = getFacetOptions(coffees, (coffee) => getProcessValue(coffee)).map((option) => ({
    ...option,
    label: coffees.find((coffee) => getProcessValue(coffee) === option.value)?.process ?? option.label,
  }));
  const roastOptions = getFacetOptions(coffees, (coffee) => getRoastValue(coffee)).map((option) => ({
    ...option,
    label: coffees.find((coffee) => getRoastValue(coffee) === option.value)?.roast_level ?? option.label,
  }));
  const altitudeOptions = ALTITUDE_BANDS.map((band) => ({
    ...band,
    count: coffees.filter((coffee) => getAltitudeBand(coffee.farm?.altitude_meters) === band.value).length,
  })).filter((band) => band.count > 0);
  const flavorOptions = FLAVOR_RULES.map((rule) => ({
    ...rule,
    count: coffees.filter((coffee) => getFlavorTags(coffee).includes(rule.value)).length,
  })).filter((rule) => rule.count > 0);

  const filteredCoffees = coffees.filter((coffee) => {
    if (filters.state && getStateValue(coffee) !== filters.state) return false;
    if (filters.producer && coffee.producer?.slug !== filters.producer) return false;
    if (filters.process && getProcessValue(coffee) !== filters.process) return false;
    if (filters.roast && getRoastValue(coffee) !== filters.roast) return false;
    if (filters.altitude && getAltitudeBand(coffee.farm?.altitude_meters) !== filters.altitude) return false;
    if (filters.flavor && !getFlavorTags(coffee).includes(filters.flavor)) return false;
    return true;
  });

  const selectedState = filters.state ? stateOptions.find((option) => option.value === filters.state) : null;
  const selectedProducer = filters.producer
    ? producerOptions.find((option) => option.value === filters.producer)
    : null;
  const selectedProcess = filters.process
    ? processOptions.find((option) => option.value === filters.process)
    : null;
  const selectedRoast = filters.roast ? roastOptions.find((option) => option.value === filters.roast) : null;
  const selectedAltitude = filters.altitude
    ? altitudeOptions.find((option) => option.value === filters.altitude)
    : null;
  const selectedFlavor = filters.flavor ? flavorOptions.find((option) => option.value === filters.flavor) : null;

  const activeFilters = [selectedState, selectedProducer, selectedProcess, selectedRoast, selectedAltitude, selectedFlavor].filter(Boolean).length;
  const maxAltitude = coffees.reduce((max, coffee) => Math.max(max, coffee.farm?.altitude_meters ?? 0), 0);
  const minAltitude = coffees.reduce((min, coffee) => {
    const altitude = coffee.farm?.altitude_meters;
    return typeof altitude === "number" ? Math.min(min, altitude) : min;
  }, Number.POSITIVE_INFINITY);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.55),rgba(243,232,219,0.92)_34%,rgba(236,220,202,0.98)_100%)] px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <header className="grid gap-6 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              Coffee Explorer
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--site-success-foreground)]" />
              Browse by facet
            </div>
            <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
              Explore coffee by state, flavor, roast, altitude, process, and producer.
            </h1>
            <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
              The explorer is a guided browse layer over the live catalog. It keeps the origin chain readable while
              giving you tighter controls than the general catalog page.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/discover"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] shadow-lg shadow-stone-950/15 transition hover:-translate-y-0.5"
              >
                Open map
              </Link>
              <Link
                href="/"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
              >
                Back to catalog
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Visible coffees</p>
                <p className="mt-2 text-2xl font-semibold">{coffees.length.toLocaleString()}</p>
              </article>
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Matching coffees</p>
                <p className="mt-2 text-2xl font-semibold">{filteredCoffees.length.toLocaleString()}</p>
              </article>
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Active filters</p>
                <p className="mt-2 text-2xl font-semibold">{activeFilters}</p>
              </article>
              <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Altitude span</p>
                <p className="mt-2 text-2xl font-semibold">
                  {Number.isFinite(minAltitude) ? `${minAltitude.toLocaleString()}m` : "n/a"} -{" "}
                  {maxAltitude ? `${maxAltitude.toLocaleString()}m` : "n/a"}
                </p>
              </article>
            </div>

            {activeFilters > 0 ? (
              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Active filters</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedState ? (
                    <Link
                      href={buildExplorerHref(filters, { state: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      State: {selectedState.label} ×
                    </Link>
                  ) : null}
                  {selectedProducer ? (
                    <Link
                      href={buildExplorerHref(filters, { producer: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      Producer: {selectedProducer.label} ×
                    </Link>
                  ) : null}
                  {selectedProcess ? (
                    <Link
                      href={buildExplorerHref(filters, { process: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      Process: {selectedProcess.label} ×
                    </Link>
                  ) : null}
                  {selectedRoast ? (
                    <Link
                      href={buildExplorerHref(filters, { roast: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      Roast: {selectedRoast.label} ×
                    </Link>
                  ) : null}
                  {selectedAltitude ? (
                    <Link
                      href={buildExplorerHref(filters, { altitude: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      Altitude: {selectedAltitude.label} ×
                    </Link>
                  ) : null}
                  {selectedFlavor ? (
                    <Link
                      href={buildExplorerHref(filters, { flavor: undefined })}
                      className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                    >
                      Flavor: {selectedFlavor.label} ×
                    </Link>
                  ) : null}
                  <Link
                    href="/explore"
                    className="rounded-full bg-[var(--site-inverse)] px-3 py-1 text-xs font-medium text-[var(--site-inverse-foreground)]"
                  >
                    Clear all
                  </Link>
                </div>
              </div>
            ) : null}
          </div>
        </header>

        {catalogError ? (
          <StatusPanel title="Could not load the explorer dataset." message={catalogError} tone="error" />
        ) : null}

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <aside className="grid gap-4">
            <FacetPanel
              title="States"
              description="Jump between producing regions."
              options={stateOptions}
              current={filters.state}
              hrefBuilder={(value) => buildExplorerHref(filters, { state: value })}
            />
            <FacetPanel
              title="Producers"
              description="Filter by the family or collective behind the lot."
              options={producerOptions}
              current={filters.producer}
              hrefBuilder={(value) => buildExplorerHref(filters, { producer: value })}
            />
            <FacetPanel
              title="Process"
              description="Sort by how the coffee was processed."
              options={processOptions}
              current={filters.process}
              hrefBuilder={(value) => buildExplorerHref(filters, { process: value })}
            />
            <FacetPanel
              title="Roast"
              description="Move through the roast spectrum."
              options={roastOptions}
              current={filters.roast}
              hrefBuilder={(value) => buildExplorerHref(filters, { roast: value })}
            />
            <FacetPanel
              title="Altitude"
              description="Use elevation as a quick structure cue."
              options={altitudeOptions}
              current={filters.altitude}
              hrefBuilder={(value) => buildExplorerHref(filters, { altitude: value as AltitudeValue })}
            />
            <FacetPanel
              title="Flavor"
              description="Read the tasting notes for the dominant impression."
              options={flavorOptions}
              current={filters.flavor}
              hrefBuilder={(value) => buildExplorerHref(filters, { flavor: value as FlavorValue })}
            />
          </aside>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Explorer results</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                  {filteredCoffees.length > 0 ? "Coffee matches" : "No coffees match these filters"}
                </h2>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
                  The cards below stay aligned to the live catalog while narrowing around the selected discovery
                  facets.
                </p>
              </div>
              <Link
                href={buildExplorerHref({}, {})}
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Reset explorer
              </Link>
            </div>

            {filteredCoffees.length > 0 ? (
              <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredCoffees.map((coffee) => {
                  const flavorTags = getFlavorTags(coffee);
                  const altitudeBand = getAltitudeBand(coffee.farm?.altitude_meters);

                  return (
                    <Link
                      key={coffee.slug}
                      href={`/coffees/${coffee.slug}`}
                      className="group overflow-hidden rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] shadow-[0_18px_55px_rgba(102,62,22,0.08)] transition hover:-translate-y-1 hover:border-[var(--site-accent)] hover:shadow-[0_24px_80px_rgba(102,62,22,0.16)]"
                    >
                      <div className="relative aspect-[4/3] overflow-hidden bg-[var(--site-surface-soft)]">
                        {coffee.image_url ? (
                          <Image
                            src={coffee.image_url}
                            alt={`${coffee.name} artwork`}
                            fill
                            sizes="(max-width: 1024px) 100vw, 33vw"
                            className="object-cover transition duration-500 group-hover:scale-105"
                            unoptimized
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),rgba(240,220,196,0.7))] px-6 text-center">
                            <div>
                              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">
                                {coffee.origin_state}
                              </p>
                              <p className="mt-2 text-xl font-semibold tracking-tight">{coffee.name}</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                              {coffee.origin_state}
                            </p>
                            <h3 className="mt-2 text-xl font-semibold tracking-tight">{coffee.name}</h3>
                          </div>
                          <span className="rounded-full bg-[var(--site-success)] px-3 py-1 text-xs font-semibold text-[var(--site-success-foreground)]">
                            {formatPrice(coffee.price_cents, coffee.currency_code ?? "USD")}
                          </span>
                        </div>

                        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                          {coffee.producer?.name ?? coffee.producer_name}
                        </p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {coffee.process ? (
                            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                              {coffee.process}
                            </span>
                          ) : null}
                          {coffee.roast_level ? (
                            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                              {coffee.roast_level}
                            </span>
                          ) : null}
                          {altitudeBand ? (
                            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                              {getAltitudeLabel(altitudeBand)}
                            </span>
                          ) : null}
                        </div>

                        <div className="mt-4 flex flex-wrap gap-2">
                          {flavorTags.slice(0, 3).map((tag) => (
                            <span
                              key={tag}
                              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                            >
                              {getFlavorLabel(tag)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-6 rounded-[1.75rem] border border-dashed border-[var(--site-border)] bg-[var(--site-surface-soft)] p-6">
                <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                  No coffees match the current facet set. Clear one or more filters to widen the browse lane.
                </p>
              </div>
            )}
          </article>
        </section>
      </section>
    </main>
  );
}

function FacetPanel({
  title,
  description,
  options,
  current,
  hrefBuilder,
}: {
  title: string;
  description: string;
  options: FacetOption[];
  current?: string;
  hrefBuilder: (value: string) => string;
}) {
  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{title}</p>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{description}</p>
        </div>
        {current ? (
          <Link
            href="/explore"
            className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-text-soft)]"
          >
            Clear
          </Link>
        ) : null}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {options.length > 0 ? (
          options.map((option) => {
            const isActive = current === option.value;
            return (
              <Link
                key={option.value}
                href={hrefBuilder(option.value)}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive
                    ? "bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]"
                    : "border border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)] hover:bg-[var(--site-surface-hover)]"
                }`}
              >
                {option.label} ({option.count})
              </Link>
            );
          })
        ) : (
          <span className="rounded-full border border-dashed border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            No data yet
          </span>
        )}
      </div>
    </section>
  );
}
