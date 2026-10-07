"use client";

import { useEffect, useState } from "react";

type ProducerAnalytics = { producer_id: number; producer_name: string; coffee_count: number; current_inventory_units: number; paid_units_sold: number; paid_sales_cents: number; top_coffee_name: string | null; monthly_sales: Array<{ month: string; units_sold: number; sales_cents: number }> };

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminFarmerAnalyticsPanel() {
  const [producers, setProducers] = useState<ProducerAnalytics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/admin/analytics/farmers", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load farmer analytics.");
      setProducers(payload as ProducerAnalytics[]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load farmer analytics.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Farmer analytics</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">See which origins are moving.</h2>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : loading ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading farmer analytics...</p> : producers.length === 0 ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">No producers found.</p> : (
        <div className="mt-6 grid gap-3">
          {producers.map((producer) => (
            <article key={producer.producer_id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">{producer.producer_name}</p><p className="mt-1 text-sm text-[var(--site-text-soft)]">{producer.coffee_count} coffees · Top coffee: {producer.top_coffee_name ?? "No paid sales yet"}</p></div><p className="text-lg font-semibold">{money(producer.paid_sales_cents)}</p></div>
              <div className="mt-3 flex flex-wrap gap-4 text-xs text-[var(--site-text-soft)]"><span>{producer.paid_units_sold} units sold</span><span>{producer.current_inventory_units} units in stock</span></div>
              {producer.monthly_sales.length ? <div className="mt-3 flex flex-wrap gap-2">{producer.monthly_sales.slice(-6).map((month) => <span key={month.month} className="rounded-full bg-[var(--site-surface-card)] px-3 py-1 text-xs text-[var(--site-text-soft)]">{month.month}: {money(month.sales_cents)}</span>)}</div> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
