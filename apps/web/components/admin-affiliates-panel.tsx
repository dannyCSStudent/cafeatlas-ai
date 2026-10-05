"use client";

import { useEffect, useState } from "react";

type Affiliate = { id: number; user_id: string; referral_code: string; status: "requested" | "active" | "paused"; commission_rate_bps: number; pending_commission_cents: number; paid_commission_cents: number; attributed_order_count: number; click_count: number };

export function AdminAffiliatesPanel() {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/affiliates", { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) setAffiliates((await response.json()) as Affiliate[]);
        else setMessage("Could not load affiliate applications.");
      })
      .catch(() => setMessage("Could not load affiliate applications."));
  }, []);

  async function update(affiliate: Affiliate, status: Affiliate["status"]) {
    const response = await fetch(`/api/admin/affiliates/${affiliate.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, commission_rate_bps: affiliate.commission_rate_bps }),
    });
    if (!response.ok) {
      setMessage("Could not update affiliate status.");
      return;
    }
    const updated = (await response.json()) as Affiliate;
    setAffiliates((current) => current.map((item) => item.id === updated.id ? updated : item));
    setMessage(`Affiliate ${status}.`);
  }

  return (
    <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Affiliate program</p>
        <h2 className="mt-2 text-2xl font-semibold">Review applications</h2>
      </div>
      {affiliates.length ? affiliates.map((affiliate) => (
        <article key={affiliate.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[var(--site-surface-soft)] p-4">
          <div className="min-w-0">
            <p className="font-semibold">{affiliate.referral_code}</p>
            <p className="mt-1 break-all text-xs text-[var(--site-text-soft)]">User {affiliate.user_id} · {affiliate.commission_rate_bps / 100}% commission · {affiliate.status}</p>
            <p className="mt-1 text-xs text-[var(--site-text-soft)]">{affiliate.click_count} clicks · {affiliate.attributed_order_count} orders · ${(affiliate.pending_commission_cents / 100).toFixed(2)} pending · ${(affiliate.paid_commission_cents / 100).toFixed(2)} paid</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {affiliate.status !== "active" ? <button type="button" onClick={() => void update(affiliate, "active")} className="rounded-full bg-[var(--site-inverse)] px-3 py-2 text-xs font-semibold text-[var(--site-inverse-foreground)]">Activate</button> : null}
            {affiliate.status !== "paused" ? <button type="button" onClick={() => void update(affiliate, "paused")} className="rounded-full border border-[var(--site-border)] px-3 py-2 text-xs font-semibold">Pause</button> : null}
          </div>
        </article>
      )) : <p className="text-sm text-[var(--site-text-soft)]">No affiliate applications yet.</p>}
      {message ? <p className="text-sm text-[var(--site-text-soft)]">{message}</p> : null}
    </section>
  );
}
