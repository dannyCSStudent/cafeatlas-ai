"use client";

import { useEffect, useState } from "react";

type GiftRequest = { id: number; user_id: string; box_name: string; quantity: number; delivery_country: string; note: string; status: string };
const statuses = ["requested", "quoted", "approved", "fulfilled", "cancelled"] as const;

export function AdminGiftRequestsPanel() {
  const [items, setItems] = useState<GiftRequest[]>([]);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => { void fetch("/api/admin/gift-requests", { cache: "no-store" }).then(async (response) => { if (!response.ok) throw new Error("Could not load gift requests."); setItems((await response.json()) as GiftRequest[]); }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load gift requests.")); }, []);
  async function update(id: number, status: string) { const response = await fetch(`/api/admin/gift-requests/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) }); if (!response.ok) { setError("Could not update gift request."); return; } setItems((current) => current.map((item) => item.id === id ? { ...item, status } : item)); }
  return <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Gift requests</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Move gifts through fulfillment</h2></div>{error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}{items.length ? <div className="grid gap-3">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Request #{item.id} · {item.delivery_country}</p><h3 className="mt-2 font-semibold">{item.box_name} × {item.quantity}</h3></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold uppercase">{item.status}</span></div><p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{item.note}</p><div className="mt-4 flex flex-wrap gap-2">{statuses.map((status) => <button key={status} type="button" onClick={() => void update(item.id, status)} className="rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-semibold">{status}</button>)}</div></article>)}</div> : <p className="text-sm text-[var(--site-text-soft)]">No gift requests yet.</p>}</section>;
}
