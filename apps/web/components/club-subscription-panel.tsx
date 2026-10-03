"use client";

import { useEffect, useState } from "react";

type Plan = "seasonal" | "origin" | "reserve";
type Subscription = { plan: string; status: string; cancel_at_period_end: boolean };

const plans: Array<{ id: Plan; name: string; price: string }> = [
  { id: "seasonal", name: "Seasonal Box", price: "$29 / month" },
  { id: "origin", name: "Origin Club", price: "$49 / month" },
  { id: "reserve", name: "Reserve Club", price: "$79 / month" },
];

export function ClubSubscriptionPanel() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<Plan | "cancel" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    try {
      const response = await fetch("/api/account/subscription", { cache: "no-store" });
      if (response.status === 401) {
        setSubscription(null);
        return;
      }
      if (!response.ok) throw new Error("Could not load subscription status.");
      setSubscription((await response.json()) as Subscription | null);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load subscription status.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function choosePlan(plan: Plan) {
    setBusy(plan);
    setError(null);
    try {
      const response = await fetch("/api/account/subscription", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ plan, success_url: `${window.location.origin}/club?checkout=success`, cancel_url: `${window.location.origin}/club?checkout=cancelled` }) });
      const payload = (await response.json()) as { checkout_url?: string; detail?: string };
      if (!response.ok || !payload.checkout_url) throw new Error(payload.detail ?? "Could not start Club checkout.");
      window.location.assign(payload.checkout_url);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start Club checkout.");
      setBusy(null);
    }
  }

  async function cancelSubscription() {
    setBusy("cancel");
    setError(null);
    try {
      const response = await fetch("/api/account/subscription", { method: "PATCH" });
      const payload = (await response.json()) as Subscription & { detail?: string };
      if (!response.ok) throw new Error(payload.detail ?? "Could not update subscription.");
      setSubscription(payload);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update subscription.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Subscription checkout</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Manage your Coffee Club plan</h2>
      </div>
      {error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {loading ? <p className="text-sm text-[var(--site-text-soft)]">Loading subscription status...</p> : subscription ? <div className="rounded-2xl border border-[var(--site-accent)] bg-[var(--site-surface-card-strong)] p-4"><p className="font-semibold">{subscription.plan} · {subscription.status}</p><p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{subscription.cancel_at_period_end ? "Cancellation is scheduled at the end of the current period." : "Your recurring Club plan is active in Stripe."}</p>{subscription.status === "active" && !subscription.cancel_at_period_end ? <button type="button" onClick={() => void cancelSubscription()} disabled={busy !== null} className="mt-4 rounded-full border border-[var(--site-border)] px-4 py-2 text-sm font-semibold">{busy === "cancel" ? "Updating..." : "Cancel at period end"}</button> : null}</div> : <div className="grid gap-3 md:grid-cols-3">{plans.map((plan) => <button key={plan.id} type="button" onClick={() => void choosePlan(plan.id)} disabled={busy !== null} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 text-left transition hover:border-[var(--site-accent)]"><span className="block text-sm font-semibold">{plan.name}</span><span className="mt-2 block text-sm text-[var(--site-text-soft)]">{busy === plan.id ? "Opening Stripe..." : plan.price}</span></button>)}</div>}
    </section>
  );
}
