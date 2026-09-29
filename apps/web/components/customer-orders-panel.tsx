"use client";

import { useEffect, useState } from "react";

type CustomerOrder = {
  id: number;
  status: string;
  total_cents: number;
  currency_code: string;
  created_at: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  items: Array<{ coffee_name: string; quantity: number }>;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function CustomerOrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/orders", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
        setOrders(payload as CustomerOrder[]);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <div className="flex items-center justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Orders</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Your coffee trail</h2></div>
        <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">{orders.length} total</span>
      </div>
      {loading ? <p className="mt-5 text-sm text-[var(--site-text-soft)]">Loading orders...</p> : error ? <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : orders.length === 0 ? <p className="mt-5 text-sm leading-7 text-[var(--site-text-soft)]">Your paid and draft orders will appear here after checkout.</p> : (
        <div className="mt-5 grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Order #{order.id}</p><p className="mt-1 text-sm text-[var(--site-text-soft)]">{order.items.map((item) => `${item.quantity} × ${item.coffee_name}`).join(", ")}</p></div><div className="text-right"><p className="font-semibold">{formatPrice(order.total_cents, order.currency_code)}</p><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{order.status}</p></div></div>
              {order.tracking_number ? <p className="mt-3 text-sm text-[var(--site-text-soft)]">Tracking: {order.tracking_url ? <a className="font-semibold text-[var(--site-accent)]" href={order.tracking_url} target="_blank" rel="noreferrer">{order.tracking_number}</a> : order.tracking_number}</p> : null}
              <p className="mt-3 text-xs text-[var(--site-muted)]">{new Date(order.created_at).toLocaleString()}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
