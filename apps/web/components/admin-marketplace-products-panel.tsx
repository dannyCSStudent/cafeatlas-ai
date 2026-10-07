"use client";

import { useEffect, useState } from "react";

type Product = { id: number; name: string; slug: string; category: string; description: string | null; inventory_units: number; currency_code: string; price_cents: number; is_featured: boolean };
const categories = ["chocolate", "vanilla", "honey", "hot_sauce", "regional_food", "artisan"];

export function AdminMarketplaceProductsPanel() {
  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", category: "chocolate", description: "", inventory_units: "0", price_cents: "0" });
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const response = await fetch("/api/admin/marketplace/products", { cache: "no-store" });
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.detail ?? "Could not load marketplace products.");
    setProducts(payload as Product[]);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void load().catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load marketplace products."));
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null); setError(null);
    const response = await fetch("/api/admin/marketplace/products", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, inventory_units: Number(form.inventory_units), price_cents: Number(form.price_cents), is_featured: false }) });
    const payload = await response.json();
    if (!response.ok) { setError(payload.detail ?? "Could not create marketplace product."); return; }
    setProducts((current) => [payload as Product, ...current]);
    setForm({ name: "", slug: "", category: "chocolate", description: "", inventory_units: "0", price_cents: "0" });
    setMessage("Marketplace product created.");
  }

  async function toggleFeatured(product: Product) {
    const response = await fetch(`/api/admin/marketplace/products/${product.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: product.description, image_url: null, inventory_units: product.inventory_units, price_cents: product.price_cents, is_featured: !product.is_featured }) });
    const payload = await response.json();
    if (!response.ok) { setError(payload.detail ?? "Could not update marketplace product."); return; }
    setProducts((current) => current.map((item) => item.id === product.id ? payload as Product : item));
  }

  return <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8"><div><p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Marketplace products</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Add the products around the coffee.</h2></div>{error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}{message ? <p className="mt-4 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-800">{message}</p> : null}<form onSubmit={create} className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"><input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="Product name" className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm" /><input required value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} placeholder="product-slug" className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm" /><select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value })} className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm">{categories.map((category) => <option key={category} value={category}>{category}</option>)}</select><input required type="number" min="0" value={form.price_cents} onChange={(event) => setForm({ ...form, price_cents: event.target.value })} placeholder="Price cents" className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm" /><input required type="number" min="0" value={form.inventory_units} onChange={(event) => setForm({ ...form, inventory_units: event.target.value })} placeholder="Inventory units" className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm" /><input value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} placeholder="Short description" className="rounded-xl border border-[var(--site-border)] bg-transparent px-3 py-2 text-sm sm:col-span-2" /><button type="submit" className="rounded-xl bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)]">Add product</button></form><div className="mt-6 grid gap-3">{products.map((product) => <article key={product.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4"><div><p className="font-semibold">{product.name}</p><p className="mt-1 text-xs text-[var(--site-text-soft)]">{product.category} · {product.inventory_units} units · {product.price_cents} cents</p></div><button type="button" onClick={() => void toggleFeatured(product)} className="rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-semibold">{product.is_featured ? "Featured" : "Feature"}</button></article>)}</div></section>;
}
