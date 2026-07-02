import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { DetailPageShell } from "@/components/detail-page-shell";
import { fetchProducerBySlug } from "@/lib/cafeatlas-api";

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
        </div>
      }
    >
      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Farms</p>
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
              </Link>
            ))
          ) : (
            <p className="text-sm text-[var(--site-text-soft)]">No farms are attached to this producer yet.</p>
          )}
        </div>
      </div>
    </DetailPageShell>
  );
}
