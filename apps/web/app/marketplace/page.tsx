import Image from "next/image";
import Link from "next/link";

import { fetchMarketplaceProducts, formatPrice, type MarketplaceProductRead } from "@/lib/cafeatlas-api";

const categories = [
  ["", "All products"],
  ["chocolate", "Chocolate"],
  ["vanilla", "Vanilla"],
  ["honey", "Honey"],
  ["hot_sauce", "Hot sauces"],
  ["regional_food", "Regional foods"],
  ["artisan", "Artisan goods"],
] as const;

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function categoryLabel(category: string) {
  return categories.find(([value]) => value === category)?.[1] ?? category;
}

function ProductArtwork({ product }: { product: MarketplaceProductRead }) {
  return product.image_url ? (
    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
      <Image src={product.image_url} alt={`${product.name} product image`} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
    </div>
  ) : (
    <div className="flex aspect-[4/3] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.85),rgba(240,220,196,0.7))] p-6 text-center">
      <div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{categoryLabel(product.category)}</p><p className="mt-2 text-xl font-semibold">{product.name}</p></div>
    </div>
  );
}

export default async function MarketplacePage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const category = firstParam(params.category) ?? "";
  const query = firstParam(params.q)?.trim() ?? "";
  let products: MarketplaceProductRead[] = [];
  let error: string | null = null;

  try {
    products = (await fetchMarketplaceProducts({ category: category || undefined, q: query || undefined })).items;
  } catch (nextError) {
    error = nextError instanceof Error ? nextError.message : "Could not load marketplace products.";
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto w-full max-w-7xl">
        <Link href="/" className="text-sm font-semibold text-[var(--site-accent)]">Back to catalog</Link>
        <header className="mt-6 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(108,70,35,0.95))] p-7 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:p-12">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Beyond the cup</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">A marketplace for the flavors around Mexican coffee.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Discover cacao, vanilla, honey, regional foods, and artisan goods as the marketplace grows beyond coffee.</p>
        </header>
        <div className="mt-8 flex flex-wrap gap-2">
          {categories.map(([value, label]) => <Link key={value || "all"} href={value ? `/marketplace?category=${value}` : "/marketplace"} className={`rounded-full border px-4 py-2 text-sm font-semibold ${category === value ? "border-[var(--site-inverse)] bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]" : "border-[var(--site-border)] bg-[var(--site-surface-card)]"}`}>{label}</Link>)}
        </div>
        {error ? <p className="mt-8 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : products.length === 0 ? <section className="mt-8 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-8"><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Catalog opening soon</p><h2 className="mt-3 text-2xl font-semibold">The first partner products are being prepared.</h2><p className="mt-3 max-w-2xl leading-7 text-[var(--site-text-soft)]">Marketplace categories are ready. Once products are added by the team, they will appear here without changing the existing coffee catalog.</p></section> : <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{products.map((product) => <article key={product.id} className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]"><ProductArtwork product={product} /><p className="mt-5 text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{categoryLabel(product.category)}</p><h2 className="mt-2 text-xl font-semibold">{product.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-[var(--site-text-soft)]">{product.description ?? "A new CafeAtlas marketplace product."}</p><div className="mt-5 flex items-center justify-between gap-3"><span className="text-lg font-semibold">{formatPrice(product.price_cents, product.currency_code)}</span><span className="text-xs text-[var(--site-muted)]">{product.inventory_units} available</span></div></article>)}</div>}
      </section>
    </main>
  );
}
