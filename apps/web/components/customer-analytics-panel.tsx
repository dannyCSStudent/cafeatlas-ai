"use client";

import { useEffect, useState } from "react";

type CustomerAnalytics = {
  paid_order_count: number;
  lifetime_spend_cents: number;
  average_order_cents: number;
  active_subscription: boolean;
  latest_purchase_at: string | null;
};

function money(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(cents / 100);
}

export function CustomerAnalyticsPanel() {
  const [analytics, setAnalytics] = useState<CustomerAnalytics | null>(null);

  useEffect(() => {
    void fetch("/api/account/analytics", { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) setAnalytics((await response.json()) as CustomerAnalytics);
      })
      .catch(() => undefined);
  }, []);

  if (!analytics) return null;

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Your coffee analytics</p>
      <h2 className="mt-2 text-2xl font-semibold">Your CafeAtlas trail</h2>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Paid orders</p><p className="mt-2 text-xl font-semibold">{analytics.paid_order_count}</p></article>
        <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Lifetime spend</p><p className="mt-2 text-xl font-semibold">{money(analytics.lifetime_spend_cents)}</p></article>
        <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Average order</p><p className="mt-2 text-xl font-semibold">{money(analytics.average_order_cents)}</p></article>
        <article className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.16em] text-[var(--site-muted)]">Club status</p><p className="mt-2 text-xl font-semibold">{analytics.active_subscription ? "Active" : "Not active"}</p></article>
      </div>
    </section>
  );
}
