import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,237,224,0.9)_38%,_rgba(239,222,204,0.98)_100%)] px-6 py-10 text-stone-950 lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
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
        </div>

        <article className="grid gap-8 rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.1)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Producer profile</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {producer.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                {producer.description || "This producer does not have a description yet."}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Family</dt>
                <dd className="mt-2 text-lg font-semibold">{producer.family || "n/a"}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Farms</dt>
                <dd className="mt-2 text-lg font-semibold">{producer.farms.length}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Listed</dt>
                <dd className="mt-2 text-lg font-semibold">{formatDate(producer.created_at)}</dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
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
          </aside>
        </article>
      </section>
    </main>
  );
}
