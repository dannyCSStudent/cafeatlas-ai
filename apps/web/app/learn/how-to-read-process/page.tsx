import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const notes = [
  {
    title: "Start with the process label",
    body:
      "Washed, natural, and honey are the quickest cues for how the coffee was handled after harvest.",
  },
  {
    title: "Translate it into structure",
    body:
      "Process often changes sweetness, body, clarity, and the way acidity shows up in the cup.",
  },
  {
    title: "Separate process from flavor",
    body:
      "A natural coffee is not automatically fruit-heavy, and a washed coffee is not automatically light or clean.",
  },
  {
    title: "Compare within the same origin",
    body:
      "Reading two coffees from the same place makes process easier to hear because the origin context stays constant.",
  },
];

export default function ReadProcessPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/learn"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to Learn
          </Link>
          <Link
            href="/about"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            About
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Origin note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                How to read process.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                This note explains how washed, natural, and honey processing show up as cues in the coffee profile.
              </p>
              <ArticleMeta className="mt-1" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn/how-sourcing-works"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Sourcing note
              </Link>
              <Link
                href="/learn/how-to-taste-a-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Taste a coffee
              </Link>
              <Link
                href="/learn/how-to-read-a-coffee-profile"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Reading guide
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this note covers</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                The goal is to make process feel like a useful read on the profile instead of a technical afterthought.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">Process label</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">Structure and origin</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {notes.map((note, index) => (
            <article
              key={note.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Step {index + 1}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{note.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{note.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">In practice</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                A washed coffee may feel clearer or more structured, while a natural lot can feel broader, fruitier, or
                more expressive, but that relationship is never automatic.
              </p>
              <p>
                The useful move is to ask how the process changes the cup&apos;s texture, sweetness, and clarity, then
                compare against another coffee from the same origin.
              </p>
              <p>
                That keeps the note grounded in the profile instead of turning it into a rule.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/how-sourcing-works", label: "Sourcing note" },
                { href: "/learn/how-to-read-a-coffee-profile", label: "Reading guide" },
                { href: "/learn/how-to-compare-coffee-profiles", label: "Compare coffees" },
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
              This note gives the Learn section another origin cue that helps explain the catalog without flattening it.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
