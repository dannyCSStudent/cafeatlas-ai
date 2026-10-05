"use client";

import { useEffect, useState } from "react";

type Affiliate = {
  id: number;
  referral_code: string;
  status: string;
  commission_rate_bps: number;
  created_at: string;
};

type AffiliateResponse = {
  affiliate: Affiliate;
  referral_url: string;
  pending_commission_cents: number;
  approved_commission_cents: number;
  paid_commission_cents: number;
  attributed_order_count: number;
};

type AffiliateDashboard = Affiliate & Omit<AffiliateResponse, "affiliate" | "referral_url">;

export function AffiliatePanel() {
  const [affiliate, setAffiliate] = useState<AffiliateDashboard | null>(null);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/account/affiliate", { cache: "no-store" })
      .then(async (response) => {
        if (response.ok) {
          const payload = (await response.json()) as AffiliateResponse | null;
          setAffiliate(payload ? { ...payload.affiliate, ...payload } : null);
        }
      })
      .catch(() => setMessage("Could not load affiliate status."))
      .finally(() => setBusy(false));
  }, []);

  async function apply() {
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch("/api/account/affiliate", { method: "POST" });
      const payload = (await response.json()) as AffiliateResponse & { detail?: string };
      if (!response.ok) throw new Error(payload.detail ?? "Could not submit affiliate application.");
      setAffiliate({ ...payload.affiliate, pending_commission_cents: 0, approved_commission_cents: 0, paid_commission_cents: 0, attributed_order_count: 0 });
      setMessage("Application submitted. Your referral link is ready while we review it.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not submit affiliate application.");
    } finally {
      setBusy(false);
    }
  }

  const referralUrl = affiliate ? `/coffees?ref=${affiliate.referral_code}` : null;

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Affiliate program</p>
      <h2 className="mt-2 text-2xl font-semibold">Share coffee you believe in</h2>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
        Apply to receive a personal referral link. Commission eligibility and payouts are reviewed before activation.
      </p>
      {affiliate ? (
        <div className="mt-5 grid gap-3 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-semibold">Status: {affiliate.status}</span>
            <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold uppercase">{affiliate.commission_rate_bps / 100}% commission</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <p className="text-sm text-[var(--site-text-soft)]">Attributed orders: <strong>{affiliate.attributed_order_count}</strong></p>
            <p className="text-sm text-[var(--site-text-soft)]">Pending: <strong>${(affiliate.pending_commission_cents / 100).toFixed(2)}</strong></p>
            <p className="text-sm text-[var(--site-text-soft)]">Paid: <strong>${(affiliate.paid_commission_cents / 100).toFixed(2)}</strong></p>
          </div>
          <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--site-muted)]">
            Referral link
            <input readOnly value={referralUrl ?? ""} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-2 text-sm font-normal normal-case tracking-normal" />
          </label>
        </div>
      ) : (
        <button disabled={busy} type="button" onClick={() => void apply()} className="mt-5 rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">
          {busy ? "Loading..." : "Apply to become an affiliate"}
        </button>
      )}
      {message ? <p className="mt-3 text-sm text-[var(--site-text-soft)]">{message}</p> : null}
    </section>
  );
}
