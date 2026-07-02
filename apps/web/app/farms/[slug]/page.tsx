import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import { fetchFarmBySlug } from "@/lib/cafeatlas-api";

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
    const farm = await fetchFarmBySlug(slug);
    return {
      title: `${farm.name} | CafeAtlas AI`,
      description: farm.description ?? `Farm profile for ${farm.name}.`,
    };
  } catch {
    return {
      title: "Farm | CafeAtlas AI",
      description: "Farm profile.",
    };
  }
}

export default async function FarmDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;

  let farm;
  try {
    farm = await fetchFarmBySlug(slug);
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
            href="/farms"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to farms
          </Link>
          <Link
            href={`/?state=${encodeURIComponent(farm.state)}`}
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            View coffees
          </Link>
        </>
      }
      eyebrow="Farm profile"
      title={farm.name}
      description={farm.description || "This farm does not have a description yet."}
      stats={[
        { label: "State", value: farm.state },
        { label: "Producer", value: farm.producer?.name ?? "n/a" },
        { label: "Listed", value: formatDate(farm.created_at) },
      ]}
      media={
        <div className="overflow-hidden rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] shadow-[0_20px_70px_rgba(102,62,22,0.14)]">
          <div className="relative flex aspect-[4/3] items-end overflow-hidden bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),rgba(240,220,196,0.55))] p-5">
            {farm.image_url ? (
              <Image
                src={farm.image_url}
                alt={`${farm.name} artwork`}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
                unoptimized
              />
            ) : (
              <>
                <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(28,17,8,0.1),rgba(28,17,8,0)_40%,rgba(120,85,50,0.14)_100%)]" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-[var(--site-inverse)] text-3xl font-semibold text-[var(--site-inverse-foreground)] shadow-2xl shadow-stone-950/20">
                  {buildMonogram(farm.name)}
                </div>
                <div className="relative ml-4">
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Farm landscape</p>
                  <p className="mt-2 text-2xl font-semibold tracking-tight">{farm.name}</p>
                  <p className="mt-2 max-w-xs text-sm leading-7 text-[var(--site-text-soft)]">
                    {farm.description || "A farm profile without a description yet."}
                  </p>
                </div>
              </>
            )}
          </div>

          <div className="grid gap-3 border-t border-[var(--site-border)] p-5 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">State</p>
              <p className="mt-2 text-base font-semibold">{farm.state}</p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Altitude</p>
              <p className="mt-2 text-base font-semibold">
                {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a"}
              </p>
            </div>
          </div>

          <div className="border-t border-[var(--site-border)] p-5">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Profile tags</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {farm.state}
              </span>
              {farm.municipality ? (
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                  {farm.municipality}
                </span>
              ) : null}
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
              </span>
            </div>
          </div>
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Location</p>
        <div className="mt-4 space-y-3">
          <div>
            <div className="text-sm text-[var(--site-muted)]">Municipality</div>
            <div className="mt-1 font-semibold">{farm.municipality ?? "n/a"}</div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Altitude</div>
            <div className="mt-1 font-semibold">
              {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a"}
            </div>
          </div>
          <div>
            <div className="text-sm text-[var(--site-muted)]">Producer slug</div>
            {farm.producer?.slug ? (
              <Link
                href={`/producers/${farm.producer.slug}`}
                className="mt-1 inline-block font-semibold text-[var(--foreground)] underline decoration-[var(--site-border)] underline-offset-4"
              >
                {farm.producer.slug}
              </Link>
            ) : (
              <div className="mt-1 font-semibold">n/a</div>
            )}
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {farm.producer?.name ? (
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                {farm.producer.name}
              </span>
            ) : null}
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
              {farm.state}
            </span>
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
              {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-5 text-[var(--site-inverse-foreground)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-inverse-muted)]">Farm slug</p>
        <p className="mt-3 break-all text-lg font-semibold">{farm.slug}</p>
      </div>
    </DetailPageShell>
  );
}
