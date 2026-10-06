"use client";

import { useEffect, useState } from "react";

type Analytics = { coffee_count: number; paid_order_count: number; gross_sales_cents: number; low_stock_count: number; active_subscription_count: number; paid_wholesale_count: number };

function formatMoney(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function AdminAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/admin/analytics/overview", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load analytics.");
      setAnalytics(payload as Analytics);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load analytics.");
    }
  }

  useEffect(() => { void load(); }, []);

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Live analytics</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Know what needs attention.</h2>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : analytics ? (
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Gross paid sales</p><p className="mt-2 text-2xl font-semibold">{formatMoney(analytics.gross_sales_cents)}</p></article>
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Paid orders</p><p className="mt-2 text-2xl font-semibold">{analytics.paid_order_count}</p></article>
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Low stock</p><p className="mt-2 text-2xl font-semibold">{analytics.low_stock_count}</p></article>
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Catalog coffees</p><p className="mt-2 text-2xl font-semibold">{analytics.coffee_count}</p></article>
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Active subscriptions</p><p className="mt-2 text-2xl font-semibold">{analytics.active_subscription_count}</p></article>
          <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.18em] text-[var(--site-muted)]">Paid wholesale</p><p className="mt-2 text-2xl font-semibold">{analytics.paid_wholesale_count}</p></article>
        </div>
      ) : <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading analytics...</p>}
    </section>
  );
}
