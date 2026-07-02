import type { Metadata } from "next";
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
        </>
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
    </DetailPageShell>
  );
}
