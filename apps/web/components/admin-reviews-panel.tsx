"use client";

import { useEffect, useState } from "react";

type Review = { id: number; coffee_id: number; user_id: string; rating: number; title: string; body: string; status: "published" | "hidden" | "flagged" };

export function AdminReviewsPanel() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetch("/api/admin/reviews", { cache: "no-store" }).then(async (response) => {
      if (!response.ok) { setError("Could not load review moderation queue."); return; }
      setReviews((await response.json()) as Review[]);
    }).catch(() => setError("Could not load review moderation queue."));
  }, []);

  async function moderate(id: number, status: Review["status"]) {
    const response = await fetch(`/api/admin/reviews/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    if (!response.ok) { setError("Could not update review status."); return; }
    setReviews((current) => current.map((review) => review.id === id ? { ...review, status } : review));
  }

  return <section className="grid gap-4 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Review moderation</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Keep community notes trustworthy</h2></div>{error ? <p className="rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}{reviews.length ? <div className="grid gap-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Coffee #{review.coffee_id} · {review.rating}/5</p><h3 className="mt-2 font-semibold">{review.title}</h3></div><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold uppercase">{review.status}</span></div><p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{review.body}</p><div className="mt-4 flex flex-wrap gap-2">{(["published", "flagged", "hidden"] as const).map((status) => <button key={status} type="button" onClick={() => void moderate(review.id, status)} className="rounded-full border border-[var(--site-border)] px-3 py-1.5 text-xs font-semibold">{status}</button>)}</div></article>)}</div> : <p className="text-sm text-[var(--site-text-soft)]">No reviews in the moderation queue.</p>}</section>;
}
