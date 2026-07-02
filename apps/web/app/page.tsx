import Link from "next/link";

import {
  getApiBaseUrl,
  fetchCoffeeCatalog,
  fetchFeaturedFarms,
  fetchFeaturedProducers,
  formatPrice,
  type CoffeeCatalogParams,
} from "@/lib/cafeatlas-api";
import { CatalogFilterForm } from "@/components/catalog-filter-form";
import { StatusPanel } from "@/components/status-panel";

type SearchParams = Record<string, string | string[] | undefined>;

const ALLOWED_SORTS = new Set(["newest", "oldest", "price_asc", "price_desc", "featured"]);
const DEFAULT_PAGE_SIZE = 6;
const PAGE_SIZE_OPTIONS = [6, 12, 18];

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseBoolean(value: string | string[] | undefined) {
  const normalized = firstParam(value);
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function buildParams(searchParams: SearchParams): CoffeeCatalogParams {
  const page = Number.parseInt(firstParam(searchParams.page) ?? "1", 10);
  const pageSize = Number.parseInt(firstParam(searchParams.page_size) ?? String(DEFAULT_PAGE_SIZE), 10);
  const sort = firstParam(searchParams.sort) ?? "newest";
  const q = firstParam(searchParams.q)?.trim();
  const state = firstParam(searchParams.state)?.trim();
  const producerSlug = firstParam(searchParams.producer_slug)?.trim();
  const featured = parseBoolean(searchParams.featured);

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    pageSize: Number.isFinite(pageSize) && pageSize > 0 ? pageSize : DEFAULT_PAGE_SIZE,
    sort: ALLOWED_SORTS.has(sort) ? sort : "newest",
    q: q || undefined,
    state: state || undefined,
    producerSlug: producerSlug || undefined,
    featured,
  };
}

function buildQueryString(params: CoffeeCatalogParams) {
  const query = new URLSearchParams();

  if (params.page) query.set("page", String(params.page));
  if (params.pageSize) query.set("page_size", String(params.pageSize));
  if (params.sort) query.set("sort", params.sort);
  if (params.q) query.set("q", params.q);
  if (params.state) query.set("state", params.state);
  if (params.producerSlug) query.set("producer_slug", params.producerSlug);
  if (typeof params.featured === "boolean") query.set("featured", String(params.featured));

  return query.toString();
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const params = buildParams(resolvedSearchParams);

  let catalog = null;
  let error: string | null = null;
  let producers: Awaited<ReturnType<typeof fetchFeaturedProducers>> = [];
  let farms: Awaited<ReturnType<typeof fetchFeaturedFarms>> = [];
  let originError: string | null = null;

  try {
    catalog = await fetchCoffeeCatalog(params);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load the coffee catalog.";
  }

  try {
    const [nextProducers, nextFarms] = await Promise.all([fetchFeaturedProducers(), fetchFeaturedFarms()]);
    producers = nextProducers;
    farms = nextFarms;
  } catch (err) {
    originError = err instanceof Error ? err.message : "Failed to load origin spotlights.";
  }

  const total = catalog?.total ?? 0;
  const page = catalog?.page ?? params.page ?? 1;
  const pageSize = catalog?.page_size ?? params.pageSize ?? DEFAULT_PAGE_SIZE;
  const totalPages = catalog?.total_pages ?? 0;
  const items = catalog?.items ?? [];
  const hasNext = catalog?.has_next ?? false;
  const hasPrev = catalog?.has_prev ?? false;
  const featuredItems = items.filter((item) => item.is_featured);
  const spotlightItems = featuredItems.length > 0 ? featuredItems.slice(0, 3) : items.slice(0, 3);
  const producerSpotlight = [...producers].sort((left, right) => right.farms.length - left.farms.length)[0];
  const farmSpotlight = [...farms].sort((left, right) => (right.altitude_meters ?? 0) - (left.altitude_meters ?? 0))[0];
  const activeFilters = [
    params.q,
    params.state,
    params.producerSlug,
    params.featured !== null ? "featured" : null,
  ].filter(Boolean).length;

  const baseControls = {
    pageSize,
    sort: params.sort,
    state: params.state,
    producerSlug: params.producerSlug,
    q: params.q,
    featured: params.featured,
  } satisfies CoffeeCatalogParams;

  const nextPage = {
    ...baseControls,
    page: Math.min(page + 1, Math.max(totalPages, page)),
  } satisfies CoffeeCatalogParams;

  const prevPage = {
    ...baseControls,
    page: Math.max(page - 1, 1),
  } satisfies CoffeeCatalogParams;

  return (
    <main className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.92),rgba(249,236,217,0.88)_34%,rgba(240,220,196,0.96)_100%)] text-stone-950">
      <section className="relative isolate mx-auto flex w-full max-w-7xl flex-col gap-10 px-6 py-10 lg:px-10 lg:py-14">
        <div className="absolute inset-x-0 top-0 -z-10 mx-auto h-80 w-[90%] rounded-full bg-[radial-gradient(circle, rgba(120,69,29,0.22),_transparent_65%)] blur-3xl" />

        <header className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-end">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-3 rounded-full border border-stone-300/80 bg-white/75 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-stone-600 shadow-sm backdrop-blur">
              CafeAtlas AI
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              Editorial coffee destination
            </div>

            <div className="max-w-4xl space-y-5">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-7xl">
                Discover Mexican coffee through origin stories, live data, and a catalog built to feel like a place.
              </h1>
              <p className="max-w-2xl text-base leading-8 text-stone-700 sm:text-lg">
                CafeAtlas reads directly from the FastAPI backend, so every browse path reflects real coffees,
                producers, and farms instead of static mock content.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <a
                href="#featured"
                className="rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-stone-950/20 transition hover:-translate-y-0.5"
              >
                Featured coffees
              </a>
              <a
                href="#catalog"
                className="rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Browse catalog
              </a>
              <Link
                href="/producers"
                className="rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Producers
              </Link>
              <Link
                href="/farms"
                className="rounded-full border border-stone-300 bg-white/80 px-5 py-3 text-sm font-semibold text-stone-800 shadow-sm transition hover:-translate-y-0.5 hover:bg-white"
              >
                Farms
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <article className="rounded-3xl border border-stone-300/80 bg-white/80 p-5 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur">
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Live coffees</div>
                <div className="mt-3 text-4xl font-semibold">{total.toString().padStart(2, "0")}</div>
              </article>
              <article className="rounded-3xl border border-stone-300/80 bg-stone-950 p-5 text-white shadow-[0_20px_80px_rgba(28,17,8,0.18)]">
                <div className="text-xs uppercase tracking-[0.24em] text-stone-300">Featured in view</div>
                <div className="mt-3 text-4xl font-semibold">{featuredItems.length}</div>
              </article>
              <article className="rounded-3xl border border-stone-300/80 bg-white/80 p-5 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur">
                <div className="text-xs uppercase tracking-[0.24em] text-stone-500">Active filters</div>
                <div className="mt-3 text-4xl font-semibold">{activeFilters}</div>
              </article>
            </div>
          </div>

          <aside className="grid gap-4">
            <div className="rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Mission</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                A premium coffee destination that treats origin as the starting point, not the footnote.
              </p>
              <p className="mt-4 text-sm leading-7 text-stone-600">
                The landing page now introduces the platform, surfaces featured coffees, and keeps the catalog one
                click away for deeper exploration.
              </p>
            </div>

            <div className="rounded-[2rem] border border-stone-300/80 bg-stone-950 p-6 text-white shadow-[0_20px_80px_rgba(28,17,8,0.18)]">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Catalog source</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight">
                Every screen reads from the same FastAPI data model.
              </p>
              <a
                href={`${getApiBaseUrl()}/api/v1/coffees`}
                className="mt-6 inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                View API
              </a>
            </div>
          </aside>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Origin first",
              body: "Every coffee, producer, and farm carries its origin, so the storefront reads like a travel guide.",
            },
            {
              title: "Live catalog",
              body: "Filters, search, and pagination come from the backend instead of static placeholders.",
            },
            {
              title: "Editorial surface",
              body: "The homepage is now a landing page foundation, not just a raw list of records.",
            },
          ].map((card) => (
            <article
              key={card.title}
              className="rounded-[1.75rem] border border-stone-300/70 bg-white/75 p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{card.title}</p>
              <p className="mt-3 text-sm leading-7 text-stone-700">{card.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-[2.25rem] border border-stone-300/70 bg-white/75 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Farmer spotlight</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  Meet the producer shaping this collection
                </h2>
              </div>
              <Link
                href="/producers"
                className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-white"
              >
                Browse producers
              </Link>
            </div>

            {originError ? (
              <StatusPanel title="Could not load producer spotlight." message={originError} tone="error" />
            ) : producerSpotlight ? (
              <div className="mt-6 rounded-[1.75rem] border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Producer</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{producerSpotlight.name}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-600">
                      {producerSpotlight.description || "A producer profile without a description yet."}
                    </p>
                  </div>
                  <Link
                    href={`/producers/${producerSpotlight.slug}`}
                    className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                  >
                    Open profile
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-500">Family</div>
                    <div className="mt-2 text-lg font-semibold">{producerSpotlight.family || "n/a"}</div>
                  </div>
                  <div className="rounded-2xl border border-stone-200 bg-white p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-500">Attached farms</div>
                    <div className="mt-2 text-lg font-semibold">{producerSpotlight.farms.length}</div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  {producerSpotlight.farms.slice(0, 3).map((farm) => (
                    <Link
                      key={farm.id}
                      href={`/farms/${farm.slug}`}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm transition hover:bg-stone-50"
                    >
                      {farm.name}
                    </Link>
                  ))}
                </div>
              </div>
            ) : (
              <StatusPanel
                title="No producer spotlight is available yet."
                message="Seed data will populate this section once producers exist in the database."
                tone="empty"
              />
            )}
          </article>

          <article className="rounded-[2.25rem] border border-stone-300/70 bg-stone-950 p-6 text-white shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-stone-300">Farm spotlight</p>
                <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                  A farm detail that grounds the catalog in place
                </h2>
              </div>
              <Link
                href="/farms"
                className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
              >
                Browse farms
              </Link>
            </div>

            {originError ? (
              <StatusPanel title="Could not load farm spotlight." message={originError} tone="error" />
            ) : farmSpotlight ? (
              <div className="mt-6 rounded-[1.75rem] border border-white/10 bg-white/5 p-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Farm</p>
                    <h3 className="mt-2 text-2xl font-semibold tracking-tight">{farmSpotlight.name}</h3>
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-300">
                      {farmSpotlight.description || "A farm profile without a description yet."}
                    </p>
                  </div>
                  <Link
                    href={`/farms/${farmSpotlight.slug}`}
                    className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-stone-950 transition hover:-translate-y-0.5"
                  >
                    Open profile
                  </Link>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-300">State</div>
                    <div className="mt-2 text-lg font-semibold">{farmSpotlight.state}</div>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs uppercase tracking-[0.22em] text-stone-300">Altitude</div>
                    <div className="mt-2 text-lg font-semibold">
                      {farmSpotlight.altitude_meters ? `${farmSpotlight.altitude_meters.toLocaleString()} m` : "n/a"}
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-stone-200">
                    {farmSpotlight.municipality || "n/a"}
                  </span>
                  {farmSpotlight.producer ? (
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-stone-200">
                      {farmSpotlight.producer.name}
                    </span>
                  ) : null}
                </div>
              </div>
            ) : (
              <StatusPanel
                title="No farm spotlight is available yet."
                message="Seed data will populate this section once farms exist in the database."
                tone="empty"
              />
            )}
          </article>
        </section>

        <section id="featured" className="space-y-6 rounded-[2.25rem] border border-stone-300/70 bg-white/70 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Featured coffees</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-balance sm:text-3xl">
                A tighter view into the roasts worth spotlighting
              </h2>
            </div>
            <Link
              href="#catalog"
              className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              Open full catalog
            </Link>
          </div>

          {error ? (
            <StatusPanel title="Could not load featured coffees." message={error} tone="error" />
          ) : spotlightItems.length === 0 ? (
            <StatusPanel
              title="No featured coffees are available in this view."
              message="Clear filters or switch to a broader catalog view to see highlighted coffees."
              tone="empty"
            />
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {spotlightItems.map((coffee) => (
                <article
                  key={coffee.id}
                  className="group rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(102,62,22,0.16)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{coffee.origin_state}</p>
                      <h3 className="mt-2 text-2xl font-semibold tracking-tight">{coffee.name}</h3>
                    </div>
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                      Featured
                    </span>
                  </div>

                  <p className="mt-4 line-clamp-3 min-h-12 text-sm leading-6 text-stone-600">
                    {coffee.description || "A coffee with no description yet."}
                  </p>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {coffee.producer ? (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                        {coffee.producer.name}
                      </span>
                    ) : null}
                    {coffee.farm ? (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                        {coffee.farm.state}
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Price</p>
                      <p className="mt-1 text-lg font-semibold">{formatPrice(coffee.price_cents)}</p>
                    </div>
                    <Link
                      href={`/coffees/${coffee.slug}`}
                      className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                    >
                      Details
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section
          id="catalog"
          className="grid gap-6 rounded-[2.25rem] border border-stone-300/70 bg-white/70 p-5 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[18rem_1fr]"
        >
          <CatalogFilterForm params={params} pageSizeOptions={PAGE_SIZE_OPTIONS} />

          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.22em] text-stone-500">Catalog</p>
                <p className="mt-1 text-lg font-medium text-stone-800">
                  {error ? "Backend unavailable" : `${total} coffees in the live catalog`}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Link
                  href={`?${buildQueryString(prevPage)}`}
                  className={`rounded-full border px-4 py-2 transition ${
                    hasPrev ? "border-stone-300 bg-white text-stone-800 hover:bg-stone-50" : "pointer-events-none border-stone-200 bg-stone-100 text-stone-400"
                  }`}
                >
                  Previous
                </Link>
                <span className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-white">
                  {page} / {Math.max(totalPages, 1)}
                </span>
                <Link
                  href={`?${buildQueryString(nextPage)}`}
                  className={`rounded-full border px-4 py-2 transition ${
                    hasNext ? "border-stone-300 bg-white text-stone-800 hover:bg-stone-50" : "pointer-events-none border-stone-200 bg-stone-100 text-stone-400"
                  }`}
                >
                  Next
                </Link>
              </div>
            </div>

            {error ? (
              <StatusPanel title="Could not load coffees." message={error} tone="error" />
            ) : items.length === 0 ? (
              <StatusPanel
                title="No coffees matched the current filters."
                message="Try clearing a filter or searching with a broader term."
                tone="empty"
              />
            ) : (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {items.map((coffee) => (
                  <article
                    key={coffee.id}
                    className="group rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)] transition hover:-translate-y-1 hover:shadow-[0_24px_80px_rgba(102,62,22,0.16)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">
                          {coffee.origin_state}
                        </p>
                        <h2 className="mt-2 text-2xl font-semibold tracking-tight">{coffee.name}</h2>
                      </div>
                      {coffee.is_featured ? (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                          Featured
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-4 line-clamp-3 min-h-12 text-sm leading-6 text-stone-600">
                      {coffee.description || "A coffee with no description yet."}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {coffee.producer ? (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                          {coffee.producer.name}
                        </span>
                      ) : null}
                      {coffee.farm ? (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                          {coffee.farm.state}
                        </span>
                      ) : null}
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.22em] text-stone-500">Price</p>
                        <p className="mt-1 text-lg font-semibold">{formatPrice(coffee.price_cents)}</p>
                      </div>
                      <Link
                        href={`/coffees/${coffee.slug}`}
                        className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
                      >
                        Details
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </section>
    </main>
  );
}
