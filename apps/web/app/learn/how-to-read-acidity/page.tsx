import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const steps = [
  {
    title: "Notice the lift",
    body: "Acidity often lands as the first bright impression. It can read as crisp, juicy, citrusy, or gently sparkling.",
  },
  {
    title: "Separate brightness from sharpness",
    body: "Good acidity supports the cup's structure. Harshness usually feels distracting or unbalanced.",
  },
  {
    title: "Read the texture around it",
    body: "Sweetness, body, and aftertaste show whether the acidity feels integrated or isolated.",
  },
  {
    title: "Compare across origins",
    body: "The shape of acidity becomes easier to hear when you move between coffees and keep origin context visible.",
  },
];

export default function HowToReadAcidityPage() {
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
            Sensory note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">How to read acidity.</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                This sensory note helps you hear brightness, lift, and structure without confusing acidity for
                sharpness.
              </p>
              <ArticleMeta className="mt-1" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/#featured"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Open featured coffees
              </Link>
              <Link
                href="/learn/how-to-taste-a-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Taste a coffee
              </Link>
              <Link
                href="/learn/how-to-compare-coffee-profiles"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-5 py-3 text-sm font-medium text-[var(--site-text-soft)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Compare coffees
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this note covers</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                The goal is to help acidity feel legible as part of structure, not as a trick word pasted onto flavor.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">Brightness</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">Texture and balance</p>
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
                Bright acidity often feels cleaner when sweetness and structure support it instead of fighting it.
              </p>
              <p>
                Think about whether the coffee feels lively, juicy, citrus-like, or crisp, then check how that feeling
                changes as the cup cools.
              </p>
              <p>
                The pattern becomes easier to recognize when you compare acidity across origins, roast levels, and
                processing styles.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/how-to-taste-a-coffee", label: "Taste a coffee" },
                { href: "/learn/how-to-compare-coffee-profiles", label: "Compare coffees" },
                { href: "/coffees", label: "Catalog" },
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
              This note gives the Learn section a direct way to read brightness and balance with more confidence.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
