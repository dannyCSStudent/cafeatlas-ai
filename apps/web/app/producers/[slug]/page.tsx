import type { Metadata } from "next";
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
