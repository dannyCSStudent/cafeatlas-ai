"use client";

import { useEffect, useState } from "react";

type Commission = { id: number; affiliate_id: number; order_id: number; amount_cents: number; status: "pending" | "approved" | "paid"; created_at: string };

export function AdminAffiliateCommissionsPanel() {
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/affiliate-commissions", { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) setCommissions((await response.json()) as Commission[]);
        else setMessage("Could not load affiliate commissions.");
      })
      .catch(() => setMessage("Could not load affiliate commissions."));
  }, []);

  async function advance(commission: Commission) {
    const nextStatus = commission.status === "pending" ? "approved" : "paid";
    const response = await fetch(`/api/admin/affiliate-commissions/${commission.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: nextStatus }),
    });
    if (!response.ok) {
      setMessage("Could not update commission.");
      return;
    }
    const updated = (await response.json()) as Commission;
    setCommissions((current) => current.map((item) => item.id === updated.id ? updated : item));
    setMessage(`Commission marked ${nextStatus}.`);
  }

  return (
    <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Affiliate payouts</p>
        <h2 className="mt-2 text-2xl font-semibold">Review commission ledger</h2>
      </div>
      {commissions.length ? commissions.map((commission) => (
        <article key={commission.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--site-surface-soft)] p-4">
          <div>
            <p className="font-semibold">${(commission.amount_cents / 100).toFixed(2)} · {commission.status}</p>
            <p className="mt-1 text-xs text-[var(--site-text-soft)]">Affiliate #{commission.affiliate_id} · Order #{commission.order_id}</p>
          </div>
          {commission.status !== "paid" ? <button type="button" onClick={() => void advance(commission)} className="rounded-full bg-[var(--site-inverse)] px-3 py-2 text-xs font-semibold text-[var(--site-inverse-foreground)]">Mark {commission.status === "pending" ? "approved" : "paid"}</button> : null}
        </article>
      )) : <p className="text-sm text-[var(--site-text-soft)]">No commissions yet.</p>}
      {message ? <p className="text-sm text-[var(--site-text-soft)]">{message}</p> : null}
    </section>
  );
}
