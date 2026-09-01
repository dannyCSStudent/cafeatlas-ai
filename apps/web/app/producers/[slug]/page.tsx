import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import { fetchCoffeeCatalog, fetchFarmBySlug, fetchProducerBySlug, formatPrice, type CoffeeRead, type FarmRead, type ImageRead } from "@/lib/cafeatlas-api";

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

function collectGalleryImages(producerImageUrl: string | null | undefined, producerImages: ImageRead[], farms: FarmRead[]) {
  const images = [
    ...(producerImageUrl
      ? [
          {
            id: -1,
            image_url: producerImageUrl,
            alt_text: null,
            caption: "Producer hero image",
            sort_order: -1,
            created_at: new Date(0).toISOString(),
          },
        ]
      : []),
    ...producerImages,
    ...farms.flatMap((farm) =>
      (farm.images ?? []).map((image) => ({
        ...image,
        caption: image.caption || `${farm.name} photo`,
      }))
    ),
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

function getAltitudeRange(farms: FarmRead[]) {
  const altitudes = farms.map((farm) => farm.altitude_meters).filter((value): value is number => typeof value === "number");

  if (altitudes.length === 0) {
    return "Altitude n/a";
  }

  const min = Math.min(...altitudes);
  const max = Math.max(...altitudes);

  return min === max ? `${min.toLocaleString()} m` : `${min.toLocaleString()} - ${max.toLocaleString()} m`;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const producer = await fetchProducerBySlug(slug);
    return {
      title: `${producer.name} | CafeAtlas AI`,
      description: producer.description ?? `Producer profile for ${producer.name}.`,
    };
  } catch {
    return {
      title: "Producer | CafeAtlas AI",
      description: "Producer profile.",
    };
  }
}

export default async function ProducerDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  let producer;
  try {
    producer = await fetchProducerBySlug(slug);
  } catch (error) {
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
    if (status === 404) {
      notFound();
    }
    throw error;
  }

  const [linkedCoffees, farmResults] = await Promise.all([
    fetchCoffeeCatalog({
      producerSlug: producer.slug,
      pageSize: 4,
      sort: "featured",
    }),
    Promise.allSettled(producer.farms.map((farm) => fetchFarmBySlug(farm.slug))),
  ]);

  const detailedFarmProfiles = farmResults
    .filter((result): result is PromiseFulfilledResult<FarmRead> => result.status === "fulfilled")
    .map((result) => result.value)
    .sort((left, right) => left.name.localeCompare(right.name));

  const farmProfiles: FarmRead[] =
    detailedFarmProfiles.length > 0 ? detailedFarmProfiles : producer.farms.map((farm) => ({ ...farm, images: [] }));

  const galleryImages = collectGalleryImages(producer.image_url, producer.images ?? [], farmProfiles);
  const processSummaries = summarizeProcesses(linkedCoffees.items);
  const altitudeRange = getAltitudeRange(farmProfiles);
  const primaryFarm = farmProfiles[0] ?? producer.farms[0] ?? null;

  return (
    <DetailPageShell
      actions={
        <>
          <Link
            href="/producers"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to producers
          </Link>
          <Link
            href={`/?producer_slug=${encodeURIComponent(producer.slug)}`}
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            View coffees
          </Link>
        </>
      }
      eyebrow="Producer profile"
      title={producer.name}
      description={producer.description || "This producer does not have a description yet."}
      stats={[
        { label: "Family", value: producer.family || "n/a" },
        { label: "Farms", value: producer.farms.length },
        { label: "Listed", value: formatDate(producer.created_at) },
      ]}
      media={
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] shadow-[0_20px_70px_rgba(102,62,22,0.14)]">
          <div className="space-y-4 p-5">
            <div className="overflow-hidden rounded-[1.4rem] border border-[var(--site-border)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.78),rgba(240,220,196,0.52))]">
              {galleryImages[0] ? (
                <div className="relative aspect-[4/3]">
                  <Image
                    src={galleryImages[0].image_url}
                    alt={galleryImages[0].alt_text || `${producer.name} hero image`}
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
                      {buildMonogram(producer.name)}
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Producer collective</p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">{producer.name}</p>
                      <p className="mt-2 max-w-sm text-sm leading-7 text-[var(--site-text-soft)]">
                        {producer.description || "A producer profile without a description yet."}
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
                      alt={image.alt_text || `${producer.name} gallery image`}
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
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Family</p>
              <p className="mt-2 text-base font-semibold">{producer.family || "n/a"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Altitude span</p>
              <p className="mt-2 text-base font-semibold">{altitudeRange}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Farms</p>
              <p className="mt-2 text-base font-semibold">{producer.farms.length}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Processes</p>
              <p className="mt-2 text-base font-semibold">{processSummaries.length || "n/a"}</p>
            </div>
          </div>

          <div className="border-t border-[var(--site-border)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Profile tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {producer.family || "Family unknown"}
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {producer.farms.length > 1 ? "Multi-farm producer" : "Single farm"}
              </span>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {primaryFarm?.state ?? "State n/a"}
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
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Producer story</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          {producer.family
            ? `The ${producer.family} family profile keeps the producer identity visible across the farms, coffees, and images attached to this origin.`
            : "This profile keeps the producer identity visible across the farms, coffees, and images attached to this origin."}
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Origin network</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
              {producer.farms.length > 1
                ? "Multiple farms feed this producer profile, giving the story a wider geographic footprint."
                : "One farm currently anchors this producer profile."}
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Harvest methods</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
              The linked coffees expose the post-harvest methods available in the catalog today.
            </p>
          </div>
          <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
            <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Video story</p>
            <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
              A short documentary slot is scaffolded here for future farm walks, interviews, or harvest coverage.
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Linked farms</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          The farms below keep the origin chain connected to the producer profile.
        </p>
        <div className="mt-4 space-y-3">
          {farmProfiles.length > 0 ? (
            farmProfiles.map((farm) => (
              <Link
                key={farm.id}
                href={`/farms/${farm.slug}`}
                className="block rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-3 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
              >
                <div className="font-semibold">{farm.name}</div>
                <div className="mt-1 text-sm text-[var(--site-text-soft)]">
                  {farm.state}
                  {farm.municipality ? ` · ${farm.municipality}` : ""}
                </div>
                {farm.description ? (
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-[var(--site-text-soft)]">{farm.description}</p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  {farm.municipality ? (
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                      {farm.municipality}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                    {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-[var(--site-text-soft)]">No farms are attached to this producer yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Reading cues</p>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
          Start with the producer to understand the collective, then read the farms to see how the origin chain
          fans out across places and altitudes.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {producer.family || "Family unknown"}
          </span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {producer.farms.length} farms
          </span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {primaryFarm?.state ?? "State n/a"}
          </span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {altitudeRange}
          </span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {processSummaries[0]?.process ?? "Process n/a"}
          </span>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Processing methods</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          These are the post-harvest styles currently visible across the linked coffees.
        </p>
        <div className="mt-4 grid gap-3">
          {processSummaries.length > 0 ? (
            processSummaries.map((process) => (
              <div key={process.process} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
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
            <p className="text-sm text-[var(--site-text-soft)]">No processing data is attached to the linked coffees yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Linked coffees</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          These coffees carry the producer forward into the catalog, with featured lots surfaced first so you can
          compare process, varietal, and tasting notes in the current spotlight order.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {linkedCoffees.items.length > 0 ? (
            linkedCoffees.items.map((coffee, index) => (
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
                <div className="text-sm font-semibold">{coffee.name}</div>
                <p className="mt-1 text-sm text-[var(--site-text-soft)]">
                  {coffee.process || "Process unknown"}
                  {coffee.varietal ? ` · ${coffee.varietal}` : ""}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                    {coffee.origin_state}
                  </span>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[11px] font-medium text-[var(--site-text-soft)]">
                    {formatPrice(coffee.price_cents)}
                  </span>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-[var(--site-text-soft)]">No coffees are linked to this producer yet.</p>
          )}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Continue exploring</p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Link
            href={`/?producer_slug=${encodeURIComponent(producer.slug)}`}
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
          >
            <div className="text-sm font-semibold">View coffees from this producer</div>
            <p className="mt-1 text-sm text-[var(--site-text-soft)]">Filter the catalog to lots connected to this profile.</p>
          </Link>
          <Link
            href="/producers"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
          >
            <div className="text-sm font-semibold">Browse all producers</div>
            <p className="mt-1 text-sm text-[var(--site-text-soft)]">Step back to the broader origin index.</p>
          </Link>
          <Link
            href="/farms"
            className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)] sm:col-span-2"
          >
            <div className="text-sm font-semibold">Browse all farms</div>
            <p className="mt-1 text-sm text-[var(--site-text-soft)]">See the farms attached to the catalog in one place.</p>
          </Link>
        </div>
      </div>
    </DetailPageShell>
  );
}
