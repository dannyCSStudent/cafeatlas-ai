import Link from "next/link";

import { fetchFarms, type FarmRead } from "@/lib/cafeatlas-api";
import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function FarmsPage({
  searchParams,
}: {
  searchParams?: Promise<SearchParams>;
}) {
  const resolvedSearchParams = (await searchParams) ?? {};
  const q = firstParam(resolvedSearchParams.q)?.trim() ?? "";

  let farms: FarmRead[] = [];
  let error: string | null = null;

  try {
    farms = await fetchFarms(q || undefined);
  } catch (err) {
    error = err instanceof Error ? err.message : "Failed to load farms.";
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,237,224,0.9)_38%,_rgba(239,222,204,0.98)_100%)] px-6 py-10 text-stone-950 lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            Back to catalog
          </Link>
          <span className="rounded-full bg-stone-950 px-4 py-2 font-semibold text-white">
            Farms
          </span>
        </div>

        <header className="max-w-3xl space-y-4">
          <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Farm profiles
          </h1>
          <p className="text-lg leading-8 text-stone-700">
            Explore the farms behind each roast and the producers they belong to.
          </p>
        </header>

        <form>
          <SearchToolbar
            label="Search farms"
            name="q"
            defaultValue={q}
            placeholder="Name, state, municipality, or producer"
            clearHref={q ? "/farms" : undefined}
          />
        </form>

        {error ? (
          <StatusPanel title="Could not load farms." message={error} tone="error" />
        ) : farms.length === 0 ? (
          <StatusPanel
            title={q ? "No farms matched your search." : "No farms yet."}
            message={
              q
                ? "Try a different search term or clear the filter."
                : "Seed data has not been loaded yet."
            }
            tone="empty"
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {farms.map((farm) => (
              <article
                key={farm.id}
                className="rounded-[1.75rem] border border-stone-200 bg-white p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Farm</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{farm.name}</h2>
                  </div>
                  <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold text-stone-700">
                    {farm.state}
                  </span>
                </div>

                <p className="mt-4 min-h-12 text-sm leading-6 text-stone-600">
                  {farm.description || "A farm profile without a description yet."}
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {farm.municipality ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {farm.municipality}
                    </span>
                  ) : null}
                  {farm.producer ? (
                    <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-medium text-stone-700">
                      {farm.producer.name}
                    </span>
                  ) : null}
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-stone-200 pt-4">
                  <p className="text-sm text-stone-600">
                    {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
                  </p>
                  <Link
                    href={`/farms/${farm.slug}`}
                    className="rounded-full bg-stone-950 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5"
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
