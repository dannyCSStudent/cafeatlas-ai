import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import { fetchCoffeeBySlug, formatPrice } from "@/lib/cafeatlas-api";

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

function splitNotes(value?: string | null) {
  return value
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4) ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const coffee = await fetchCoffeeBySlug(slug);
    return {
      title: `${coffee.name} | CafeAtlas AI`,
      description: coffee.description ?? `Coffee detail for ${coffee.name}.`,
    };
  } catch {
    return {
      title: "Coffee | CafeAtlas AI",
      description: "Coffee detail page.",
    };
  }
}

export default async function CoffeeDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  let coffee;
  try {
    coffee = await fetchCoffeeBySlug(slug);
  } catch (error) {
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
    if (status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <DetailPageShell
      actions={
        <>
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          {coffee.producer?.slug ? (
            <Link
              href={`/producers/${coffee.producer.slug}`}
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
            >
              Producer
            </Link>
          ) : null}
          {coffee.farm?.slug ? (
            <Link
              href={`/farms/${coffee.farm.slug}`}
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
            >
              Farm
            </Link>
          ) : null}
          <a
            href={`${process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000"}/api/v1/coffees/${coffee.slug}`}
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            View JSON
          </a>
        </>
      }
      media={
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] shadow-[0_20px_70px_rgba(102,62,22,0.14)]">
          <div className="relative aspect-[4/3] overflow-hidden bg-[var(--site-surface-soft)]">
            {coffee.image_url ? (
              <Image
                src={coffee.image_url}
                alt={`${coffee.name} artwork`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(240,220,196,0.6))] px-8 text-center">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Coffee artwork</p>
                  <p className="mt-3 text-2xl font-semibold tracking-tight">{coffee.name}</p>
                  <p className="mt-2 text-sm text-[var(--site-text-soft)]">
                    Origin-driven visuals will appear here once image URLs are supplied.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-t border-[var(--site-border)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Cupping profile</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Process</p>
                <p className="mt-2 text-base font-semibold">{coffee.process || "n/a"}</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Varietal</p>
                <p className="mt-2 text-base font-semibold">{coffee.varietal || "n/a"}</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Tasting notes</p>
                <p className="mt-2 text-base font-semibold">{coffee.tasting_notes || "n/a"}</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {splitNotes(coffee.tasting_notes).map((note) => (
                <span
                  key={note}
                  className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                >
                  {note}
                </span>
              ))}
            </div>
          </div>
        </div>
      }
      eyebrow="Coffee detail"
      title={coffee.name}
      description={coffee.description || "This coffee does not have a description yet."}
      stats={[
        { label: "Price", value: formatPrice(coffee.price_cents) },
        { label: "Producer", value: coffee.producer_name },
        { label: "Listed", value: formatDate(coffee.created_at) },
      ]}
    >
      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Origin profile</p>
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-[var(--site-muted)]">Producer name</div>
            <div className="mt-1 font-semibold">{coffee.producer?.name ?? coffee.producer_name}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Producer slug</div>
            <div className="mt-1 font-semibold">{coffee.producer?.slug ?? "n/a"}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Farm</div>
            <div className="mt-1 font-semibold">{coffee.farm?.name ?? "Unknown farm"}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">State</div>
            <div className="mt-1 font-semibold">{coffee.farm?.state ?? coffee.origin_state}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Municipality</div>
            <div className="mt-1 font-semibold">{coffee.farm?.municipality ?? "n/a"}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Altitude</div>
            <div className="mt-1 font-semibold">
              {coffee.farm?.altitude_meters ? `${coffee.farm.altitude_meters.toLocaleString()} m` : "n/a"}
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {coffee.process ? (
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
              {coffee.process}
            </span>
          ) : null}
          {coffee.varietal ? (
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
              {coffee.varietal}
            </span>
          ) : null}
          {coffee.tasting_notes ? (
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
              {splitNotes(coffee.tasting_notes)[0] ?? coffee.tasting_notes}
            </span>
          ) : null}
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-5 text-[var(--site-inverse-foreground)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-inverse-muted)]">Coffee slug</p>
        <p className="mt-3 break-all text-lg font-semibold">{coffee.slug}</p>
        <p className="mt-4 text-sm leading-7 text-[var(--site-inverse-muted)]">
          Process, varietal, and tasting notes now travel with the catalog data so the detail page can stay editorial
          instead of feeling like a raw API dump.
        </p>
      </div>
    </DetailPageShell>
  );
}
