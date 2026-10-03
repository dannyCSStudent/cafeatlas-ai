"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Review = { id: number; rating: number; title: string; body: string; created_at: string };

export function CoffeeReviewsPanel({ coffeeId }: { coffeeId: number }) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [signedIn, setSignedIn] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void fetch(`/api/coffees/${coffeeId}/reviews`).then(async (response) => {
      if (response.ok) setReviews((await response.json()) as Review[]);
    });
  }, [coffeeId]);

  async function submitReview(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage(null);
    try {
      const response = await fetch(`/api/coffees/${coffeeId}/reviews`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ rating, title, body }) });
      const payload = (await response.json()) as Review & { detail?: string };
      if (response.status === 401) {
        setSignedIn(false);
        return;
      }
      if (!response.ok) throw new Error(payload.detail ?? "Could not save review.");
      setReviews((current) => [payload, ...current]);
      setTitle("");
      setBody("");
      setMessage("Review published.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Could not save review.");
    } finally {
      setBusy(false);
    }
  }

  return <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Community reviews</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">What people are tasting</h2></div>{reviews.length ? <div className="grid gap-3">{reviews.map((review) => <article key={review.id} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"><div className="flex flex-wrap items-center justify-between gap-3"><h3 className="font-semibold">{review.title}</h3><span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold">{review.rating}/5</span></div><p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{review.body}</p></article>)}</div> : <p className="text-sm leading-7 text-[var(--site-text-soft)]">No reviews yet. Be the first to share a cup.</p>}{signedIn ? <form className="grid gap-3 border-t border-[var(--site-border)] pt-5" onSubmit={submitReview}><p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Write a review</p><div className="flex flex-wrap gap-2">{[1, 2, 3, 4, 5].map((value) => <button key={value} type="button" onClick={() => setRating(value)} className={`h-10 w-10 rounded-full border text-sm font-semibold ${rating === value ? "border-[var(--site-accent)] bg-[var(--site-accent)] text-[var(--site-accent-foreground)]" : "border-[var(--site-border)]"}`}>{value}</button>)}</div><input value={title} onChange={(event) => setTitle(event.target.value)} required maxLength={160} placeholder="Review title" className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><textarea value={body} onChange={(event) => setBody(event.target.value)} required maxLength={4000} placeholder="What did you taste?" className="min-h-28 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm" /><div className="flex flex-wrap items-center gap-3"><button type="submit" disabled={busy} className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)]">{busy ? "Publishing..." : "Publish review"}</button>{message ? <span className="text-sm text-[var(--site-text-soft)]">{message}</span> : null}</div></form> : <p className="text-sm text-[var(--site-text-soft)]">Sign in to publish a review. <Link href="/auth" className="font-semibold underline">Sign in</Link></p>}</section>;
}
