"use client";

import { useEffect, useState } from "react";

type Tier = { id: number; name: string; min_boxes: number; max_boxes: number | null; price_per_box_cents: number; currency_code: string; active: boolean };

export function AdminWholesalePricingPanel() {
  const [tiers, setTiers] = useState<Tier[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  useEffect(() => { void fetch("/api/admin/wholesale/pricing-tiers", { cache: "no-store" }).then(async (response) => { if (response.ok) setTiers((await response.json()) as Tier[]); }).catch(() => setMessage("Could not load pricing tiers.")); }, []);
  async function create(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const data = new FormData(formElement);
    const response = await fetch("/api/admin/wholesale/pricing-tiers", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: data.get("name"), min_boxes: Number(data.get("min_boxes")), max_boxes: data.get("max_boxes") ? Number(data.get("max_boxes")) : null, price_per_box_cents: Math.round(Number(data.get("price_per_box")) * 100), currency_code: "USD", active: true }) });
    const payload = (await response.json()) as Tier & { detail?: string };
    if (!response.ok) { setMessage(payload.detail ?? "Could not create pricing tier."); return; }
    setTiers((current) => [...current, payload].sort((a, b) => a.min_boxes - b.min_boxes)); setMessage("Pricing tier created."); formElement.reset();
  }
  async function toggle(tier: Tier) {
    const response = await fetch(`/api/admin/wholesale/pricing-tiers/${tier.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: tier.name, min_boxes: tier.min_boxes, max_boxes: tier.max_boxes, price_per_box_cents: tier.price_per_box_cents, currency_code: tier.currency_code, active: !tier.active }) });
    if (!response.ok) { setMessage("Could not update pricing tier."); return; }
    const updated = (await response.json()) as Tier;
    setTiers((current) => current.map((item) => item.id === updated.id ? updated : item));
  }
  return <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Volume pricing</p><h2 className="mt-2 text-2xl font-semibold">Configure wholesale tiers</h2></div>{tiers.length ? <div className="grid gap-2">{tiers.map((tier) => <div key={tier.id} className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-[var(--site-surface-soft)] px-3 py-2 text-sm"><span>{tier.name}: {tier.min_boxes}+{tier.max_boxes ? `-${tier.max_boxes}` : ""} boxes at {tier.currency_code} {(tier.price_per_box_cents / 100).toFixed(2)} / box <span className="text-xs uppercase text-[var(--site-muted)]">{tier.active ? "active" : "inactive"}</span></span><button type="button" onClick={() => void toggle(tier)} className="rounded-full border border-[var(--site-border)] px-3 py-1 text-xs font-semibold">{tier.active ? "Deactivate" : "Activate"}</button></div>)}</div> : <p className="text-sm text-[var(--site-text-soft)]">No pricing tiers configured.</p>}<form onSubmit={create} className="grid gap-2 sm:grid-cols-4"><input required name="name" placeholder="Tier name" className="rounded-xl border border-[var(--site-border)] px-3 py-2 text-sm" /><input required name="min_boxes" type="number" min="1" placeholder="Min boxes" className="rounded-xl border border-[var(--site-border)] px-3 py-2 text-sm" /><input name="max_boxes" type="number" min="1" placeholder="Max boxes" className="rounded-xl border border-[var(--site-border)] px-3 py-2 text-sm" /><input required name="price_per_box" type="number" min="0.01" step="0.01" placeholder="USD / box" className="rounded-xl border border-[var(--site-border)] px-3 py-2 text-sm" /><button type="submit" className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] sm:col-span-4">Add pricing tier</button></form>{message ? <p className="text-sm text-[var(--site-text-soft)]">{message}</p> : null}</section>;
}
