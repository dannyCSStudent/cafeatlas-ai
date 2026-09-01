import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const recipes = [
  {
    title: "Clarity pour-over",
    ratio: "1:16",
    grind: "Medium-fine",
    brew: "94 C water, 2:45 to 3:15 total time",
    note: "Best for bright coffees when you want structure and lift to stay visible.",
  },
  {
    title: "Balanced filter",
    ratio: "1:15.5",
    grind: "Medium",
    brew: "93 C water, 3:00 to 3:45 total time",
    note: "A steady starting point when you want sweetness and clarity in the same cup.",
  },
  {
    title: "Immersion build",
    ratio: "1:16.5",
    grind: "Medium-coarse",
    brew: "94 C water, 4:00 total time",
    note: "Useful when you want a rounder texture and a more forgiving extraction curve.",
  },
] as const;

const steps = [
  "Choose the flavor goal first.",
  "Lock the ratio and grind before changing anything else.",
  "Taste the cup, then move one variable at a time.",
  "Write down the change so the next brew starts with evidence, not memory.",
];

export default function BrewRecipesPage() {
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
            href="/learn/coffee-science"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Coffee science
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Recipe note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Brew recipes.</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                Three starting recipes for clarity, balance, and immersion brewing.
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
                href="/learn/brewing-equipment"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Equipment
              </Link>
              <Link
                href="/learn/seasonal-notes"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Seasonal notes
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this note covers</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Recipes turn the science into a repeatable starting point, then give you a safe place to iterate.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">A goal</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">One variable at a time</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {recipes.map((recipe) => (
            <article
              key={recipe.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{recipe.title}</p>
              <div className="mt-4 grid gap-3">
                <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Ratio</p>
                  <p className="mt-2 text-lg font-semibold">{recipe.ratio}</p>
                </div>
                <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Grind</p>
                  <p className="mt-2 text-lg font-semibold">{recipe.grind}</p>
                </div>
                <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Brew</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--site-text-soft)]">{recipe.brew}</p>
                </div>
              </div>
              <p className="mt-4 text-sm leading-7 text-[var(--site-text-soft)]">{recipe.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Recipe discipline</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              {steps.map((step) => (
                <p key={step}>{step}</p>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/coffee-science", label: "Coffee science" },
                { href: "/learn/brewing-equipment", label: "Equipment" },
                { href: "/learn/how-to-brew-for-clarity", label: "Brew clarity" },
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
              Recipes only work when they are treated as a starting point rather than a fixed rule.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
