"use client";

import { useEffect, useState } from "react";

type WholesaleRequest = { id: number; company_name: string; estimated_boxes: number; delivery_country: string; status: string; quote_total_cents: number | null; price_per_box_cents: number | null; quote_note: string | null; invoice_url: string | null; coffee_preferences: string | null };

export function WholesaleRequestForm() {
  const [requests, setRequests] = useState<WholesaleRequest[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    void fetch("/api/account/wholesale", { cache: "no-store" })
      .then(async (response) => { if (response.ok) setRequests((await response.json()) as WholesaleRequest[]); })
      .catch(() => undefined);
  }, []);

  async function startCheckout(id: number) {
    setMessage(null);
    const response = await fetch(`/api/account/wholesale/${id}/checkout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success_url: `${window.location.origin}/wholesale?payment=success`, cancel_url: `${window.location.origin}/wholesale?payment=cancelled` }),
    });
    const payload = (await response.json()) as { checkout_url?: string; detail?: string };
    if (!response.ok || !payload.checkout_url) {
      setMessage(payload.detail ?? "Could not start wholesale payment.");
      return;
    }
    window.location.assign(payload.checkout_url);
  }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage(null);
    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    try { const response = await fetch("/api/account/wholesale", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company_name: form.get("company_name"), contact_name: form.get("contact_name"), estimated_boxes: Number(form.get("estimated_boxes")), delivery_country: form.get("delivery_country"), note: form.get("note"), coffee_preferences: form.get("coffee_preferences") }) }); const payload = (await response.json()) as WholesaleRequest & { detail?: string }; if (!response.ok) throw new Error(payload.detail ?? "Could not submit wholesale request."); setRequests((current) => [payload, ...current]); setMessage("Wholesale request submitted. We will follow up with a quote."); formElement.reset(); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit wholesale request."); } finally { setBusy(false); }
  }
  return <div className="grid gap-6"><form onSubmit={submit} className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Request a quote</p><h2 className="mt-2 text-2xl font-semibold">Tell us about your volume</h2></div><div className="grid gap-3 sm:grid-cols-2"><input required name="company_name" placeholder="Company name" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><input required name="contact_name" placeholder="Contact name" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /></div><div className="grid gap-3 sm:grid-cols-2"><input required name="estimated_boxes" type="number" min="5" placeholder="Estimated boxes" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><input required name="delivery_country" defaultValue="US" maxLength={2} placeholder="Country code" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /></div><input name="coffee_preferences" placeholder="Preferred coffees or origins (optional)" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><textarea required name="note" placeholder="Tell us about your program, timing, and delivery needs" className="min-h-32 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><div className="flex flex-wrap items-center gap-3"><button disabled={busy} type="submit" className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">{busy ? "Submitting..." : "Submit quote request"}</button>{message ? <span className="text-sm text-[var(--site-text-soft)]">{message}</span> : null}</div></form>{requests.length ? <section className="grid gap-3 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Your requests</p><h2 className="mt-2 text-2xl font-semibold">Quote history</h2></div>{requests.map((request) => <article key={request.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="font-semibold">{request.company_name}</h3><p className="mt-1 text-sm text-[var(--site-text-soft)]">{request.estimated_boxes.toLocaleString()} boxes · {request.delivery_country}</p></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold uppercase">{request.status}</span></div>{request.coffee_preferences ? <p className="mt-3 text-sm text-[var(--site-text-soft)]">Coffee preferences: {request.coffee_preferences}</p> : null}{request.quote_total_cents !== null ? <p className="mt-3 text-sm font-semibold">Quote total: ${(request.quote_total_cents / 100).toFixed(2)} · ${((request.price_per_box_cents ?? 0) / 100).toFixed(2)}/box</p> : null}{request.quote_note ? <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{request.quote_note}</p> : null}{request.invoice_url ? <a href={request.invoice_url} target="_blank" rel="noreferrer" className="mt-4 inline-flex rounded-full border border-[var(--site-border)] px-4 py-2 text-sm font-semibold">Open invoice</a> : null}{request.status === "approved" && request.quote_total_cents ? <button type="button" onClick={() => void startCheckout(request.id)} className="mt-4 rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)]">Pay approved quote</button> : null}</article>)}</section> : null}</div>;
}
