import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const principles = [
  {
    title: "Extraction",
    body:
      "Coffee science starts with what dissolves into the cup. Grind size, contact time, and temperature all change that outcome.",
  },
  {
    title: "Water",
    body:
      "Water is not neutral. Mineral balance and temperature influence how clearly sweetness, acidity, and structure show up.",
  },
  {
    title: "Surface area",
    body:
      "A finer grind gives water more surface to work with, which can increase extraction but also push the cup toward bitterness if it goes too far.",
  },
  {
    title: "Consistency",
    body:
      "The best learning comes from changing one variable at a time so the result still tells you something useful.",
  },
];

const labNotes = [
  {
    title: "Grind",
    body: "Use grind as the first lever when the cup is too thin, too slow, or too heavy.",
  },
  {
    title: "Temperature",
    body: "Higher heat can unlock more extraction, while lower heat often softens intensity and structure.",
  },
  {
    title: "Contact time",
    body: "Longer contact usually pushes extraction higher, but the useful range depends on brew method and roast.",
  },
];

export default function CoffeeSciencePage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/learn"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to learn hub
          </Link>
          <Link
            href="/learn/brew-recipes"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Recipes
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Science note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Coffee science.</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                A grounded look at extraction, water, and the variables that shape the cup.
              </p>
              <ArticleMeta className="mt-1" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn/how-to-brew-for-clarity"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Brew clarity
              </Link>
              <Link
                href="/learn/how-to-read-process"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Process note
              </Link>
              <Link
                href="/learn/tasting-notes-glossary"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Glossary
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this note covers</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                The page keeps the science practical so the catalog still feels readable instead of technical.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">Extraction</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">Water and grind</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {principles.map((principle, index) => (
            <article
              key={principle.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Principle {index + 1}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{principle.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{principle.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">In practice</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                If a coffee tastes thin, the first questions are usually about grind, ratio, and brew time before you
                blame the bean itself.
              </p>
              <p>
                If the cup feels muddy or heavy, the answer often lives in the same variables, only in the opposite
                direction.
              </p>
              <p>
                The point of coffee science is not to make the experience clinical. It is to give you a repeatable way
                to learn from the cup.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Lab notes</p>
            <div className="mt-4 grid gap-3">
              {labNotes.map((note) => (
                <div key={note.title} className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4">
                  <p className="text-sm font-semibold">{note.title}</p>
                  <p className="mt-1 text-sm leading-6 text-[var(--site-inverse-muted)]">{note.body}</p>
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
