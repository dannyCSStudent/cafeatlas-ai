"use client";

import { useEffect, useState } from "react";

type Rewards = { points: number; tier: string; next_tier: string | null; points_to_next_tier: number; qualifying_orders: number };

export function CustomerRewardsPanel() {
  const [rewards, setRewards] = useState<Rewards | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/rewards", { cache: "no-store" }).then(async (response) => {
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load rewards.");
      setRewards(payload as Rewards);
    }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load rewards."));
  }, []);

  return <section className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
    <div className="flex items-center justify-between gap-4"><div><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Rewards</p><h2 className="mt-2 text-2xl font-semibold tracking-tight">Build your coffee trail</h2></div>{rewards ? <span className="rounded-full bg-[var(--site-accent)] px-3 py-1 text-xs font-semibold text-[var(--site-accent-foreground)]">{rewards.tier}</span> : null}</div>
    {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : rewards ? <><div className="mt-5 grid gap-3 sm:grid-cols-3"><div className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Points</p><p className="mt-2 text-2xl font-semibold">{rewards.points}</p></div><div className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Qualifying orders</p><p className="mt-2 text-2xl font-semibold">{rewards.qualifying_orders}</p></div><div className="rounded-2xl bg-[var(--site-surface-soft)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Next tier</p><p className="mt-2 text-lg font-semibold">{rewards.next_tier ?? "Atlas complete"}</p></div></div><p className="mt-4 text-sm leading-7 text-[var(--site-text-soft)]">Earn 1 point for each dollar of qualifying coffee subtotal. {rewards.next_tier ? `${rewards.points_to_next_tier} points remain until ${rewards.next_tier}.` : "You have reached the highest current tier."}</p></> : <p className="mt-5 text-sm text-[var(--site-text-soft)]">Loading rewards...</p>}
  </section>;
}
