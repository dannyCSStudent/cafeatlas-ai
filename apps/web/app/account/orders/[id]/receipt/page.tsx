"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Order = {
  id: number;
  status: string;
  currency_code: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  recipient_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  tracking_number?: string | null;
  tracking_url?: string | null;
  created_at: string;
  items: Array<{ coffee_name: string; quantity: number; unit_price_cents: number; line_total_cents: number }>;
};

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(cents / 100);
}

export default function ReceiptPage({ params }: { params: Promise<{ id: string }> }) {
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void params.then(({ id }) => fetch(`/api/account/orders/${id}`, { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load receipt.");
        setOrder(payload as Order);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load receipt.")));
  }, [params]);

  if (error) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-16"><p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p></main>;
  if (!order) return <main className="mx-auto min-h-screen max-w-2xl px-6 py-16 text-sm text-[var(--site-text-soft)]">Loading receipt...</main>;

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900 print:p-0">
      <section className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 p-6 shadow-sm print:max-w-none print:border-0 print:shadow-none sm:p-10">
        <div className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-6">
          <div><p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">CafeAtlas AI</p><h1 className="mt-2 text-3xl font-semibold">Order receipt</h1><p className="mt-2 text-sm text-slate-500">Order #{order.id} · {new Date(order.created_at).toLocaleDateString()}</p></div>
          <div className="text-right"><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Status</p><p className="mt-2 font-semibold capitalize">{order.status.replaceAll("_", " ")}</p></div>
        </div>
        <div className="grid gap-8 border-b border-slate-200 py-6 sm:grid-cols-2">
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Items</p><div className="mt-3 grid gap-3">{order.items.map((item) => <div key={item.coffee_name} className="flex justify-between gap-4 text-sm"><span>{item.quantity} × {item.coffee_name}<br /><span className="text-slate-500">{formatPrice(item.unit_price_cents, order.currency_code)} each</span></span><span className="font-semibold">{formatPrice(item.line_total_cents, order.currency_code)}</span></div>)}</div></div>
          <div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Ship to</p><p className="mt-3 text-sm leading-6">{order.recipient_name ?? "Address pending"}<br />{order.address_line1}{order.address_line2 ? <><br />{order.address_line2}</> : null}<br />{order.city}, {order.region} {order.postal_code}<br />{order.country_code}</p></div>
        </div>
        <div className="ml-auto grid max-w-xs gap-2 py-6 text-sm"><div className="flex justify-between gap-6"><span>Subtotal</span><span>{formatPrice(order.subtotal_cents, order.currency_code)}</span></div><div className="flex justify-between gap-6"><span>Shipping</span><span>{formatPrice(order.shipping_cents, order.currency_code)}</span></div><div className="flex justify-between gap-6"><span>Tax</span><span>{formatPrice(order.tax_cents, order.currency_code)}</span></div><div className="flex justify-between gap-6 border-t border-slate-200 pt-3 text-base font-semibold"><span>Total</span><span>{formatPrice(order.total_cents, order.currency_code)}</span></div></div>
        {order.tracking_number ? <p className="border-t border-slate-200 pt-5 text-sm">Tracking: {order.tracking_url ? <a className="font-semibold underline" href={order.tracking_url}>{order.tracking_number}</a> : order.tracking_number}</p> : null}
        <div className="mt-8 flex flex-wrap gap-3 print:hidden"><button type="button" onClick={() => window.print()} className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white">Print receipt</button><Link href="/account" className="rounded-full border border-slate-300 px-5 py-3 text-sm font-semibold">Back to account</Link></div>
      </section>
    </main>
  );
}
