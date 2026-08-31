"use client";

import Link from "next/link";
import { useState, useSyncExternalStore } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";

const STORAGE_KEY = "cafeatlas-journal-entries";

type JournalEntry = {
  rating: number | null;
  favorite: boolean;
  notes: string;
  updatedAt: string;
};

type JournalStore = Record<string, JournalEntry>;

type JournalBoardProps = {
  coffees: CoffeeRead[];
};

function defaultJournalEntry(): JournalEntry {
  return {
    rating: null,
    favorite: false,
    notes: "",
    updatedAt: new Date(0).toISOString(),
  };
}

function readJournalSnapshot() {
  if (typeof window === "undefined") {
    return "{}";
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? "{}";
}

function subscribeToJournal(callback: () => void) {
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

      const entry = value as Partial<JournalEntry>;
      const rating =
        typeof entry.rating === "number" && Number.isFinite(entry.rating)
          ? Math.min(5, Math.max(1, Math.round(entry.rating)))
          : null;

      store[slug] = {
        rating,
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

function writeJournalStore(store: JournalStore) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
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

export function JournalBoard({ coffees }: JournalBoardProps) {
  const snapshot = useSyncExternalStore(subscribeToJournal, readJournalSnapshot, () => "{}");
  const journal = parseJournalStore(snapshot);
  const [selectedSlug, setSelectedSlug] = useState(coffees[0]?.slug ?? "");

  const selectedCoffee = coffees.find((coffee) => coffee.slug === selectedSlug) ?? coffees[0] ?? null;
  const activeEntry = selectedCoffee ? journal[selectedCoffee.slug] ?? defaultJournalEntry() : defaultJournalEntry();
  const entries = Object.entries(journal)
    .map(([slug, entry]) => {
      const coffee = coffees.find((item) => item.slug === slug);
      return { slug, coffee, entry };
    })
    .sort((left, right) => {
      const leftTime = new Date(left.entry.updatedAt).getTime();
      const rightTime = new Date(right.entry.updatedAt).getTime();
      return rightTime - leftTime;
    });

  const favoriteCount = entries.filter((item) => item.entry.favorite).length;
  const ratedCount = entries.filter((item) => item.entry.rating !== null).length;

  function persist(next: JournalStore) {
    writeJournalStore(next);
    window.dispatchEvent(new Event(STORAGE_KEY));
  }

  function updateActiveEntry(updates: Partial<JournalEntry>) {
    if (!selectedCoffee) {
      return;
    }

    const next: JournalStore = {
      ...journal,
      [selectedCoffee.slug]: {
        ...activeEntry,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    };

    persist(next);
  }

  function clearActiveEntry() {
    if (!selectedCoffee) {
      return;
    }

    const next = { ...journal };
    delete next[selectedCoffee.slug];
    persist(next);
  }

  function clearAllEntries() {
    persist({});
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(122,74,35,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Coffee journal</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Save tasting notes, mark favorites, and keep a history of every cup.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            This journal stores data in your browser so you can rate coffees, write private notes, and revisit your
            tasting history without waiting for backend work.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open discovery
            </Link>
            <Link
              href="/passport"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open passport
            </Link>
            <button
              type="button"
              onClick={clearAllEntries}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Clear journal
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Entries</p>
              <p className="mt-2 text-2xl font-semibold">{entries.length}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Favorites</p>
              <p className="mt-2 text-2xl font-semibold">{favoriteCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Rated</p>
              <p className="mt-2 text-2xl font-semibold">{ratedCount}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Selected coffee</p>
            <p className="mt-2 text-xl font-semibold">{selectedCoffee?.name ?? "Choose a coffee below"}</p>
            <p className="mt-2 text-sm leading-7 text-white/75">
              {selectedCoffee
                ? `${selectedCoffee.origin_state} • ${selectedCoffee.producer_name}`
                : "Pick a coffee to start capturing tasting notes."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Coffees</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Pick a coffee to journal</h2>
          <div className="mt-5 grid gap-3">
            {coffees.map((coffee) => {
              const entry = journal[coffee.slug];
              const isSelected = coffee.slug === selectedCoffee?.slug;

              return (
                <button
                  key={coffee.slug}
                  type="button"
                  onClick={() => setSelectedSlug(coffee.slug)}
                  className={`rounded-[1.5rem] border p-4 text-left transition hover:-translate-y-0.5 ${
                    isSelected
                      ? "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"
                      : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-accent)]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                        {coffee.origin_state}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{coffee.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                        entry
                          ? "bg-[var(--site-accent)] text-[var(--site-accent-foreground)]"
                          : "bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
                      }`}
                    >
                      {entry ? "Journaled" : "Open"}
                    </span>
                  </div>

                  <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                    {coffee.producer_name} • {coffee.roast_level ?? "Unknown roast"} • {coffee.process ?? "Process n/a"}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {entry?.rating ? (
                      <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                        {entry.rating}/5 rating
                      </span>
                    ) : null}
                    {entry?.favorite ? (
                      <span className="rounded-full bg-[var(--site-success)] px-3 py-1 text-xs font-medium text-[var(--site-success-foreground)]">
                        Favorite
                      </span>
                    ) : null}
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {coffee.slug}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Editor</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">
            {selectedCoffee ? selectedCoffee.name : "Select a coffee"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            {selectedCoffee
              ? "Write private tasting notes, rate the cup, and mark it as a favorite. Everything is saved in your browser."
              : "Choose a coffee from the list to start a journal entry."}
          </p>

          {selectedCoffee ? (
            <div className="mt-6 grid gap-5">
              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Rating</p>
                    <p className="mt-1 text-sm text-[var(--site-text-soft)]">Select a score from 1 to 5.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {[1, 2, 3, 4, 5].map((rating) => {
                      const active = activeEntry.rating === rating;

                      return (
                        <button
                          key={rating}
                          type="button"
                          onClick={() => updateActiveEntry({ rating })}
                          className={`h-11 w-11 rounded-full border text-sm font-semibold transition ${
                            active
                              ? "border-[var(--site-accent)] bg-[var(--site-accent)] text-[var(--site-accent-foreground)]"
                              : "border-[var(--site-border)] bg-[var(--site-surface-card)] text-[var(--site-foreground)] hover:border-[var(--site-accent)]"
                          }`}
                        >
                          {rating}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => updateActiveEntry({ favorite: !activeEntry.favorite })}
                  className={`rounded-[1.5rem] border p-4 text-left transition ${
                    activeEntry.favorite
                      ? "border-[var(--site-success)] bg-[var(--site-success)]/10"
                      : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-success)]"
                  }`}
                >
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Favorite</p>
                  <p className="mt-2 text-base font-semibold">
                    {activeEntry.favorite ? "Marked as favorite" : "Mark this coffee as a favorite"}
                  </p>
                </button>

                <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Last updated</p>
                  <p className="mt-2 text-base font-semibold">{formatUpdatedAt(activeEntry.updatedAt)}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                    {selectedCoffee.producer_name} • {selectedCoffee.origin_state}
                  </p>
                </div>
              </div>

              <div className="grid gap-2">
                <label htmlFor="journal-notes" className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                  Private notes
                </label>
                <textarea
                  id="journal-notes"
                  value={activeEntry.notes}
                  onChange={(event) => updateActiveEntry({ notes: event.target.value })}
                  placeholder="Tasting notes, brew parameters, flavor impressions, and anything you want to remember."
                  className="min-h-48 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-[var(--site-foreground)] outline-none transition placeholder:text-[var(--site-text-soft)] focus:border-[var(--site-accent)]"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/coffees/${selectedCoffee.slug}`}
                  className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                >
                  Open coffee page
                </Link>
                <button
                  type="button"
                  onClick={clearActiveEntry}
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Remove entry
                </button>
              </div>
            </div>
          ) : null}
        </article>
      </section>

      <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">History</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Recent journal activity</h2>
        {entries.length > 0 ? (
          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {entries.slice(0, 6).map(({ slug, coffee, entry }) => (
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
                    <span className="rounded-full bg-[var(--site-success)] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--site-success-foreground)]">
                      Favorite
                    </span>
                  ) : null}
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                  {entry.notes.trim() || "No notes yet."}
                </p>
                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-[var(--site-text-soft)]">
                  {entry.rating ? (
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 font-medium">
                      {entry.rating}/5
                    </span>
                  ) : null}
                  <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 font-medium">
                    Updated {formatUpdatedAt(entry.updatedAt)}
                  </span>
                  {coffee ? (
                    <Link href={`/coffees/${coffee.slug}`} className="font-medium text-[var(--site-accent)]">
                      View coffee
                    </Link>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">
            Nothing is saved yet. Pick a coffee above, set a rating, and write your first notes.
          </p>
        )}
      </section>
    </div>
  );
}
