"use client";

import { useEffect, useState } from "react";

type CustomerNotification = {
  id: number;
  order_id?: number | null;
  kind: string;
  title: string;
  body: string;
  read_at?: string | null;
  created_at: string;
};

export function CustomerNotificationsPanel() {
  const [items, setItems] = useState<CustomerNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/notifications", { cache: "no-store" })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
        setItems(payload as CustomerNotification[]);
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load notifications."))
      .finally(() => setLoading(false));
  }, []);

  async function markRead(item: CustomerNotification) {
    if (item.read_at) return;
    const response = await fetch(`/api/account/notifications/${item.id}/read`, { method: "POST" });
    if (!response.ok) return;
    const updated = (await response.json()) as CustomerNotification;
    setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  }

  const unreadCount = items.filter((item) => !item.read_at).length;

  return (
    <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Notifications</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Your order updates</h2></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">{unreadCount} unread</span></div>
      {loading ? <p className="mt-5 text-sm text-[var(--site-text-soft)]">Loading notifications...</p> : error ? <p className="mt-5 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : items.length === 0 ? <p className="mt-5 text-sm leading-7 text-[var(--site-text-soft)]">Payment and fulfillment updates will appear here.</p> : (
        <div className="mt-5 grid gap-3">{items.slice(0, 6).map((item) => <button key={item.id} type="button" onClick={() => void markRead(item)} className={`rounded-2xl border p-4 text-left transition hover:bg-[var(--site-surface-hover)] ${item.read_at ? "border-[var(--site-border)] bg-[var(--site-surface-soft)]" : "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"}`}><div className="flex flex-wrap items-center justify-between gap-3"><span className="font-semibold">{item.title}</span><span className="text-xs text-[var(--site-muted)]">{new Date(item.created_at).toLocaleString()}</span></div><p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">{item.body}</p>{!item.read_at ? <span className="mt-3 block text-xs font-semibold uppercase tracking-[0.18em] text-[var(--site-accent)]">Mark read</span> : null}</button>)}</div>
      )}
    </section>
  );
}
