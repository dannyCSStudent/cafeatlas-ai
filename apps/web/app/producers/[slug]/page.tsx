import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import { fetchCoffeeCatalog, fetchProducerBySlug, formatPrice } from "@/lib/cafeatlas-api";

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

  const linkedCoffees = await fetchCoffeeCatalog({
    producerSlug: producer.slug,
    pageSize: 4,
    sort: "featured",
  });

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
          <div className="relative flex aspect-[4/3] items-end overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),rgba(240,220,196,0.55))] p-5">
            {producer.image_url ? (
              <Image
                src={producer.image_url}
                alt={`${producer.name} artwork`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(36,20,10,0.08),rgba(36,20,10,0)_40%,rgba(120,85,50,0.12)_100%)]" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-[var(--site-accent)] text-3xl font-semibold text-[var(--site-accent-foreground)] shadow-2xl shadow-stone-950/20">
                  {buildMonogram(producer.name)}
                </div>
                <div className="relative ml-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Producer collective</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{producer.name}</p>
                  <p className="mt-2 max-w-xs text-sm leading-7 text-[var(--site-text-soft)]">
                    {producer.description || "A producer profile without a description yet."}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-3 border-t border-[var(--site-border)] p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Family</p>
              <p className="mt-2 text-base font-semibold">{producer.family || "n/a"}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Farms</p>
              <p className="mt-2 text-base font-semibold">{producer.farms.length}</p>
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
              {producer.farms[0]?.state ? (
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                  {producer.farms[0].state}
                </span>
              ) : null}
            </div>
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Linked farms</p>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
          The farms below keep the origin chain connected to the producer profile.
        </p>
        <div className="mt-4 space-y-3">
          {producer.farms.length > 0 ? (
            producer.farms.map((farm) => (
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
            {producer.farms[0]?.state ?? "State n/a"}
          </span>
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
            {producer.farms[0]?.altitude_meters ? `${producer.farms[0].altitude_meters.toLocaleString()} m` : "Altitude n/a"}
          </span>
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
