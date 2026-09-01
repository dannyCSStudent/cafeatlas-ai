"use client";

import Link from "next/link";
import { useMemo, useSyncExternalStore } from "react";

import type { StateRead } from "@/lib/cafeatlas-api";

const STORAGE_KEY = "cafeatlas-passport-collected-states";

type PassportBoardProps = {
  states: StateRead[];
};

type Badge = {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
  progressLabel: string;
};

function parseCollectedStates(snapshot: string) {
  try {
    const parsed = JSON.parse(snapshot) as unknown;
    if (!Array.isArray(parsed)) {
      return new Set<string>();
    }

    return new Set(parsed.filter((value): value is string => typeof value === "string"));
  } catch {
    return new Set<string>();
  }
}

function readCollectedStatesSnapshot() {
  if (typeof window === "undefined") {
    return "[]";
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function writeCollectedStates(values: Set<string>) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...values]));
}

function subscribeToCollectedStates(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(STORAGE_KEY, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(STORAGE_KEY, handleCustomEvent);
  };
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function PassportBoard({ states }: PassportBoardProps) {
  const collectedSnapshot = useSyncExternalStore(
    subscribeToCollectedStates,
    readCollectedStatesSnapshot,
    () => "[]"
  );
  const collected = parseCollectedStates(collectedSnapshot);

  const totalStates = states.length;
  const collectedCount = states.filter((state) => collected.has(state.slug)).length;
  const progress = totalStates > 0 ? collectedCount / totalStates : 0;

  const badges: Badge[] = useMemo(
    () => [
      {
        id: "first-stamp",
        title: "First stamp",
        description: "Collect your first producing state.",
        unlocked: collectedCount >= 1,
        progressLabel: `${collectedCount >= 1 ? "Unlocked" : "Locked"}`,
      },
      {
        id: "regional-run",
        title: "Regional run",
        description: "Collect three states to show broad origin coverage.",
        unlocked: collectedCount >= 3,
        progressLabel: `${Math.min(collectedCount, 3)}/3 states`,
      },
      {
        id: "origin-collector",
        title: "Origin collector",
        description: "Collect every available state in the catalog.",
        unlocked: totalStates > 0 && collectedCount >= totalStates,
        progressLabel: `${collectedCount}/${totalStates || 0} states`,
      },
      {
        id: "explorer",
        title: "Explorer",
        description: "Open the discover and explore lanes from the passport.",
        unlocked: true,
        progressLabel: "Ready",
      },
    ],
    [collectedCount, totalStates]
  );

  function toggleState(slug: string) {
    const next = new Set(collected);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    writeCollectedStates(next);
    window.dispatchEvent(new Event(STORAGE_KEY));
  }

  function resetPassport() {
    const next = new Set<string>();
    writeCollectedStates(next);
    window.dispatchEvent(new Event(STORAGE_KEY));
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(117,73,37,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Coffee passport</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Collect origin stamps as you move through the catalog.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            This passport keeps a browser-local record of the states you have explored. It is the first layer of
            progress tracking, badges, and rewards.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open discovery
            </Link>
            <Link
              href="/explore"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open explorer
            </Link>
            <button
              type="button"
              onClick={resetPassport}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Reset passport
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Collected</p>
              <p className="mt-2 text-2xl font-semibold">{collectedCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">States</p>
              <p className="mt-2 text-2xl font-semibold">{totalStates}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Progress</p>
              <p className="mt-2 text-2xl font-semibold">{formatPercent(progress)}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">Passport progress</p>
              <p className="text-xs uppercase tracking-[0.24em] text-white/60">
                {collectedCount}/{totalStates}
              </p>
            </div>
            <div className="mt-3 h-3 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,rgba(255,255,255,0.95),rgba(236,190,136,0.98))]"
                style={{ width: `${Math.max(progress * 100, 6)}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {states.map((state, index) => {
          const collectedState = collected.has(state.slug);

          return (
            <article
              key={state.slug}
              className={`rounded-[1.75rem] border p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] transition hover:-translate-y-1 ${
                collectedState
                  ? "border-[var(--site-accent)] bg-[var(--site-surface-card)]"
                  : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-accent)]"
              }`}
            >
              <button type="button" onClick={() => toggleState(state.slug)} className="block w-full text-left">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Stamp {index + 1}</p>
                    <h2 className="mt-2 text-2xl font-semibold tracking-tight">{state.name}</h2>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] ${
                      collectedState
                        ? "bg-[var(--site-accent)] text-[var(--site-accent-foreground)]"
                        : "bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
                    }`}
                  >
                    {collectedState ? "Collected" : "Open"}
                  </span>
                </div>

                <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                  {state.coffee_count} coffees and {state.farm_count} farms are currently linked to this state.
                </p>
              </button>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                  {state.slug}
                </span>
                <Link
                  href={`/discover?state=${state.slug}`}
                  className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Discover
                </Link>
                <Link
                  href={`/states/${state.slug}`}
                  className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Profile
                </Link>
                <button
                  type="button"
                  onClick={() => toggleState(state.slug)}
                  className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  {collectedState ? "Remove stamp" : "Add stamp"}
                </button>
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Badges</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Milestones and unlocks</h2>
          <div className="mt-5 grid gap-3">
            {badges.map((badge) => (
              <div
                key={badge.id}
                className={`rounded-[1.5rem] border p-4 ${
                  badge.unlocked
                    ? "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"
                    : "border-dashed border-[var(--site-border)] bg-[var(--site-surface-soft)]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{badge.title}</p>
                    <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">{badge.description}</p>
                  </div>
                  <span className="rounded-full bg-[var(--site-surface-card)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-text-soft)]">
                    {badge.progressLabel}
                  </span>
                </div>
                <div className="mt-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-medium ${
                      badge.unlocked
                        ? "bg-[var(--site-success)] text-[var(--site-success-foreground)]"
                        : "bg-[var(--site-surface-card)] text-[var(--site-text-soft)]"
                    }`}
                  >
                    {badge.unlocked ? "Unlocked" : "Locked"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Rewards</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">What unlocks next</h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            This reward lane is a scaffold for future perks. For now, the passport itself is the reward: it proves
            which states you have explored and gives the mobile experience a concrete progression model.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Bronze reward</p>
              <p className="mt-2 text-base font-semibold">3 states collected</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                Unlocks a broader recommendation lane and the first progress badge.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Gold reward</p>
              <p className="mt-2 text-base font-semibold">All states collected</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                Unlocks the origin completion badge and a full coffee atlas view.
              </p>
            </div>
          </div>
        </article>
      </section>
    </div>
  );
}
