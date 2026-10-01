"use client";

import { useEffect, useState } from "react";

type Address = { id: number; label: string; recipient_name: string; address_line1: string; address_line2?: string | null; city: string; region: string; postal_code: string; country_code: string };

const emptyForm = { label: "Home", recipient_name: "", address_line1: "", address_line2: "", city: "", region: "", postal_code: "", country_code: "US" };

export function CustomerAddressesPanel() {
  const [items, setItems] = useState<Address[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/addresses", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) throw new Error("Sign in to manage saved addresses.");
      setItems((await response.json()) as Address[]);
    }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load addresses.")).finally(() => setLoading(false));
  }, []);

  function change(name: keyof typeof emptyForm, value: string) { setForm((current) => ({ ...current, [name]: value })); }

  async function save(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const response = await fetch("/api/account/addresses", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not save address.");
      setItems((current) => [...current, payload as Address]);
      setForm(emptyForm);
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not save address."); }
    finally { setSaving(false); }
  }

  async function remove(id: number) {
    const response = await fetch(`/api/account/addresses/${id}`, { method: "DELETE" });
    if (response.ok) setItems((current) => current.filter((item) => item.id !== id));
  }

  return <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Addresses</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Saved shipping profiles</h2></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">{items.length} saved</span></div>
    {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
    {loading ? <p className="mt-5 text-sm text-[var(--site-text-soft)]">Loading addresses...</p> : <>
      {items.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{items.map((item) => <article key={item.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4"><p className="font-semibold">{item.label}</p><p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">{item.recipient_name}<br />{item.address_line1}{item.address_line2 ? <><br />{item.address_line2}</> : null}<br />{item.city}, {item.region} {item.postal_code}<br />{item.country_code}</p><button type="button" onClick={() => void remove(item.id)} className="mt-3 text-xs font-semibold uppercase tracking-[0.18em] text-red-700">Remove</button></article>)}</div> : <p className="mt-5 text-sm text-[var(--site-text-soft)]">Add an address for faster checkout later.</p>}
      <form onSubmit={(event) => void save(event)} className="mt-6 grid gap-3 sm:grid-cols-2">
        {(["label", "recipient_name", "address_line1", "address_line2", "city", "region", "postal_code"] as const).map((name) => <input key={name} required={name !== "address_line2"} value={form[name]} onChange={(event) => change(name, event.target.value)} placeholder={name.replaceAll("_", " ")} className="rounded-xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-3 py-2 text-sm outline-none focus:border-[var(--site-accent)]" />)}
        <button type="submit" disabled={saving} className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-semibold text-[var(--site-accent-foreground)] disabled:opacity-50 sm:col-span-2">{saving ? "Saving..." : "Add address"}</button>
      </form>
    </>}
  </section>;
}
