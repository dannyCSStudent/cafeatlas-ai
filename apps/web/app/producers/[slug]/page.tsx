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
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            Back to producers
          </Link>
          <Link
            href={`/?producer_slug=${encodeURIComponent(producer.slug)}`}
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
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
      <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
        <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Farms</p>
        <div className="mt-4 space-y-3">
          {producer.farms.length > 0 ? (
            producer.farms.map((farm) => (
              <Link
                key={farm.id}
                href={`/farms/${farm.slug}`}
                className="block rounded-2xl border border-stone-200 bg-white px-4 py-3 transition hover:border-stone-400 hover:bg-stone-50"
              >
                <div className="font-semibold">{farm.name}</div>
                <div className="mt-1 text-sm text-stone-600">
                  {farm.state}
                  {farm.municipality ? ` · ${farm.municipality}` : ""}
                </div>
              </Link>
            ))
          ) : (
            <p className="text-sm text-stone-600">No farms are attached to this producer yet.</p>
          )}
        </div>
      </div>
    </DetailPageShell>
  );
}
