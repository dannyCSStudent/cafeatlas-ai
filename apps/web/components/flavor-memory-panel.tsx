"use client";

import Link from "next/link";
import { type FormEvent, useState, useSyncExternalStore } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";
import {
  BREW_METHOD_OPTIONS,
  FLAVOR_MEMORY_STORAGE_KEY,
  buildFlavorMemoryInsight,
  parseFlavorMemoryStore,
  type FlavorMemoryEntry,
  type FlavorMemoryStore,
  type BrewMethod,
  writeFlavorMemoryStore,
} from "@/lib/flavor-memory";
import type { JournalStore } from "@/lib/recommendations";

const JOURNAL_STORAGE_KEY = "cafeatlas-journal-entries";

type FlavorMemoryPanelProps = {
  coffees: CoffeeRead[];
  initialSlug?: string;
};

function readJournalSnapshot() {
  if (typeof window === "undefined") {
    return "{}";
  }

  return window.localStorage.getItem(JOURNAL_STORAGE_KEY) ?? "{}";
}

function readMemorySnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify({ entries: [] } satisfies FlavorMemoryStore);
  }

  return window.localStorage.getItem(FLAVOR_MEMORY_STORAGE_KEY) ?? JSON.stringify({ entries: [] } satisfies FlavorMemoryStore);
}

function subscribe(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === JOURNAL_STORAGE_KEY || event.key === FLAVOR_MEMORY_STORAGE_KEY) {
      callback();
    }
  };

  const handleJournal = () => callback();
  const handleMemory = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(JOURNAL_STORAGE_KEY, handleJournal);
  window.addEventListener(FLAVOR_MEMORY_STORAGE_KEY, handleMemory);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(JOURNAL_STORAGE_KEY, handleJournal);
    window.removeEventListener(FLAVOR_MEMORY_STORAGE_KEY, handleMemory);
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

function createMemoryEntry(
  coffeeSlug: string,
  kind: FlavorMemoryEntry["kind"],
  brewMethod: BrewMethod,
  note: string
): FlavorMemoryEntry {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    coffeeSlug,
    kind,
    brewMethod,
    note,
    createdAt: new Date().toISOString(),
  };
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatSignedDelta(value: number) {
  const rounded = Math.round(value);
  return `${rounded > 0 ? "+" : ""}${rounded}`;
}

export function FlavorMemoryPanel({ coffees, initialSlug }: FlavorMemoryPanelProps) {
  const snapshot = useSyncExternalStore(
    subscribe,
    () =>
      JSON.stringify({
        journal: readJournalSnapshot(),
        memory: readMemorySnapshot(),
      }),
    () =>
      JSON.stringify({
        journal: "{}",
        memory: JSON.stringify({ entries: [] } satisfies FlavorMemoryStore),
      })
  );

  const parsed = JSON.parse(snapshot) as { journal: string; memory: string };
  const journalStore = parseJournalStore(parsed.journal);
  const memoryStore = parseFlavorMemoryStore(parsed.memory);
  const insight = buildFlavorMemoryInsight(coffees, journalStore, memoryStore);

  const [selectedSlug, setSelectedSlug] = useState(initialSlug ?? coffees[0]?.slug ?? "");
  const [kind, setKind] = useState<FlavorMemoryEntry["kind"]>("brew");
  const [brewMethod, setBrewMethod] = useState<BrewMethod>("pour-over");
  const [note, setNote] = useState("");

  const selectedCoffee = coffees.find((coffee) => coffee.slug === selectedSlug) ?? coffees[0] ?? null;
  const recentEvents = [...insight.events].reverse().slice(0, 8);
  const rememberedCoffees = [...new Map(insight.events.map((event) => [event.coffeeSlug, event])).values()].slice(0, 6);

  function persist(nextStore: FlavorMemoryStore) {
    writeFlavorMemoryStore(nextStore);
    window.dispatchEvent(new Event(FLAVOR_MEMORY_STORAGE_KEY));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!selectedCoffee) {
      return;
    }

    const nextEntry = createMemoryEntry(selectedCoffee.slug, kind, brewMethod, note.trim());
    persist({
      entries: [...memoryStore.entries, nextEntry],
    });

    setNote("");
    setKind("brew");
    setBrewMethod("pour-over");
  }

  function clearMemory() {
    persist({ entries: [] });
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(56,32,18,0.98),rgba(128,77,39,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">AI flavor memory</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Remember purchases, ratings, favorites, brew methods, and taste evolution.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            This memory lane merges journal signals with explicit brew logs so the catalog can learn what you like
            over time instead of treating every visit as a blank slate.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/recommendations"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open recommendations
            </Link>
            <Link
              href="/journal"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open journal
            </Link>
            <button
              type="button"
              onClick={clearMemory}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Clear memory
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Events</p>
              <p className="mt-2 text-2xl font-semibold">{insight.memoryCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Ratings</p>
              <p className="mt-2 text-2xl font-semibold">{insight.ratingCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Favorites</p>
              <p className="mt-2 text-2xl font-semibold">{insight.favoriteCount}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Brew logs</p>
              <p className="mt-2 text-2xl font-semibold">{insight.brewCount}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Memory summary</p>
            <p className="mt-2 text-xl font-semibold">{insight.topTraits[0]?.label ?? "Taste memory"}</p>
            <p className="mt-2 text-sm leading-7 text-white/75">
              {insight.summary[0] ?? "Start logging cups to teach the memory layer what matters."}
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Log memory</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Capture a purchase or brew session</h2>

          <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Coffee</span>
              <select
                value={selectedSlug}
                onChange={(event) => setSelectedSlug(event.target.value)}
                className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
              >
                {coffees.map((coffee) => (
                  <option key={coffee.slug} value={coffee.slug}>
                    {coffee.name} {coffee.origin_state ? `• ${coffee.origin_state}` : ""}
                  </option>
                ))}
              </select>
            </label>

            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Memory type</span>
                <select
                  value={kind}
                  onChange={(event) => setKind(event.target.value as FlavorMemoryEntry["kind"])}
                  className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
                >
                  <option value="brew">Brew session</option>
                  <option value="purchase">Purchase</option>
                </select>
              </label>

              <label className="grid gap-2">
                <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Brew method</span>
                <select
                  value={brewMethod}
                  onChange={(event) => setBrewMethod(event.target.value as BrewMethod)}
                  className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
                >
                  {BREW_METHOD_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2">
              <span className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Notes</span>
              <textarea
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="What you bought, how you brewed it, and what changed in the cup."
                className="min-h-36 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-[var(--site-foreground)] outline-none transition placeholder:text-[var(--site-text-soft)] focus:border-[var(--site-accent)]"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
              >
                Save memory
              </button>
              <Link
                href={`/coffees/${selectedCoffee?.slug ?? coffees[0]?.slug ?? ""}`}
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Open coffee
              </Link>
            </div>
          </form>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Taste evolution</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">How your memory is changing</h2>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {insight.evolution.map((dimension) => (
              <div
                key={dimension.key}
                className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
              >
                <p className="text-sm font-semibold">{dimension.label}</p>
                <p className="mt-2 text-2xl font-semibold">
                  {formatSignedDelta(dimension.delta)}
                </p>
                <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                  {dimension.delta > 0 ? "Increasing in recent memories." : "Fading in recent memories."}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3">
            <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Early memory</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                The first half of recorded events leaned toward {insight.topTraits[0]?.label.toLowerCase() ?? "balanced cups"}.
              </p>
            </div>
            <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Recent memory</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                The latest events are reinforcing {insight.topTraits[0]?.label.toLowerCase() ?? "the current profile"} and
                sharpening the model.
              </p>
            </div>
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.04fr_0.96fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Memory profile</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Learned flavor shape</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {insight.topTraits.map((trait) => (
              <div
                key={trait.key}
                className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">{trait.label}</p>
                    <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">
                      Weighted from journal ratings, favorites, and logged brew sessions.
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
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Brew methods</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Methods you return to</h2>
          <div className="mt-5 grid gap-3">
            {insight.brewMethods.length > 0 ? (
              insight.brewMethods.map((method) => {
                const methodLabel = BREW_METHOD_OPTIONS.find((option) => option.value === method.method)?.label ?? method.method;
                return (
                  <div
                    key={method.method}
                    className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold">{methodLabel}</p>
                        <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">
                          Captured from your manual flavor memories.
                        </p>
                      </div>
                      <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                        {method.count}
                      </span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                      <div
                        className="h-full rounded-full bg-[linear-gradient(90deg,rgba(102,62,22,0.9),rgba(236,190,136,0.96))]"
                        style={{ width: `${Math.min(100, method.count * 20)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Log a brew session to start tracking method memory.
              </p>
            )}
          </div>
        </article>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Timeline</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Most recent memories</h2>
          <div className="mt-5 grid gap-3">
            {recentEvents.length > 0 ? (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                        {event.kind === "favorite"
                          ? "Favorite"
                          : event.kind === "rating"
                            ? "Rating"
                            : event.kind === "purchase"
                              ? "Purchase"
                              : "Brew"}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{event.coffeeName}</h3>
                    </div>
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {formatDate(event.createdAt)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{event.note}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {event.brewMethod ? (
                      <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                        {BREW_METHOD_OPTIONS.find((option) => option.value === event.brewMethod)?.label ?? event.brewMethod}
                      </span>
                    ) : null}
                    <Link
                      href={`/coffees/${event.coffeeSlug}`}
                      className="rounded-full bg-[var(--site-inverse)] px-3 py-1 text-xs font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                    >
                      Open coffee
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Add a memory log to populate the timeline.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Remembered coffees</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Coffees that shaped the memory</h2>
          <div className="mt-5 grid gap-3">
            {rememberedCoffees.length > 0 ? (
              rememberedCoffees.map((event) => (
                <div
                  key={event.coffeeSlug}
                  className="rounded-[1.35rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">{event.originState}</p>
                      <h3 className="mt-2 text-lg font-semibold">{event.coffeeName}</h3>
                    </div>
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {event.kind}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                    {event.note || "Recorded in the taste memory lane."}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Journal favorites and saved brew logs will appear here once the memory grows.
              </p>
            )}
          </div>
        </article>
      </section>
    </div>
  );
}
