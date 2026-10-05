"use client";

import { useEffect, useState } from "react";

type Profile = { company_name: string; contact_name: string; billing_email: string; country_code: string };

export function WholesaleBusinessProfile() {
  const [profile, setProfile] = useState<Profile>({ company_name: "", contact_name: "", billing_email: "", country_code: "US" });
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch("/api/account/wholesale/account", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) return;
      const payload = (await response.json()) as Profile | null;
      if (payload) setProfile(payload);
    }).catch(() => undefined);
  }, []);

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    const data = new FormData(event.currentTarget);
    const response = await fetch("/api/account/wholesale/account", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ company_name: data.get("company_name"), contact_name: data.get("contact_name"), billing_email: data.get("billing_email"), country_code: data.get("country_code") }) });
    const payload = (await response.json()) as Profile & { detail?: string };
    if (!response.ok) setMessage(payload.detail ?? "Could not save business profile.");
    else { setProfile(payload); setMessage("Business profile saved."); }
    setBusy(false);
  }

  return <form onSubmit={save} className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Business account</p><h2 className="mt-2 text-2xl font-semibold">Save your billing identity</h2><p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">These details will be reused for future bulk orders and invoices.</p></div><div className="grid gap-3 sm:grid-cols-2"><input required name="company_name" value={profile.company_name} onChange={(event) => setProfile({ ...profile, company_name: event.target.value })} placeholder="Company name" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><input required name="contact_name" value={profile.contact_name} onChange={(event) => setProfile({ ...profile, contact_name: event.target.value })} placeholder="Contact name" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /></div><div className="grid gap-3 sm:grid-cols-2"><input required type="email" name="billing_email" value={profile.billing_email} onChange={(event) => setProfile({ ...profile, billing_email: event.target.value })} placeholder="Billing email" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><input required name="country_code" value={profile.country_code} onChange={(event) => setProfile({ ...profile, country_code: event.target.value.toUpperCase() })} maxLength={2} placeholder="Country code" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /></div><div className="flex flex-wrap items-center gap-3"><button disabled={busy} type="submit" className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">{busy ? "Saving..." : "Save business profile"}</button>{message ? <span className="text-sm text-[var(--site-text-soft)]">{message}</span> : null}</div></form>;
}
