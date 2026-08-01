"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { BrandBadge } from "@/components/brand-badge";
import { LEARN_ARTICLES, LEARN_FILTERS, LEARN_RECOMMENDED_ORDER } from "@repo/ui/learn";

import { LearnArticleCard } from "@/components/learn-article-card";

type LearnFilter = (typeof LEARN_FILTERS)[number];
type LearnSortMode = "recommended" | "latest";

function parseFilter(value: string | null): LearnFilter {
  return LEARN_FILTERS.includes(value as LearnFilter) ? (value as LearnFilter) : "All";
}

function parseSortMode(value: string | null): LearnSortMode {
  return value === "latest" ? "latest" : "recommended";
}

export function LearnHubClient() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFilter = parseFilter(searchParams.get("filter"));
  const sortMode = parseSortMode(searchParams.get("sort"));
  const filteredArticles = useMemo(
    () => (activeFilter === "All" ? LEARN_ARTICLES : LEARN_ARTICLES.filter((article) => article.tag === activeFilter)),
    [activeFilter]
  );
  const displayedArticles = useMemo(
    () => (sortMode === "recommended" ? filteredArticles : [...filteredArticles].reverse()),
    [filteredArticles, sortMode]
  );

  function updateRoute(next: { filter?: LearnFilter; sort?: LearnSortMode }) {
    const query = new URLSearchParams();
    const filter = next.filter ?? activeFilter;
    const nextSort = next.sort ?? sortMode;

    if (filter !== "All") query.set("filter", filter);
    if (nextSort !== "recommended") query.set("sort", nextSort);

    router.replace(query.toString() ? `${pathname}?${query.toString()}` : pathname);
  }

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            About
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Learn hub
          </span>
        </div>

        <header className="grid gap-6 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-7">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Learn the catalog, then keep following the story.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                This hub gathers the editorial pieces that explain coffee profiles, seasonal change, brew language,
                and roast balance.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn/how-to-read-a-coffee-profile"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Reading guide
              </Link>
              <Link
                href="/learn/how-sourcing-works"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Sourcing note
              </Link>
              <Link
                href="/learn/how-to-compare-coffee-profiles"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Compare coffees
              </Link>
              <Link
                href="/learn/how-to-taste-a-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Taste a coffee
              </Link>
              <Link
                href="/learn/seasonal-notes"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Seasonal notes
              </Link>
              <Link
                href="/about"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                About the project
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What lives here</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Editorial pages for the project. Each article gives the catalog a different reading mode, from
                profile anatomy to seasonal change and tasting language.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Articles</p>
                <p className="mt-2 text-base font-semibold">{LEARN_ARTICLES.length} live pieces</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Focus</p>
                <p className="mt-2 text-base font-semibold">
                  Origin, sourcing, comparison, tasting, change, language, brew, and roast
                </p>
              </div>
            </div>
          </div>
        </header>

        <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur lg:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Filter articles</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Filter by topic, then open the article that matches the reading mode you want.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <div className="flex flex-wrap gap-2">
                {LEARN_FILTERS.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => updateRoute({ filter: item })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      item === activeFilter
                        ? "border-[var(--site-border)] bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]"
                        : "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)] hover:bg-[var(--site-surface-hover)]"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  { label: "Recommended", value: "recommended" as const },
                  { label: "Latest", value: "latest" as const },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => updateRoute({ sort: item.value })}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      item.value === sortMode
                        ? "border-[var(--site-border)] bg-[var(--site-accent)] text-[var(--site-accent-foreground)]"
                        : "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)] hover:bg-[var(--site-surface-hover)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid gap-3 md:grid-cols-2">
          {displayedArticles.map((article, index) => (
            <LearnArticleCard key={article.href} article={article} rank={String(index + 1).padStart(2, "0")} />
          ))}
        </section>

        <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur lg:p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-2xl">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Recommended order</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                Start with the reading guide, then the sourcing note, then the comparison note, then the sensory
                note. That gives you the shortest path from structure to origin, comparison, tasting, change, and
                extraction.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {LEARN_RECOMMENDED_ORDER.map((item, index) => (
                <span
                  key={item}
                  className={`rounded-full border px-3 py-1 text-xs font-medium ${
                    index === 0
                      ? "border-[var(--site-border)] bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]"
                      : "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Browse cues</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>Start with the reading guide for the shortest path into the detail pages.</p>
              <p>Open seasonal notes for rotation, freshness, and change over time.</p>
              <p>Use the catalog, producer, and farm pages as the live context around each article.</p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-5 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn/how-to-read-a-coffee-profile", label: "Reading guide" },
                { href: "/learn/how-sourcing-works", label: "Sourcing note" },
                { href: "/learn/how-to-compare-coffee-profiles", label: "Compare coffees" },
                { href: "/learn/how-to-taste-a-coffee", label: "Taste a coffee" },
                { href: "/learn/seasonal-notes", label: "Seasonal notes" },
                { href: "/about", label: "About" },
                { href: "/", label: "Catalog" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full bg-[color:var(--site-inverse-foreground)]/10 px-3 py-1 text-xs font-medium text-[var(--site-inverse-muted)] transition hover:bg-[color:var(--site-inverse-foreground)]/18"
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--site-inverse-muted)]">
              The hub keeps editorial content in one place while still tying every article back to the live catalog.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
