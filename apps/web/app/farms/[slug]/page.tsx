import type { Metadata } from "next";
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
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-5 text-[var(--site-inverse-foreground)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-inverse-muted)]">Farm slug</p>
        <p className="mt-3 break-all text-lg font-semibold">{farm.slug}</p>
      </div>
    </DetailPageShell>
  );
}
