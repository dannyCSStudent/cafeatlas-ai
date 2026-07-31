import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";

const steps = [
  {
    title: "Read the note as direction",
    body:
      "Words like citrus, cocoa, florals, or stone fruit are clues about what the cup may be emphasizing, not a rigid checklist.",
  },
  {
    title: "Separate structure from flavor",
    body:
      "Acidity, sweetness, and body describe how the coffee feels, while tasting notes describe what it resembles.",
  },
  {
    title: "Compare across coffees",
    body:
      "A note makes more sense when you compare it with another coffee from the same producer, farm, or process style.",
  },
  {
    title: "Bring it back to origin",
    body:
      "The best tasting note is one that leads you back to producer, farm, and process rather than ending at the label.",
  },
];

export default function TastingNotesGlossaryPage() {
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
            href="/about"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            About
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Glossary
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Tasting notes glossary.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                A short glossary for reading tasting language with less guesswork and more context.
              </p>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
                  Read 2 min
                </span>
                <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
                  Updated Jul 31, 2026
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Learn hub
              </Link>
              <Link
                href="/learn/how-to-read-a-coffee-profile"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Reading guide
              </Link>
              <Link
                href="/learn/seasonal-notes"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Seasonal notes
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">How to read it</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Treat tasting notes as a vocabulary layer, not a verdict. The cup still needs its origin context.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Lens</p>
                <p className="mt-2 text-base font-semibold">Language and structure</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Use with</p>
                <p className="mt-2 text-base font-semibold">Detail pages</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <article
              key={step.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Step {index + 1}</p>
              <h2 className="mt-3 text-xl font-semibold tracking-tight">{step.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{step.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">In practice</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                If a coffee says citrus and floral, that does not mean the cup tastes like juice. It means those are
                the reference points that help describe what stands out.
              </p>
              <p>
                The same note can read differently in a washed coffee than in a natural one, because structure and
                processing shape the final expression.
              </p>
              <p>
                Use the glossary to keep tasting language grounded, then move back to the detail page for the fuller
                story.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/how-to-read-a-coffee-profile", label: "Reading guide" },
                { href: "/learn/seasonal-notes", label: "Seasonal notes" },
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
              This glossary makes tasting language feel less like a wall of descriptors and more like a readable
              layer in the catalog.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
