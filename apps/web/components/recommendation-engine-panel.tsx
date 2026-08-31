"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";
import { defaultSommelierStore, SOMMELIER_STORAGE_KEY, type SommelierStore } from "@/lib/sommelier";
import {
  buildRecommendationProfile,
  rankCrossRecommendations,
  rankPersonalRecommendations,
  type JournalStore,
  type RecommendationProfile,
  type RecommendationResult,
} from "@/lib/recommendations";

const JOURNAL_STORAGE_KEY = "cafeatlas-journal-entries";
const PASSPORT_STORAGE_KEY = "cafeatlas-passport-collected-states";

type RecommendationSnapshot = {
  journal: string;
  passport: string;
  sommelier: string;
};

type RecommendationEnginePanelProps = {
  coffees: CoffeeRead[];
};

function readSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify({
      journal: "{}",
      passport: "[]",
      sommelier: JSON.stringify(defaultSommelierStore),
    } satisfies RecommendationSnapshot);
  }

  return JSON.stringify({
    journal: window.localStorage.getItem(JOURNAL_STORAGE_KEY) ?? "{}",
    passport: window.localStorage.getItem(PASSPORT_STORAGE_KEY) ?? "[]",
    sommelier: window.localStorage.getItem(SOMMELIER_STORAGE_KEY) ?? JSON.stringify(defaultSommelierStore),
  } satisfies RecommendationSnapshot);
}

function parseJournalStore(snapshot: string): JournalStore {
  try {
    const parsed = JSON.parse(snapshot) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return {};
    }

    const store: JournalStore = {};
    for (const [slug, value] of Object.entries(parsed as Record<string, unknown>)) {
      if (!value || typeof value !== "object" || Array.isArray(value)) {
        continue;
      }

      const entry = value as Partial<JournalStore[string]>;
      store[slug] = {
        rating:
          typeof entry.rating === "number" && Number.isFinite(entry.rating)
            ? Math.min(5, Math.max(1, Math.round(entry.rating)))
            : null,
        favorite: Boolean(entry.favorite),
        notes: typeof entry.notes === "string" ? entry.notes : "",
        updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString(),
      };
    }

    return store;
  } catch {
    return {};
  }
}

function parsePassport(snapshot: string) {
  try {
    const parsed = JSON.parse(snapshot) as unknown;
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.filter((value): value is string => typeof value === "string");
  } catch {
    return [];
  }
}

function parseSommelier(snapshot: string): SommelierStore {
  try {
    const parsed = JSON.parse(snapshot) as Partial<SommelierStore>;
    return {
      preferences: {
        roast: parsed.preferences?.roast ?? defaultSommelierStore.preferences.roast,
        process: parsed.preferences?.process ?? defaultSommelierStore.preferences.process,
        flavor: parsed.preferences?.flavor ?? defaultSommelierStore.preferences.flavor,
      },
      messages: Array.isArray(parsed.messages) ? parsed.messages : [],
    };
  } catch {
    return defaultSommelierStore;
  }
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const storageKeys = [JOURNAL_STORAGE_KEY, PASSPORT_STORAGE_KEY, SOMMELIER_STORAGE_KEY];

  const handleStorage = (event: StorageEvent) => {
    if (event.key && storageKeys.includes(event.key)) {
      callback();
    }
  };

  const handleCustomEvent = () => callback();

  storageKeys.forEach((key) => {
    window.addEventListener(key, handleCustomEvent);
  });
  window.addEventListener("storage", handleStorage);

  return () => {
    storageKeys.forEach((key) => {
      window.removeEventListener(key, handleCustomEvent);
    });
    window.removeEventListener("storage", handleStorage);
  };
}

function formatPercent(value: number) {
  return `${Math.round(value)}%`;
}

function formatUpdatedAt(isoDate: string) {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function getSummaryLine(profile: RecommendationProfile) {
  if (profile.summary.length > 0) {
    return profile.summary[0];
  }

  return "The engine is using your live catalog signals to make recommendations.";
}

function RecommendationCard({
  result,
  mode,
  active,
  onSelect,
}: {
  result: RecommendationResult;
  mode: "personal" | "cross";
  active: boolean;
  onSelect: () => void;
}) {
  return (
    <article
      className={`rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5 ${
        active
          ? "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"
          : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-accent)]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
            {mode === "personal" ? "Personal match" : "Cross recommendation"}
          </p>
          <h3 className="mt-2 text-lg font-semibold">{result.coffee.name}</h3>
          <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
            {result.coffee.origin_state} • {result.coffee.producer_name}
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
            {formatPercent(result.score)}
          </span>
          <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--site-text-soft)]">
            Fit {formatPercent(result.similarity)}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {result.genome.signature.map((dimension) => (
          <span
            key={dimension.key}
            className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
          >
            {dimension.label} {Math.round(dimension.value)}
          </span>
        ))}
      </div>

      <div className="mt-4 grid gap-2">
        {(mode === "personal" ? result.reasons : result.crossReasons).map((reason) => (
          <p key={reason} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] px-3 py-2 text-sm leading-7 text-[var(--site-text-soft)]">
            {reason}
          </p>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onSelect}
          className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
        >
          Focus
        </button>
        <Link
          href={`/coffees/${result.coffee.slug}`}
          className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
        >
          Open coffee
        </Link>
        <Link
          href={`/genome?coffee=${result.coffee.slug}`}
          className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
        >
          View genome
        </Link>
      </div>
    </article>
  );
}

export function RecommendationEnginePanel({ coffees }: RecommendationEnginePanelProps) {
  const snapshot = useSyncExternalStore(subscribe, readSnapshot, () =>
    JSON.stringify({
      journal: "{}",
      passport: "[]",
      sommelier: JSON.stringify(defaultSommelierStore),
    } satisfies RecommendationSnapshot)
  );
  const [selectedSlug, setSelectedSlug] = useState("");

  const parsed = JSON.parse(snapshot) as RecommendationSnapshot;
  const journalStore = parseJournalStore(parsed.journal);
  const passportStates = parsePassport(parsed.passport);
  const sommelierStore = parseSommelier(parsed.sommelier);
  const profile = buildRecommendationProfile(coffees, journalStore, passportStates, sommelierStore.preferences);
  const personalRecommendations = rankPersonalRecommendations(coffees, profile);
  const crossRecommendations = rankCrossRecommendations(coffees, profile);
  const allRecommendations = [...personalRecommendations, ...crossRecommendations];
  const activeResult =
    allRecommendations.find((result) => result.coffee.slug === selectedSlug) ??
    allRecommendations[0] ??
    null;

  const recentJournalEntries = Object.entries(journalStore)
    .map(([slug, entry]) => ({ slug, entry, coffee: coffees.find((coffee) => coffee.slug === slug) }))
    .sort((left, right) => new Date(right.entry.updatedAt).getTime() - new Date(left.entry.updatedAt).getTime())
    .slice(0, 4);

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(57,32,18,0.98),rgba(125,76,38,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">AI recommendation engine</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Personalized picks from your taste history, passport, and sommelier settings.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            This layer learns from rated coffees, favorite notes, and collected states, then blends those signals with
            the live catalog to produce similarity matches and cross recommendations.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/sommelier"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open sommelier
            </Link>
            <Link
              href="/journal"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open journal
            </Link>
            <Link
              href="/passport"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open passport
            </Link>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Favorites</p>
              <p className="mt-2 text-2xl font-semibold">{profile.favoriteCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Ratings</p>
              <p className="mt-2 text-2xl font-semibold">{profile.ratedCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">States</p>
              <p className="mt-2 text-2xl font-semibold">{profile.passportCount}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Learned profile</p>
            <p className="mt-2 text-xl font-semibold">{profile.topTraits[0]?.label ?? "Taste profile"}</p>
            <p className="mt-2 text-sm leading-7 text-white/75">{getSummaryLine(profile)}</p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.94fr_1.06fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Learning preferences</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">What the engine learned</h2>
          <div className="mt-5 grid gap-3">
            {profile.summary.length > 0 ? (
              profile.summary.map((item) => (
                <p
                  key={item}
                  className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 text-sm leading-7 text-[var(--site-text-soft)]"
                >
                  {item}
                </p>
              ))
            ) : (
              <p className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 text-sm leading-7 text-[var(--site-text-soft)]">
                Add a favorite or a rating in the journal to teach the engine what matters.
              </p>
            )}
          </div>

          <div className="mt-6 grid gap-3">
            {profile.topTraits.map((trait) => (
              <div
                key={trait.key}
                className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{trait.label}</p>
                    <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">
                      This is one of the strongest dimensions in the learned profile.
                    </p>
                  </div>
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                    {Math.round(trait.value)}
                  </span>
                </div>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,rgba(102,62,22,0.95),rgba(236,190,136,0.98))]"
                    style={{ width: `${trait.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Selected match</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {activeResult ? activeResult.coffee.name : "No recommendation yet"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            {activeResult
              ? `${activeResult.coffee.origin_state} • ${activeResult.coffee.producer_name} • ${activeResult.coffee.process ?? "Process n/a"}`
              : "Add journal entries or a sommelier preference to generate recommendations."}
          </p>

          {activeResult ? (
            <div className="mt-6 grid gap-3">
              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Recommendation fit</p>
                    <p className="mt-2 text-3xl font-semibold">{formatPercent(activeResult.score)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {activeResult.genome.signature.map((dimension) => (
                      <span
                        key={dimension.key}
                        className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                      >
                        {dimension.label} {Math.round(dimension.value)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid gap-2">
                {activeResult.reasons.map((reason) => (
                  <p
                    key={reason}
                    className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 text-sm leading-7 text-[var(--site-text-soft)]"
                  >
                    {reason}
                  </p>
                ))}
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/coffees/${activeResult.coffee.slug}`}
                  className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                >
                  Open coffee
                </Link>
                <Link
                  href={`/genome?coffee=${activeResult.coffee.slug}`}
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  View genome
                </Link>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Personalized suggestions</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Similarity matching</h2>
          <div className="mt-5 grid gap-3">
            {personalRecommendations.length > 0 ? (
              personalRecommendations.map((result) => (
                <RecommendationCard
                  key={result.coffee.slug}
                  result={result}
                  mode="personal"
                  active={result.coffee.slug === activeResult?.coffee.slug}
                  onSelect={() => setSelectedSlug(result.coffee.slug)}
                />
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Save a few ratings in the journal to teach the engine what you like.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Cross recommendations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Broaden the map</h2>
          <div className="mt-5 grid gap-3">
            {crossRecommendations.length > 0 ? (
              crossRecommendations.map((result) => (
                <RecommendationCard
                  key={result.coffee.slug}
                  result={result}
                  mode="cross"
                  active={result.coffee.slug === activeResult?.coffee.slug}
                  onSelect={() => setSelectedSlug(result.coffee.slug)}
                />
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Cross recommendations appear once the engine has enough saved taste signals.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Recent history</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Latest journal signals</h2>
        {recentJournalEntries.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {recentJournalEntries.map(({ slug, entry, coffee }) => (
              <div
                key={slug}
                className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                      {coffee?.origin_state ?? "Saved entry"}
                    </p>
                    <h3 className="mt-2 text-lg font-semibold">{coffee?.name ?? slug}</h3>
                  </div>
                  {entry.favorite ? (
                    <span className="rounded-full bg-[var(--site-success)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--site-success-foreground)]">
                      Favorite
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                  {entry.notes.trim() || "No notes captured yet."}
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs text-[var(--site-text-soft)]">
                  {entry.rating ? (
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 font-medium">
                      {entry.rating}/5
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 font-medium">
                    Updated {formatUpdatedAt(entry.updatedAt)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            The engine learns from journal ratings, passport states, and your sommelier preferences.
          </p>
        )}
      </section>
    </div>
  );
}
