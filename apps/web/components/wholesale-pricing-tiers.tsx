"use client";

import { useEffect, useState } from "react";

type Tier = { id: number; name: string; min_boxes: number; max_boxes: number | null; price_per_box_cents: number; currency_code: string };

export function WholesalePricingTiers() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  useEffect(() => { void fetch("/api/wholesale/pricing-tiers", { cache: "no-store" }).then(async (response) => { if (response.ok) setTiers((await response.json()) as Tier[]); }).catch(() => undefined); }, []);
  if (!tiers.length) return null;
  return <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Volume pricing</p><h2 className="mt-2 text-2xl font-semibold">Current wholesale tiers</h2></div><div className="grid gap-3 sm:grid-cols-3">{tiers.map((tier) => <article key={tier.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"><p className="text-sm font-semibold">{tier.name}</p><p className="mt-2 text-xs text-[var(--site-text-soft)]">{tier.min_boxes}+{tier.max_boxes ? `-${tier.max_boxes}` : ""} boxes</p><p className="mt-3 text-xl font-semibold">{tier.currency_code} {(tier.price_per_box_cents / 100).toFixed(2)}<span className="text-xs font-normal"> / box</span></p></article>)}</div></section>;
}
