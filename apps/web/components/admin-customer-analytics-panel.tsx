"use client";

import { useEffect, useState } from "react";

type CustomerAnalytics = { paying_customer_count: number; repeat_customer_count: number; lifetime_value_cents: number; average_lifetime_value_cents: number; active_subscriber_count: number; most_purchased_coffee: string | null; retained_customer_count: number; retention_rate_bps: number };

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminCustomerAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/admin/analytics/customers", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load customer analytics.");
      setAnalytics(payload as CustomerAnalytics);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load customer analytics.");
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Customer analytics</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Understand the customer trail.</h2></div><button type="button" onClick={() => void load()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button></div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : analytics ? <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Paying customers</p><p className="mt-2 text-2xl font-semibold">{analytics.paying_customer_count}</p></article><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Repeat customers</p><p className="mt-2 text-2xl font-semibold">{analytics.repeat_customer_count}</p></article><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">30-day retention</p><p className="mt-2 text-2xl font-semibold">{(analytics.retention_rate_bps / 100).toFixed(1)}%</p><p className="mt-1 text-xs text-[var(--site-text-soft)]">{analytics.retained_customer_count} retained customers</p></article><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Lifetime value</p><p className="mt-2 text-2xl font-semibold">{money(analytics.average_lifetime_value_cents)} avg</p><p className="mt-1 text-xs text-[var(--site-text-soft)]">{money(analytics.lifetime_value_cents)} total</p></article><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Active subscribers</p><p className="mt-2 text-2xl font-semibold">{analytics.active_subscriber_count}</p></article><article className="rounded-2xl bg-[var(--site-surface-soft)] p-4 sm:col-span-2"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Most purchased coffee</p><p className="mt-2 text-2xl font-semibold">{analytics.most_purchased_coffee ?? "No paid purchases yet"}</p></article></div> : <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading customer analytics...</p>}
    </section>
  );
}
