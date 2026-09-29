"use client";

import { useEffect, useState } from "react";

type AdminOrder = {
  id: number;
  status: string;
  total_cents: number;
  currency_code: string;
  created_at: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  items: Array<{ coffee_name: string; quantity: number }>;
};

const nextStatus: Record<string, string> = {
  paid: "processing",
  processing: "shipped",
  shipped: "delivered",
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function AdminOrdersPanel() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  async function loadOrders() {
    setError(null);
    try {
      const response = await fetch("/api/admin/orders", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
      setOrders(payload as AdminOrder[]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load orders.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadOrders(); }, []);

  async function advance(order: AdminOrder) {
    const status = nextStatus[order.status];
    if (!status) return;
    setSavingId(order.id);
    setError(null);
    try {
      const trackingNumber = status === "shipped" ? window.prompt("Tracking number", order.tracking_number ?? "") : order.tracking_number;
      const trackingUrl = status === "shipped" ? window.prompt("Tracking URL (optional)", order.tracking_url ?? "") : order.tracking_url;
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, tracking_number: trackingNumber || null, tracking_url: trackingUrl || null }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
      setOrders((current) => current.map((item) => item.id === order.id ? payload : item));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update order.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Orders and fulfillment</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Move paid orders through the shipping lane.</h2>
        </div>
        <button type="button" onClick={() => void loadOrders()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {loading ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading orders...</p> : orders.length === 0 ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">No orders found.</p> : (
        <div className="mt-6 grid gap-3">
          {orders.map((order) => (
            <article key={order.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-[var(--site-text-soft)]">{order.items.map((item) => `${item.quantity} × ${item.coffee_name}`).join(", ")}</p>
                </div>
                <div className="text-right"><p className="font-semibold">{formatPrice(order.total_cents, order.currency_code)}</p><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{order.status}</p></div>
              </div>
              {nextStatus[order.status] ? <button type="button" disabled={savingId === order.id} onClick={() => void advance(order)} className="mt-4 rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{savingId === order.id ? "Saving..." : `Mark ${nextStatus[order.status]}`}</button> : null}
              {order.tracking_number ? <p className="mt-3 text-sm text-[var(--site-text-soft)]">Tracking: {order.tracking_number}</p> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
