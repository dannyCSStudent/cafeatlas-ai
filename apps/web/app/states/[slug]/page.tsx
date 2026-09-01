import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import {
  fetchCoffeeCatalog,
  fetchFarms,
  fetchProducers,
  fetchStateBySlug,
  formatPrice,
  type CoffeeRead,
  type FarmRead,
  type ProducerRead,
} from "@/lib/cafeatlas-api";

type RouteParams = {
  slug: string;
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function collectGalleryImages(coffees: CoffeeRead[], farms: FarmRead[], producers: ProducerRead[]) {
  const images = [
    ...coffees.flatMap((coffee) => [
      ...(coffee.image_url
        ? [
            {
              id: coffee.id * 1000,
              image_url: coffee.image_url,
              alt_text: `${coffee.name} artwork`,
              caption: coffee.description || coffee.name,
              sort_order: 0,
              created_at: coffee.created_at,
            },
          ]
        : []),
      ...(coffee.images ?? []),
    ]),
    ...farms.flatMap((farm) => [
      ...(farm.image_url
        ? [
            {
              id: farm.id * 1000,
              image_url: farm.image_url,
              alt_text: `${farm.name} artwork`,
              caption: farm.description || farm.name,
              sort_order: 0,
              created_at: farm.created_at,
            },
          ]
        : []),
      ...(farm.images ?? []),
    ]),
    ...producers.flatMap((producer) => [
      ...(producer.image_url
        ? [
            {
              id: producer.id * 1000,
              image_url: producer.image_url,
              alt_text: `${producer.name} artwork`,
              caption: producer.description || producer.name,
              sort_order: 0,
              created_at: producer.created_at,
            },
          ]
        : []),
      ...(producer.images ?? []),
    ]),
  ];

  const seen = new Set<string>();
  return images
    .filter((image) => {
      if (seen.has(image.image_url)) {
        return false;
      }
      seen.add(image.image_url);
      return true;
    })
    .sort((left, right) => left.sort_order - right.sort_order || left.id - right.id);
}

function summarizeProcesses(coffees: CoffeeRead[]) {
  const counts = new Map<string, number>();

  coffees.forEach((coffee) => {
    const process = coffee.process?.trim();
    if (!process) {
      return;
    }

    counts.set(process, (counts.get(process) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([process, count]) => ({
      process,
      count,
      description: getProcessDescription(process),
    }))
    .sort((left, right) => right.count - left.count || left.process.localeCompare(right.process));
}

function getProcessLabel(value?: string | null) {
  return value?.trim() || "Process unknown";
}

function getProcessDescription(value?: string | null) {
  const normalized = value?.toLowerCase() ?? "";

  if (normalized.includes("washed")) {
    return "Clean, clear, and structured cups that keep origin transparent.";
  }

  if (normalized.includes("honey")) {
    return "Round sweetness with a fuller middle and a gentle texture.";
  }

  if (normalized.includes("natural")) {
    return "Fruit-forward, plush, and often more expressive in the finish.";
  }

  return "A processing style that helps frame sweetness, structure, and clarity.";
}

function getAltitudeRange(farms: FarmRead[]) {
  const altitudes = farms.map((farm) => farm.altitude_meters).filter((value): value is number => typeof value === "number");

  if (altitudes.length === 0) {
    return "Altitude n/a";
  }

  const min = Math.min(...altitudes);
  const max = Math.max(...altitudes);

  return min === max ? `${min.toLocaleString()} m` : `${min.toLocaleString()} - ${max.toLocaleString()} m`;
}

function summarizeMunicipalities(farms: FarmRead[]) {
  const counts = new Map<string, number>();

  farms.forEach((farm) => {
    if (!farm.municipality) {
      return;
    }

    counts.set(farm.municipality, (counts.get(farm.municipality) ?? 0) + 1);
  });

  return [...counts.entries()]
    .map(([municipality, count]) => ({ municipality, count }))
    .sort((left, right) => right.count - left.count || left.municipality.localeCompare(right.municipality))
    .slice(0, 4);
}

function getClimateNote(stateName: string, farms: FarmRead[]) {
  const altitudes = farms.map((farm) => farm.altitude_meters).filter((value): value is number => typeof value === "number");

  if (altitudes.length === 0) {
    return `The climate story for ${stateName} will deepen as more altitude and farm data are added to the atlas.`;
  }

  const min = Math.min(...altitudes);
  const max = Math.max(...altitudes);

  if (max >= 1500) {
    return `${stateName} includes high-elevation farms that usually favor slower cherry development, brighter acidity, and a cleaner finish.`;
  }

  if (min <= 900) {
    return `${stateName} spans warmer pockets and mid-elevation sites, so the profile leans toward round sweetness and more textured cups.`;
  }

  return `${stateName} balances elevation and warmth across its farms, which tends to keep the cup structure even and readable.`;
}

function getHistoryNote(stateName: string, farms: FarmRead[], coffees: CoffeeRead[]) {
  return `${stateName} is represented here by ${farms.length.toLocaleString()} farms and ${coffees.length.toLocaleString()} coffees, keeping the regional story tied to live catalog records instead of static copy.`;
}

function getCultureNote(stateName: string, producers: ProducerRead[], municipalities: { municipality: string; count: number }[]) {
  const producerLabel = producers.length === 1 ? "producer" : "producers";
  const municipalityLabel = municipalities.length === 1 ? "municipality" : "municipalities";

  return `${stateName} currently connects ${producers.length.toLocaleString()} ${producerLabel} across ${municipalities.length.toLocaleString()} ${municipalityLabel}, which gives the page enough local texture to frame culture and trade routes.`;
}

async function loadStateProfile(slug: string) {
  const state = await fetchStateBySlug(slug);

  const [coffeeResult, farmResult, producerResult] = await Promise.allSettled([
    fetchCoffeeCatalog({ state: state.name, sort: "featured", pageSize: 6 }),
    fetchFarms(),
    fetchProducers(),
  ]);

  const coffees = coffeeResult.status === "fulfilled" ? coffeeResult.value.items : [];
  const farms = farmResult.status === "fulfilled" ? farmResult.value.filter((farm) => farm.state === state.name) : [];
  const producers =
    producerResult.status === "fulfilled"
      ? producerResult.value.filter((producer) => producer.farms.some((farm) => farm.state === state.name))
      : [];

  return { state, coffees, farms, producers };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const state = await fetchStateBySlug(slug);
    return {
      title: `${state.name} | CafeAtlas AI`,
      description: `Regional coffee profile for ${state.name}.`,
    };
  } catch {
    return {
      title: "State | CafeAtlas AI",
      description: "Regional coffee profile.",
    };
  }
}

export default async function StateDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  let profile;
  try {
    profile = await loadStateProfile(slug);
  } catch (error) {
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
    if (status === 404) {
      notFound();
    }
    throw error;
  }

  const { state, coffees, farms, producers } = profile;
  const galleryImages = collectGalleryImages(coffees, farms, producers);
  const municipalitySummary = summarizeMunicipalities(farms);
  const processSummaries = summarizeProcesses(coffees);
  const altitudeRange = getAltitudeRange(farms);
  const leadingProducer = producers[0] ?? null;
  const leadingFarm = farms[0] ?? null;

  return (
    <DetailPageShell
      actions={
        <>
          <Link
            href="/states"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to states
          </Link>
          <Link
            href={`/discover?state=${encodeURIComponent(state.slug)}`}
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Open discovery
          </Link>
          <Link
            href={`/farms?q=${encodeURIComponent(state.name)}`}
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Search farms
          </Link>
        </>
      }
      eyebrow="Regional profile"
      title={state.name}
      description={`A live coffee atlas page for ${state.name}, built from farm, producer, and catalog records.`}
      stats={[
        { label: "Farms", value: state.farm_count },
        { label: "Coffees", value: state.coffee_count },
        { label: "Listed", value: formatDate(state.created_at) },
      ]}
      media={
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] shadow-[0_20px_70px_rgba(102,62,22,0.14)]">
          <div className="space-y-4 p-5">
            <div className="overflow-hidden rounded-[1.4rem] border border-[var(--site-border)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),rgba(240,220,196,0.52))]">
              {galleryImages[0] ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={galleryImages[0].image_url}
                    alt={galleryImages[0].alt_text || `${state.name} region image`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div className="flex aspect-[4/3] items-end p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-[var(--site-accent)] text-3xl font-semibold text-[var(--site-accent-foreground)] shadow-2xl shadow-stone-950/20">
                      {buildMonogram(state.name)}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Regional atlas</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{state.name}</p>
                      <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--site-text-soft)]">
                        {getHistoryNote(state.name, farms, coffees)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {galleryImages.length > 1 ? (
              <div className="grid gap-2 sm:grid-cols-4">
                {galleryImages.slice(1, 5).map((image) => (
                  <div key={image.id} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-[var(--site-border)]">
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `${state.name} gallery image`}
                      fill
                      sizes="(max-width: 1024px) 25vw, 12vw"
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 border-t border-[var(--site-border)] p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Elevation span</p>
              <p className="mt-2 text-base font-semibold">{altitudeRange}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Top municipality</p>
              <p className="mt-2 text-base font-semibold">{municipalitySummary[0]?.municipality ?? "n/a"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Leading farm</p>
              <p className="mt-2 text-base font-semibold">{leadingFarm?.name ?? "n/a"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Leading producer</p>
              <p className="mt-2 text-base font-semibold">{leadingProducer?.name ?? "n/a"}</p>
            </div>
          </div>

          <div className="border-t border-[var(--site-border)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Regional tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {state.slug}
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {state.farm_count.toLocaleString()} farms
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {state.coffee_count.toLocaleString()} coffees
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {municipalitySummary.length.toLocaleString()} municipalities
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {processSummaries[0]?.process ?? "Process n/a"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">History</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{getHistoryNote(state.name, farms, coffees)}</p>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Climate and terrain</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Climate note</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">{getClimateNote(state.name, farms)}</p>
          </div>
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Elevation</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
              {altitudeRange}. That range helps explain why the region can support both bright and structured cups.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Map frame</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
              Open the discover view to see this state inside the broader Mexico map and compare it against the other
              producing regions.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Local culture</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          {getCultureNote(state.name, producers, municipalitySummary)}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          {municipalitySummary.slice(0, 3).map((item) => (
            <div key={item.municipality} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-sm font-semibold">{item.municipality}</p>
              <p className="mt-1 text-sm text-[var(--site-text-soft)]">{item.count} farms</p>
            </div>
          ))}
          {municipalitySummary.length === 0 ? (
            <p className="text-sm text-[var(--site-text-soft)]">Municipality data will appear here as more farms are loaded.</p>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Processing methods</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          The processing breakdown below is derived from the live coffees attached to this state.
        </p>
        <div className="mt-4 grid gap-3">
          {processSummaries.length > 0 ? (
            processSummaries.map((process) => (
              <div key={process.process} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-base font-semibold">{getProcessLabel(process.process)}</p>
                    <p className="mt-1 text-sm text-[var(--site-text-soft)]">{process.description}</p>
                  </div>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                    {process.count} coffee{process.count === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-[var(--site-text-soft)]">No processing data is attached to this region yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Origin network</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          These farms and producers keep the regional story grounded in actual catalog entries.
        </p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Farms</p>
            <div className="mt-3 space-y-3">
              {farms.slice(0, 4).map((farm) => (
                <Link
                  key={farm.id}
                  href={`/farms/${farm.slug}`}
                  className="block rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-3 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
                >
                  <div className="text-sm font-semibold">{farm.name}</div>
                  <p className="mt-1 text-sm text-[var(--site-text-soft)]">
                    {farm.municipality || "Municipality n/a"} · {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
                  </p>
                </Link>
              ))}
              {farms.length === 0 ? (
                <p className="text-sm text-[var(--site-text-soft)]">No farms are attached to this state yet.</p>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Producers</p>
            <div className="mt-3 space-y-3">
              {producers.slice(0, 4).map((producer) => (
                <Link
                  key={producer.id}
                  href={`/producers/${producer.slug}`}
                  className="block rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-3 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
                >
                  <div className="text-sm font-semibold">{producer.name}</div>
                  <p className="mt-1 text-sm text-[var(--site-text-soft)]">
                    {producer.family || "Family n/a"} · {producer.farms.length} farms
                  </p>
                </Link>
              ))}
              {producers.length === 0 ? (
                <p className="text-sm text-[var(--site-text-soft)]">No producers are attached to this state yet.</p>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Products</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          These are the coffees currently surfaced from this region, with featured lots taking the lead.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {coffees.length > 0 ? (
            coffees.map((coffee, index) => (
              <Link
                key={coffee.id}
                href={`/coffees/${coffee.slug}`}
                className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
              >
                <div className="flex items-center justify-between gap-2 text-[11px] uppercase tracking-[0.18em] text-[var(--site-muted)]">
                  <span>#{index + 1}</span>
                  {coffee.is_featured ? (
                    <span className="rounded-full bg-[var(--site-accent)] px-2 py-1 font-semibold text-[var(--site-accent-foreground)] tracking-normal">
                      Featured
                    </span>
                  ) : null}
                </div>
                <div className="mt-3 text-sm font-semibold">{coffee.name}</div>
                <p className="mt-1 text-sm text-[var(--site-text-soft)]">
                  {coffee.process || "Process n/a"}
                  {coffee.varietal ? ` · ${coffee.varietal}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                    {formatPrice(coffee.price_cents, coffee.currency_code ?? "USD")}
                  </span>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                    {leadingProducer?.name ?? coffee.producer_name}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-[var(--site-text-soft)]">No coffees are attached to this state yet.</p>
          )}
        </div>
      </div>
    </DetailPageShell>
  );
}
