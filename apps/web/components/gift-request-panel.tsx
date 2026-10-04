"use client";

import { useState } from "react";

const boxes = ["Holiday Pair", "Office Tasting Set", "Reserve Gift Box"];

export function GiftRequestPanel() {
  const [box, setBox] = useState(boxes[0]);
  const [quantity, setQuantity] = useState("1");
  const [country, setCountry] = useState("US");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/gift-requests", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ box_name: box, quantity: Math.max(1, Number(quantity) || 1), delivery_country: country.toUpperCase(), note }) });
      const payload = (await response.json()) as { detail?: string };
      if (!response.ok) throw new Error(payload.detail ?? "Could not submit gift request.");
      setMessage("Gift request submitted. We will follow up with delivery and pricing details.");
      setNote("");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit gift request.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Request a gift</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Start a gift box request</h2><p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">Sign in to send box, quantity, destination, and note details to the CafeAtlas team.</p></div><form className="grid gap-3" onSubmit={submit}><select value={box} onChange={(event) => setBox(event.target.value)} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm">{boxes.map((item) => <option key={item}>{item}</option>)}</select><div className="grid gap-3 sm:grid-cols-2"><input value={quantity} onChange={(event) => setQuantity(event.target.value)} type="number" min="1" max="500" required placeholder="Quantity" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><input value={country} onChange={(event) => setCountry(event.target.value.toUpperCase())} maxLength={2} required placeholder="Country code" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /></div><textarea value={note} onChange={(event) => setNote(event.target.value)} required maxLength={2000} placeholder="Personal note or business request" className="min-h-28 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><div className="flex flex-wrap items-center gap-3"><button disabled={busy} type="submit" className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">{busy ? "Submitting..." : "Submit request"}</button>{message ? <span className="text-sm text-[var(--site-text-soft)]">{message}</span> : null}</div></form></section>;
}
