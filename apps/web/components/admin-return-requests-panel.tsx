"use client";

import { useEffect, useState } from "react";

type ReturnRequest = {
  id: number;
  order_id: number;
  user_id: string;
  status: string;
  reason: string;
  created_at: string;
};

export function AdminReturnRequestsPanel() {
  const [requests, setRequests] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function loadRequests() {
    try {
      const response = await fetch("/api/admin/returns", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
      setRequests(payload as ReturnRequest[]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load return requests.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadRequests(); }, []);

  async function resolve(request: ReturnRequest, status: "approved" | "rejected") {
    setSavingId(request.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/returns/${request.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : `Request failed (${response.status})`);
      setRequests((current) => current.map((item) => item.id === request.id ? payload : item));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update return request.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Returns</p><h2 className="mt-2 text-3xl font-semibold tracking-tight">Review customer return requests.</h2></div>
        <button type="button" onClick={() => void loadRequests()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {loading ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading return requests...</p> : requests.length === 0 ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">No return requests found.</p> : (
        <div className="mt-6 grid gap-3">
          {requests.map((request) => (
            <article key={request.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-semibold">Order #{request.order_id}</p><p className="mt-1 text-xs text-[var(--site-muted)]">Customer {request.user_id}</p></div><span className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--site-muted)]">{request.status}</span></div>
              <p className="mt-3 text-sm leading-6 text-[var(--site-text-soft)]">{request.reason}</p>
              {request.status === "pending" ? <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={savingId === request.id} onClick={() => void resolve(request, "approved")} className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Approve</button><button type="button" disabled={savingId === request.id} onClick={() => void resolve(request, "rejected")} className="rounded-full border border-[var(--site-border)] px-4 py-2 text-sm font-semibold disabled:opacity-50">Decline</button></div> : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
