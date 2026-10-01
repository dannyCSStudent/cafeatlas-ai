"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type CustomerOrder = {
  id: number;
  status: string;
  total_cents: number;
  currency_code: string;
  created_at: string;
  tracking_number?: string | null;
  tracking_url?: string | null;
  recipient_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  items: Array<{
    coffee_name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }>;
};

type CustomerReturnRequest = {
  id: number;
  order_id: number;
  status: string;
  reason: string;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export function CustomerOrdersPanel() {
  const [orders, setOrders] = useState<CustomerOrder[]>([]);
  const [returns, setReturns] = useState<CustomerReturnRequest[]>([]);
  const [returnReasons, setReturnReasons] = useState<Record<number, string>>({});
  const [returnSubmitting, setReturnSubmitting] = useState<number | null>(null);
  const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/account/orders", { cache: "no-store" }),
      fetch("/api/account/returns", { cache: "no-store" }),
    ])
      .then(async ([ordersResponse, returnsResponse]) => {
        const [ordersPayload, returnsPayload] = await Promise.all([ordersResponse.json(), returnsResponse.json()]);
        if (!ordersResponse.ok) throw new Error(typeof ordersPayload.detail === "string" ? ordersPayload.detail : `Request failed (${ordersResponse.status})`);
        if (!returnsResponse.ok) throw new Error(typeof returnsPayload.detail === "string" ? returnsPayload.detail : `Request failed (${returnsResponse.status})`);
        setOrders(ordersPayload as CustomerOrder[]);
        setReturns(returnsPayload as CustomerReturnRequest[]);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load orders."))
      .finally(() => setLoading(false));
  }, []);

  async function submitReturn(orderId: number) {
    const reason = returnReasons[orderId]?.trim() ?? "";
    if (reason.length < 10) return;
    setReturnSubmitting(orderId);
    const response = await fetch(`/api/account/orders/${orderId}/return`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (response.ok) {
      const created = (await response.json()) as CustomerReturnRequest;
      setReturns((current) => [created, ...current]);
      setReturnReasons((current) => ({ ...current, [orderId]: "" }));
    }
    setReturnSubmitting(null);
  }

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
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">Order #{order.id}</p>
                  <p className="mt-1 text-sm text-[var(--site-text-soft)]">{order.items.map((item) => `${item.quantity} × ${item.coffee_name}`).join(", ")}</p>
                </div>
                <div className="text-right"><p className="font-semibold">{formatPrice(order.total_cents, order.currency_code)}</p><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{order.status}</p></div>
              </div>
              {order.tracking_number ? <p className="mt-3 text-sm text-[var(--site-text-soft)]">Tracking: {order.tracking_url ? <a className="font-semibold text-[var(--site-accent)]" href={order.tracking_url} target="_blank" rel="noreferrer">{order.tracking_number}</a> : order.tracking_number}</p> : null}
              <p className="mt-3 text-xs text-[var(--site-muted)]">{new Date(order.created_at).toLocaleString()}</p>
              <Link href={`/account/orders/${order.id}/receipt`} className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--site-accent)]">View receipt</Link>
              <button
                type="button"
                className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--site-accent)]"
                onClick={() => setExpandedOrderId((current) => current === order.id ? null : order.id)}
                aria-expanded={expandedOrderId === order.id}
              >
                {expandedOrderId === order.id ? "Hide details" : "View details"}
              </button>
              {expandedOrderId === order.id ? (
                <div className="mt-4 grid gap-4 border-t border-[var(--site-border)] pt-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Items</p>
                    <div className="mt-2 grid gap-2 text-sm">
                      {order.items.map((item) => (
                        <div key={item.coffee_name} className="flex justify-between gap-4">
                          <span>{item.quantity} × {item.coffee_name}</span>
                          <span className="font-semibold">{formatPrice(item.line_total_cents, order.currency_code)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Shipping</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">
                      {order.recipient_name || "Shipping address not added"}<br />
                      {order.address_line1 ? <>{order.address_line1}<br /></> : null}
                      {order.address_line2 ? <>{order.address_line2}<br /></> : null}
                      {order.city && order.region ? `${order.city}, ${order.region} ${order.postal_code ?? ""}` : "Address pending"}<br />
                      {order.country_code ?? ""}
                    </p>
                  </div>
                </div>
              ) : null}
              {order.status === "delivered" && !returns.some((item) => item.order_id === order.id) ? (
                <div className="mt-4 border-t border-[var(--site-border)] pt-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Request a return</p>
                  <textarea
                    value={returnReasons[order.id] ?? ""}
                    onChange={(event) => setReturnReasons((current) => ({ ...current, [order.id]: event.target.value }))}
                    className="mt-2 min-h-20 w-full rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-3 text-sm outline-none focus:border-[var(--site-accent)]"
                    placeholder="Tell us what went wrong (10 characters minimum)."
                  />
                  <button
                    type="button"
                    disabled={returnSubmitting === order.id || (returnReasons[order.id]?.trim().length ?? 0) < 10}
                    onClick={() => void submitReturn(order.id)}
                    className="mt-2 rounded-full bg-[var(--site-accent)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-accent-foreground)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {returnSubmitting === order.id ? "Submitting..." : "Submit return request"}
                  </button>
                </div>
              ) : null}
              {returns.filter((item) => item.order_id === order.id).map((item) => (
                <p key={item.id} className="mt-4 border-t border-[var(--site-border)] pt-4 text-sm text-[var(--site-text-soft)]">
                  Return request: <span className="font-semibold capitalize">{item.status}</span>
                </p>
              ))}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
