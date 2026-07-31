import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";

const articles = [
  {
    href: "/learn/how-to-read-a-coffee-profile",
    title: "How to read a coffee profile",
    body:
      "A quick guide to the anatomy of a coffee detail page.",
    tag: "Reading guide",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/seasonal-notes",
    title: "Seasonal notes",
    body:
      "A companion note about freshness, rotation, and what changes in the cup.",
    tag: "Editorial note",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/tasting-notes-glossary",
    title: "Tasting notes glossary",
    body:
      "A short glossary for reading tasting language with less mystery.",
    tag: "Glossary",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
];

export default function LearnPage() {
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

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Learn the catalog, then keep following the story.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                This hub gathers the editorial pieces that explain how to read a coffee profile and how to think about
                change across seasons.
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
                Editorial pages for the project. Each article gives the catalog a slightly different reading mode,
                from profile anatomy to seasonal change and tasting language.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Articles</p>
                <p className="mt-2 text-base font-semibold">3 live pieces</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Focus</p>
                <p className="mt-2 text-base font-semibold">Origin, change, and language</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2">
          {articles.map((article) => (
            <article
              key={article.href}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{article.tag}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">{article.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{article.body}</p>
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
                  Read {article.readTime}
                </span>
                <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
                  Updated {article.updated}
                </span>
              </div>
              <Link
                href={article.href}
                className="mt-5 inline-flex rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:-translate-y-0.5"
              >
                Open article
              </Link>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">How to use this hub</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>Start with the reading guide if you want a quick tour of the detail page anatomy.</p>
              <p>Open seasonal notes if you want a different lens on rotation, freshness, and change over time.</p>
              <p>Use the catalog, producer, and farm pages as the live context around each article.</p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn/how-to-read-a-coffee-profile", label: "Reading guide" },
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
