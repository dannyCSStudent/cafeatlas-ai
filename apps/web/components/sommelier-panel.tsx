"use client";

import Link from "next/link";
import { type FormEvent, useState, useSyncExternalStore } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";
import {
  buildAssistantReply,
  buildConversationStarter,
  defaultSommelierStore,
  rankCoffees,
  SOMMELIER_STORAGE_KEY,
  type FlavorPreference,
  type ProcessPreference,
  type RoastPreference,
  type SommelierMessage,
  type SommelierPreferences,
  type SommelierStore,
} from "@/lib/sommelier";

type SommelierPanelProps = {
  coffees: CoffeeRead[];
};

function readSommelierSnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify(defaultSommelierStore);
  }

  return window.localStorage.getItem(SOMMELIER_STORAGE_KEY) ?? JSON.stringify(defaultSommelierStore);
}

function parseSommelierStore(snapshot: string): SommelierStore {
  try {
    const parsed = JSON.parse(snapshot) as Partial<SommelierStore>;
    const preferences = parsed.preferences ?? defaultSommelierStore.preferences;
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

    return {
      preferences: {
        roast: preferences.roast ?? defaultSommelierStore.preferences.roast,
        process: preferences.process ?? defaultSommelierStore.preferences.process,
        flavor: preferences.flavor ?? defaultSommelierStore.preferences.flavor,
      },
      messages: messages.filter(
        (message): message is SommelierMessage =>
          Boolean(
            message &&
              typeof message.id === "string" &&
              (message.role === "user" || message.role === "assistant") &&
              typeof message.content === "string" &&
              typeof message.createdAt === "string"
          )
      ),
    };
  } catch {
    return defaultSommelierStore;
  }
}

function subscribeToSommelier(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === SOMMELIER_STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(SOMMELIER_STORAGE_KEY, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(SOMMELIER_STORAGE_KEY, handleCustomEvent);
  };
}

function writeSommelierStore(store: SommelierStore) {
  window.localStorage.setItem(SOMMELIER_STORAGE_KEY, JSON.stringify(store));
}

function createMessage(role: SommelierMessage["role"], content: string, recommendations?: string[]): SommelierMessage {
  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
    createdAt: new Date().toISOString(),
    recommendations,
  };
}

function formatUpdatedAt(isoDate: string) {
  const value = new Date(isoDate);
  if (Number.isNaN(value.getTime())) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

const roastOptions: Array<{ value: RoastPreference; label: string; help: string }> = [
  { value: "light", label: "Light", help: "Sharper structure, brighter cups" },
  { value: "balanced", label: "Balanced", help: "Sweet middle ground" },
  { value: "dark", label: "Dark", help: "Deeper roast tone and body" },
];

const processOptions: Array<{ value: ProcessPreference; label: string; help: string }> = [
  { value: "washed", label: "Washed", help: "Clean and transparent" },
  { value: "honey", label: "Honey", help: "Sweet and rounded" },
  { value: "natural", label: "Natural", help: "Fruit-forward and plush" },
];

const flavorOptions: Array<{ value: FlavorPreference; label: string; help: string }> = [
  { value: "bright", label: "Bright", help: "Crisp acidity" },
  { value: "floral", label: "Floral", help: "Perfumed aromatics" },
  { value: "fruity", label: "Fruity", help: "Stone fruit and berries" },
  { value: "chocolate", label: "Chocolate", help: "Cocoa depth" },
  { value: "sweet", label: "Sweet", help: "Caramel and sugar notes" },
  { value: "nutty", label: "Nutty", help: "Round, comforting body" },
];

const promptSuggestions = [
  "I want something bright and floral.",
  "Show me a fruit-forward coffee with a clean finish.",
  "I prefer sweet, balanced cups for pour-over.",
  "Find me a richer coffee with chocolate notes.",
];

export function SommelierPanel({ coffees }: SommelierPanelProps) {
  const snapshot = useSyncExternalStore(subscribeToSommelier, readSommelierSnapshot, () =>
    JSON.stringify(defaultSommelierStore)
  );
  const store = parseSommelierStore(snapshot);
  const [draftPrompt, setDraftPrompt] = useState("");

  const recommendations = rankCoffees(coffees, store.preferences, draftPrompt);
  const selectedCoffee = recommendations[0]?.coffee ?? coffees[0] ?? null;
  const conversation =
    store.messages.length > 0
      ? store.messages
      : [
          {
            id: "starter",
            role: "assistant" as const,
            content: buildConversationStarter(store.preferences),
            createdAt: new Date().toISOString(),
          },
        ];

  function persist(nextStore: SommelierStore) {
    writeSommelierStore(nextStore);
    window.dispatchEvent(new Event(SOMMELIER_STORAGE_KEY));
  }

  function updatePreferences<K extends keyof SommelierPreferences>(key: K, value: SommelierPreferences[K]) {
    persist({
      ...store,
      preferences: {
        ...store.preferences,
        [key]: value,
      },
    });
  }

  function clearConversation() {
    persist({
      ...store,
      messages: [],
    });
  }

  function askSommelier(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const prompt = draftPrompt.trim();
    const ranked = rankCoffees(coffees, store.preferences, prompt);
    const assistantReply = buildAssistantReply(store.preferences, prompt, ranked);

    persist({
      ...store,
      messages: [...store.messages, createMessage("user", prompt || "Help me choose a coffee."), createMessage("assistant", assistantReply, ranked.map((item) => item.coffee.slug))].slice(-10),
    });

    setDraftPrompt("");
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(55,31,18,0.98),rgba(131,77,37,0.95))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.16)] lg:grid-cols-[1.08fr_0.92fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">AI coffee sommelier</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Ask for coffee recommendations in plain language.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            The assistant uses the live catalog, your saved preferences, and the words you use to explain why a cup
            fits your taste.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/discover"
              className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
            >
              Open discovery
            </Link>
            <Link
              href="/journal"
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Open journal
            </Link>
            <button
              type="button"
              onClick={clearConversation}
              className="rounded-full border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              Clear chat
            </button>
          </div>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
          <div className="grid grid-cols-3 gap-3">
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Prefs</p>
              <p className="mt-2 text-2xl font-semibold">3</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Prompts</p>
              <p className="mt-2 text-2xl font-semibold">{store.messages.filter((message) => message.role === "user").length}</p>
            </article>
            <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
              <p className="text-xs uppercase tracking-[0.22em] text-white/60">Top picks</p>
              <p className="mt-2 text-2xl font-semibold">{Math.min(recommendations.length, 4)}</p>
            </article>
          </div>

          <div className="rounded-[1.5rem] border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/60">Current taste lens</p>
            <p className="mt-2 text-xl font-semibold">
              {store.preferences.roast} roast, {store.preferences.process} process
            </p>
            <p className="mt-2 text-sm leading-7 text-white/75">
              Focused on {store.preferences.flavor} notes and the language you use to describe the cup.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.98fr_1.02fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Preference collection</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Shape the recommendation lens</h2>

          <div className="mt-5 grid gap-5">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Roast preference</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {roastOptions.map((option) => {
                  const active = store.preferences.roast === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updatePreferences("roast", option.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--site-accent)] bg-[var(--site-accent)] text-[var(--site-accent-foreground)]"
                          : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] text-[var(--site-foreground)] hover:border-[var(--site-accent)]"
                      }`}
                    >
                      <span className="block">{option.label}</span>
                      <span className={`block text-[10px] font-medium uppercase tracking-[0.18em] ${active ? "text-[var(--site-accent-foreground)]/75" : "text-[var(--site-muted)]"}`}>
                        {option.help}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Process preference</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {processOptions.map((option) => {
                  const active = store.preferences.process === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updatePreferences("process", option.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--site-accent)] bg-[var(--site-surface-card)] text-[var(--site-foreground)]"
                          : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] text-[var(--site-foreground)] hover:border-[var(--site-accent)]"
                      }`}
                    >
                      <span className="block">{option.label}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--site-muted)]">
                        {option.help}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Flavor focus</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {flavorOptions.map((option) => {
                  const active = store.preferences.flavor === option.value;
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => updatePreferences("flavor", option.value)}
                      className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                        active
                          ? "border-[var(--site-success)] bg-[var(--site-success)] text-[var(--site-success-foreground)]"
                          : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] text-[var(--site-foreground)] hover:border-[var(--site-success)]"
                      }`}
                    >
                      <span className="block">{option.label}</span>
                      <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-[var(--site-muted)]">
                        {option.help}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <form className="grid gap-3" onSubmit={askSommelier}>
              <label htmlFor="sommelier-prompt" className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                Ask the sommelier
              </label>
              <textarea
                id="sommelier-prompt"
                value={draftPrompt}
                onChange={(event) => setDraftPrompt(event.target.value)}
                placeholder="Example: I want a bright coffee with floral notes for pour-over."
                className="min-h-32 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-[var(--site-foreground)] outline-none transition placeholder:text-[var(--site-text-soft)] focus:border-[var(--site-accent)]"
              />
              <div className="flex flex-wrap gap-2">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setDraftPrompt(suggestion)}
                    className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                >
                  Ask for recommendations
                </button>
                <button
                  type="button"
                  onClick={() => setDraftPrompt("")}
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-5 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Clear prompt
                </button>
              </div>
            </form>
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Conversation interface</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Assistant responses</h2>

          <div className="mt-5 space-y-4">
            {conversation.map((message) => (
              <div
                key={message.id}
                className={`max-w-3xl rounded-[1.5rem] border p-4 ${
                  message.role === "assistant"
                    ? "border-[var(--site-accent)] bg-[var(--site-surface-card-strong)]"
                    : "ml-auto border-[var(--site-border)] bg-[var(--site-surface-soft)]"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                    {message.role === "assistant" ? "Sommelier" : "You"}
                  </p>
                  <span className="text-[10px] uppercase tracking-[0.2em] text-[var(--site-muted)]">
                    {formatUpdatedAt(message.createdAt)}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-[var(--site-foreground)]">{message.content}</p>
                {message.recommendations?.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {message.recommendations.map((slug) => (
                      <span
                        key={slug}
                        className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                      >
                        {slug}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Recommendations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Best matches from the catalog</h2>
          <div className="mt-5 grid gap-3">
            {recommendations.length > 0 ? (
              recommendations.map((item, index) => (
                <div
                  key={item.coffee.slug}
                  className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                        Rank {index + 1}
                      </p>
                      <h3 className="mt-2 text-lg font-semibold">{item.coffee.name}</h3>
                    </div>
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                      {item.score} pts
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                    {item.coffee.origin_state} • {item.coffee.producer_name}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.reasons.map((reason) => (
                      <span
                        key={reason}
                        className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                      >
                        {reason}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{item.tastingCue}</p>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <Link
                      href={`/coffees/${item.coffee.slug}`}
                      className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:opacity-90"
                    >
                      Open coffee
                    </Link>
                    <Link
                      href={`/discover?query=${encodeURIComponent(item.coffee.name)}`}
                      className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
                    >
                      Search more
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Add more catalog data to surface recommendations here.
              </p>
            )}
          </div>
        </article>

        <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Flavor explanations</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Why these coffees fit</h2>
          {selectedCoffee ? (
            <div className="mt-5 grid gap-3">
              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Selected pick</p>
                <p className="mt-2 text-lg font-semibold">{selectedCoffee.name}</p>
                <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                  {selectedCoffee.tasting_notes || selectedCoffee.description || "Catalog copy is still sparse for this lot."}
                </p>
                <div className="mt-3 grid gap-2 text-sm leading-7 text-[var(--site-text-soft)]">
                  <p>Roast cue: {store.preferences.roast}</p>
                  <p>Process cue: {store.preferences.process}</p>
                  <p>Flavor cue: {store.preferences.flavor}</p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">What to taste for</p>
                <ul className="mt-3 grid gap-2 text-sm leading-7 text-[var(--site-text-soft)]">
                  <li>Look for origin clarity in the first sip.</li>
                  <li>Notice whether sweetness lands as caramel, sugar, or fruit.</li>
                  <li>Check whether the finish feels clean, rounded, or plush.</li>
                  <li>{recommendations[0]?.tastingCue ?? "Use the brew method that best matches the process."}</li>
                </ul>
              </div>

              <div className="rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Session summary</p>
                <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
                  {buildAssistantReply(
                    store.preferences,
                    draftPrompt,
                    recommendations
                  )}
                </p>
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-7 text-[var(--site-text-soft)]">
              Pick a coffee or submit a prompt to reveal a flavor explanation.
            </p>
          )}
        </article>
      </section>
    </div>
  );
}
