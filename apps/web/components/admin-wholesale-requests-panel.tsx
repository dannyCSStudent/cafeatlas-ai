"use client";

import { useEffect, useState } from "react";

type WholesaleRequest = {
  id: number;
  user_id: string;
  company_name: string;
  contact_name: string;
  estimated_boxes: number;
  delivery_country: string;
  note: string;
  coffee_preferences: string | null;
  status: string;
  quote_total_cents: number | null;
  price_per_box_cents: number | null;
  quote_note: string | null;
  items: Array<{ id: number; coffee_name: string; quantity_boxes: number }>;
};

const statuses = ["requested", "contacted", "quoted", "approved", "fulfilled", "cancelled"] as const;

export function AdminWholesaleRequestsPanel() {
  const [items, setItems] = useState<WholesaleRequest[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/wholesale/requests", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not load wholesale requests.");
        setItems((await response.json()) as WholesaleRequest[]);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load wholesale requests."));
  }, []);

  async function update(id: number, status: string) {
    const response = await fetch(`/api/admin/wholesale/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (!response.ok) {
      setError("Could not update wholesale request.");
      return;
    }
    setItems((current) => current.map((item) => (item.id === id ? { ...item, status } : item)));
  }

  async function saveQuote(id: number, form: HTMLFormElement) {
    const data = new FormData(form);
    const response = await fetch(`/api/admin/wholesale/requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        quote_total_cents: Math.round(Number(data.get("quote_total")) * 100),
        price_per_box_cents: Math.round(Number(data.get("price_per_box")) * 100),
        quote_note: data.get("quote_note"),
      }),
    });
    if (!response.ok) {
      setError("Could not save wholesale quote.");
      return;
    }
    const updated = (await response.json()) as WholesaleRequest;
    setItems((current) => current.map((item) => (item.id === id ? updated : item)));
  }

  return (
    <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Wholesale leads</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Move wholesale requests toward a quote</h2>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {items.length ? (
        <div className="grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Request #{item.id} · {item.delivery_country}</p>
                  <h3 className="mt-2 font-semibold">{item.company_name} · {item.estimated_boxes.toLocaleString()} boxes</h3>
                  <p className="mt-1 text-sm text-[var(--site-text-soft)]">{item.contact_name} · {item.user_id}</p>
                </div>
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold uppercase">{item.status}</span>
              </div>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{item.note}</p>
              {item.coffee_preferences ? <p className="mt-2 text-sm text-[var(--site-text-soft)]">Coffee preferences: {item.coffee_preferences}</p> : null}
              {item.items.length ? <p className="mt-2 text-sm text-[var(--site-text-soft)]">Selected coffees: {item.items.map((coffee) => `${coffee.coffee_name} x ${coffee.quantity_boxes} boxes`).join(", ")}</p> : null}
              <form onSubmit={(event) => { event.preventDefault(); void saveQuote(item.id, event.currentTarget); }} className="mt-4 grid gap-2 rounded-2xl border border-[var(--site-border)] p-3 sm:grid-cols-3">
                <input required name="quote_total" type="number" min="0" step="0.01" defaultValue={item.quote_total_cents === null ? "" : (item.quote_total_cents / 100).toFixed(2)} placeholder="Total quote" className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-2 text-sm" />
                <input required name="price_per_box" type="number" min="0" step="0.01" defaultValue={item.price_per_box_cents === null ? "" : (item.price_per_box_cents / 100).toFixed(2)} placeholder="Price / box" className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-2 text-sm" />
                <input name="quote_note" defaultValue={item.quote_note ?? ""} placeholder="Quote terms or delivery notes" className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-2 text-sm sm:col-span-3" />
                <button type="submit" className="rounded-full bg-[var(--site-inverse)] px-3 py-2 text-xs font-semibold text-[var(--site-inverse-foreground)] sm:col-span-3">Save quote</button>
              </form>
              <div className="mt-4 flex flex-wrap gap-2">
                {statuses.map((status) => (
                  <button key={status} type="button" onClick={() => void update(item.id, status)} className="rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-semibold">
                    {status}
                  </button>
                ))}
              </div>
            </article>
          ))}
        </div>
      ) : <p className="text-sm text-[var(--site-text-soft)]">No wholesale requests yet.</p>}
    </section>
  );
}
