"use client";

import Link from "next/link";
import { useState } from "react";

import { formatPrice } from "@/lib/cafeatlas-api";
import { useWebCart } from "@/lib/cart";

type Order = {
  id: number;
  status: string;
  subtotal_cents: number;
  shipping_cents: number;
  total_cents: number;
};

const emptyAddress = { recipient_name: "", address_line1: "", address_line2: "", city: "", region: "", postal_code: "", country_code: "US" };

async function readResponse(response: Response) {
  const payload = (await response.json().catch(() => ({}))) as { detail?: string };
  if (!response.ok) throw new Error(payload.detail ?? `Request failed (${response.status})`);
  return payload;
}

export function WebCartPanel() {
  const { items, hydrated, itemCount, updateQuantity, removeItem, clear } = useWebCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [address, setAddress] = useState(emptyAddress);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function createDraft() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/account/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items: items.map((item) => ({ coffee_id: item.coffeeId, quantity: item.quantity })) }) });
      const payload = await readResponse(response) as Order;
      setOrder(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not create the order draft.");
    } finally {
      setBusy(false);
    }
  }

  async function saveShipping(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/account/orders/${order.id}/shipping`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...address, address_line2: address.address_line2 || null }) });
      setOrder(await readResponse(response) as Order);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not save shipping details.");
    } finally {
      setBusy(false);
    }
  }

  async function startCheckout() {
    if (!order) return;
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/account/orders/${order.id}/checkout`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ success_url: `${window.location.origin}/account/orders/${order.id}/receipt?checkout=success`, cancel_url: `${window.location.origin}/cart?checkout=cancelled` }) });
      const payload = await readResponse(response) as { checkout_url?: string };
      if (!payload.checkout_url) throw new Error("Stripe did not return a checkout URL.");
      window.location.assign(payload.checkout_url);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start checkout.");
      setBusy(false);
    }
  }

  function changeAddress(field: keyof typeof emptyAddress, value: string) {
    setAddress((current) => ({ ...current, [field]: field === "country_code" ? value.toUpperCase() : value }));
  }

  if (!hydrated) return <p className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6">Loading cart...</p>;
  if (!items.length) return <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-8"><h2 className="text-2xl font-semibold">Your cart is empty.</h2><p className="mt-3 text-[var(--site-text-soft)]">Open a coffee detail page to add a lot to your cart.</p><Link href="/" className="mt-5 inline-flex rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">Browse coffees</Link></section>;

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6">
        <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Cart</p><h2 className="mt-2 text-2xl font-semibold">{itemCount} item{itemCount === 1 ? "" : "s"}</h2></div><button type="button" onClick={clear} className="text-sm font-semibold text-red-700">Clear</button></div>
        <div className="mt-6 grid gap-3">
          {items.map((item) => <article key={item.coffeeId} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4"><div className="flex items-start justify-between gap-4"><div><Link href={`/coffees/${item.slug}`} className="font-semibold hover:text-[var(--site-accent)]">{item.name}</Link><p className="mt-1 text-sm text-[var(--site-text-soft)]">{formatPrice(item.priceCents, item.currencyCode)} each</p></div><button type="button" onClick={() => removeItem(item.coffeeId)} className="text-sm font-semibold text-red-700">Remove</button></div><div className="mt-4 flex items-center gap-3"><button type="button" onClick={() => updateQuantity(item.coffeeId, item.quantity - 1)} className="h-8 w-8 rounded-full border border-[var(--site-border)]">-</button><span className="min-w-6 text-center font-semibold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.coffeeId, item.quantity + 1)} className="h-8 w-8 rounded-full border border-[var(--site-border)]">+</button></div></article>)}
        </div>
      </section>

      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Checkout</p>
        <h2 className="mt-2 text-2xl font-semibold">Ship this order</h2>
        <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">Sign in, confirm a supported shipping address, and you will be redirected to Stripe test checkout.</p>
        {error ? <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p> : null}
        {!order ? <button type="button" disabled={busy} onClick={() => void createDraft()} className="mt-5 w-full rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] disabled:opacity-50">{busy ? "Creating order..." : "Continue to shipping"}</button> : <form onSubmit={saveShipping} className="mt-5 grid gap-3">{(["recipient_name", "address_line1", "address_line2", "city", "region", "postal_code", "country_code"] as const).map((field) => <input key={field} required={!field.includes("line2")} value={address[field]} onChange={(event) => changeAddress(field, event.target.value)} placeholder={field.replaceAll("_", " ")} maxLength={field === "country_code" ? 2 : undefined} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none focus:border-[var(--site-accent)]" />)}<button type="submit" disabled={busy} className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] disabled:opacity-50">{busy ? "Saving..." : "Save shipping details"}</button>{order.shipping_cents > 0 ? <div className="mt-2 rounded-2xl bg-[var(--site-surface-soft)] p-4"><div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatPrice(order.subtotal_cents, "USD")}</span></div><div className="mt-2 flex justify-between text-sm"><span>Shipping</span><span>{formatPrice(order.shipping_cents, "USD")}</span></div><div className="mt-3 flex justify-between border-t border-[var(--site-border)] pt-3 font-semibold"><span>Total</span><span>{formatPrice(order.total_cents, "USD")}</span></div><button type="button" disabled={busy} onClick={() => void startCheckout()} className="mt-4 w-full rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Opening Stripe..." : "Continue to Stripe"}</button></div> : null}</form>}
      </section>
    </div>
  );
}
