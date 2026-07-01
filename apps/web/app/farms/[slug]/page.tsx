import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,237,224,0.9)_38%,_rgba(239,222,204,0.98)_100%)] px-6 py-10 text-stone-950 lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/farms"
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            Back to farms
          </Link>
          <Link
            href={`/?state=${encodeURIComponent(farm.state)}`}
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            View coffees
          </Link>
        </div>

        <article className="grid gap-8 rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.1)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Farm profile</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {farm.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                {farm.description || "This farm does not have a description yet."}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">State</dt>
                <dd className="mt-2 text-lg font-semibold">{farm.state}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Producer</dt>
                <dd className="mt-2 text-lg font-semibold">{farm.producer?.name ?? "n/a"}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Listed</dt>
                <dd className="mt-2 text-lg font-semibold">{formatDate(farm.created_at)}</dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Location</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-sm text-stone-500">Municipality</div>
                  <div className="mt-1 font-semibold">{farm.municipality ?? "n/a"}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Altitude</div>
                  <div className="mt-1 font-semibold">
                    {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a"}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Producer slug</div>
                  {farm.producer?.slug ? (
                    <Link
                      href={`/producers/${farm.producer.slug}`}
                      className="mt-1 inline-block font-semibold text-stone-950 underline decoration-stone-300 underline-offset-4"
                    >
                      {farm.producer.slug}
                    </Link>
                  ) : (
                    <div className="mt-1 font-semibold">n/a</div>
                  )}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Farm slug</p>
              <p className="mt-3 break-all text-lg font-semibold">{farm.slug}</p>
            </div>
          </aside>
        </article>
      </section>
    </main>
  );
}
