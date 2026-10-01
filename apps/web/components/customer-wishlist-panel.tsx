"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WishlistItem = { id: number; coffee_id: number; coffee_name?: string | null; coffee_slug?: string | null; origin_state?: string | null };

export function CustomerWishlistPanel() {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/account/wishlist", { cache: "no-store" })
      .then(async (response) => { if (response.ok) setItems((await response.json()) as WishlistItem[]); })
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Wishlist</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Coffees to revisit</h2></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">{items.length} saved</span></div>
      {loading ? <p className="mt-5 text-sm text-[var(--site-text-soft)]">Loading wishlist...</p> : items.length === 0 ? <p className="mt-5 text-sm leading-7 text-[var(--site-text-soft)]">Save a coffee from its detail page and it will appear here.</p> : <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((item) => <Link key={item.id} href={item.coffee_slug ? `/coffees/${item.coffee_slug}` : "/"} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4 transition hover:border-[var(--site-accent)]"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{item.origin_state ?? "Mexican coffee"}</p><p className="mt-2 font-semibold">{item.coffee_name ?? `Coffee #${item.coffee_id}`}</p><p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-accent)]">Open coffee</p></Link>)}</div>}
    </section>
  );
}
