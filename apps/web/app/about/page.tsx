import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";

const pillars = [
  {
    title: "Origin is the point",
    body:
      "Coffees are presented with producer and farm context first, so the catalog reads like a map of where the cup comes from.",
  },
  {
    title: "Live data stays visible",
    body:
      "The catalog, origin pages, and detail screens all read from the same FastAPI backend, keeping the experience current.",
  },
  {
    title: "Editorial guides the route",
    body:
      "Landing pages and detail views now point toward the next relevant story instead of ending in a dead end.",
  },
];

const stack = [
  "Next.js storefront",
  "FastAPI catalog backend",
  "Expo mobile client",
  "SQLAlchemy + Alembic data layer",
  "Shared brand tokens",
];

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            About
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                What CafeAtlas is, and how the browsing experience is structured.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                CafeAtlas helps people move from the cup to the people, places, and processes behind it. This page
                explains the product model, while the homepage stays focused on live browsing.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Learn hub
              </Link>
              <Link
                href="/#featured"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Featured coffees
              </Link>
              <Link
                href="/producers"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Producers
              </Link>
              <Link
                href="/farms"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Farms
              </Link>
              <Link
                href="/learn/how-to-read-a-coffee-profile"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Reading guide
              </Link>
              <Link
                href="/learn/how-to-choose-a-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Choose a coffee
              </Link>
              <Link
                href="/learn/how-to-filter-the-catalog"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Filter catalog
              </Link>
              <Link
                href="/learn/seasonal-notes"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Seasonal notes
              </Link>
              <Link
                href="/learn/how-sourcing-works"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Sourcing note
              </Link>
              <Link
                href="/learn/how-to-compare-coffee-profiles"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Compare coffees
              </Link>
              <Link
                href="/learn/how-to-taste-a-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Taste a coffee
              </Link>
              <Link
                href="/learn/how-to-read-acidity"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Read acidity
              </Link>
              <Link
                href="/learn/how-to-store-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Store coffee
              </Link>
              <Link
                href="/about#how-it-works"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                How it works
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this page is for</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                It gives the project a single place to explain its purpose, the browsing model, and the stack that
                powers the experience without repeating the homepage pitch.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Live catalog</p>
                <p className="mt-2 text-base font-semibold">FastAPI</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Clients</p>
                <p className="mt-2 text-base font-semibold">Web + mobile</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {pillars.map((pillar) => (
            <article
              key={pillar.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{pillar.title}</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{pillar.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article
            id="how-it-works"
            className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur"
          >
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">How it works</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                The catalog is filtered, sorted, and paginated by the FastAPI backend, so browse paths reflect current
                data instead of fixtures.
              </p>
              <p>
                Coffee detail pages surface process, varietal, tasting notes, producer, and farm context together so
                the cup can be read as a story.
              </p>
              <p>
                Origin pages and landing-page spotlights keep the journey directional, with clear follow-up links to
                the next relevant page.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Stack</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {stack.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-[color:var(--site-inverse-foreground)]/10 px-3 py-1 text-xs font-medium text-[var(--site-inverse-muted)]"
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--site-inverse-muted)]">
              This page exists to give the brand a grounded narrative and a place to explain the platform without
              interrupting the browsing flow.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
