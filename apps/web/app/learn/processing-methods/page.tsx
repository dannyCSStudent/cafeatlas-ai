import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const methods = [
  {
    title: "Washed",
    body:
      "Usually cleaner, more structured, and easier to read when you want origin clarity to stay in front of the cup.",
  },
  {
    title: "Honey",
    body:
      "Often sits between washed and natural with a rounder middle, a little more sweetness, and a softer texture.",
  },
  {
    title: "Natural",
    body:
      "Commonly more fruit-forward and textured, with a bigger finish that can feel plush or more expressive.",
  },
] as const;

const comparePoints = [
  {
    title: "Sweetness",
    body: "More fruit and residual sugars usually show up in natural and honey lots, but not always in the same way.",
  },
  {
    title: "Clarity",
    body: "Washed coffees often make structure easier to read because the fermentation and drying path is more transparent.",
  },
  {
    title: "Body",
    body: "Process can shift the cup toward silkier, rounder, or more concentrated textures.",
  },
  {
    title: "Catalog use",
    body: "Reading process side by side with farm and state helps keep the origin chain intact while you compare cups.",
  },
];

export default function ProcessingMethodsPage() {
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
            href="/learn/how-to-read-process"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Process note
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Processing note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Processing methods.</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                A deeper editorial note on washed, honey, and natural coffee processing.
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
                href="/learn/coffee-science"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Coffee science
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
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">How to read it</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Process tells you how the cup was handled after harvest, which changes structure before it ever reaches
                the roast.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">The method name</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">Structure and sweetness</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-3">
          {methods.map((method, index) => (
            <article
              key={method.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Method {index + 1}</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">{method.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{method.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {comparePoints.map((point) => (
            <article
              key={point.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <h2 className="text-xl font-semibold tracking-tight">{point.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{point.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">In practice</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                Process works best as a comparison tool. Read one method against another and see whether the difference
                is in clarity, sweetness, or texture.
              </p>
              <p>
                The catalog already keeps process visible on the coffee and producer pages, which makes it a useful
                starting point instead of a side note.
              </p>
              <p>
                Once you can name the method, you can start to predict the cup more accurately without flattening the
                coffee into a stereotype.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/how-to-read-process", label: "Process note" },
                { href: "/learn/coffee-science", label: "Coffee science" },
                { href: "/states", label: "States" },
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
              This note gives the Learn section a longer, more explicit place to read post-harvest methods.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
