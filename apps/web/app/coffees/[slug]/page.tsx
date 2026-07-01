import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,237,224,0.9)_38%,_rgba(239,222,204,0.98)_100%)] px-6 py-10 text-stone-950 lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            Back to catalog
          </Link>
          {coffee.producer?.slug ? (
            <Link
              href={`/producers/${coffee.producer.slug}`}
              className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              Producer
            </Link>
          ) : null}
          {coffee.farm?.slug ? (
            <Link
              href={`/farms/${coffee.farm.slug}`}
              className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              Farm
            </Link>
          ) : null}
          <a
            href={`${process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? "http://127.0.0.1:8000"}/api/v1/coffees/${coffee.slug}`}
            className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 font-semibold text-stone-800 shadow-sm transition hover:bg-white"
          >
            View JSON
          </a>
        </div>

        <article className="grid gap-8 rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.1)] backdrop-blur lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
          <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-stone-950 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-white">
                {coffee.origin_state}
              </span>
              {coffee.is_featured ? (
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-emerald-800">
                  Featured
                </span>
              ) : null}
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                {coffee.name}
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">
                {coffee.description || "This coffee does not have a description yet."}
              </p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Price</dt>
                <dd className="mt-2 text-2xl font-semibold">{formatPrice(coffee.price_cents)}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Producer</dt>
                <dd className="mt-2 text-lg font-semibold">{coffee.producer_name}</dd>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">Listed</dt>
                <dd className="mt-2 text-lg font-semibold">{formatDate(coffee.created_at)}</dd>
              </div>
            </dl>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-50 p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">Origin profile</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="text-sm text-stone-500">Producer name</div>
                  <div className="mt-1 font-semibold">{coffee.producer?.name ?? coffee.producer_name}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Producer slug</div>
                  <div className="mt-1 font-semibold">{coffee.producer?.slug ?? "n/a"}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Farm</div>
                  <div className="mt-1 font-semibold">{coffee.farm?.name ?? "Unknown farm"}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">State</div>
                  <div className="mt-1 font-semibold">{coffee.farm?.state ?? coffee.origin_state}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Municipality</div>
                  <div className="mt-1 font-semibold">{coffee.farm?.municipality ?? "n/a"}</div>
                </div>
                <div>
                  <div className="text-sm text-stone-500">Altitude</div>
                  <div className="mt-1 font-semibold">
                    {coffee.farm?.altitude_meters ? `${coffee.farm.altitude_meters.toLocaleString()} m` : "n/a"}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-stone-200 bg-stone-950 p-5 text-white">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-300">Coffee slug</p>
              <p className="mt-3 break-all text-lg font-semibold">{coffee.slug}</p>
            </div>
          </aside>
        </article>
      </section>
    </main>
  );
}
