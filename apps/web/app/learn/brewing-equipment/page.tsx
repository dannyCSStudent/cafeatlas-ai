import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ArticleMeta } from "@/components/article-meta";

const tools = [
  {
    title: "Grinder",
    body:
      "The grinder has the biggest day-to-day effect on cup quality because grind consistency controls how evenly water can extract the coffee.",
  },
  {
    title: "Scale",
    body:
      "A scale keeps the recipe honest and makes it possible to repeat a brew instead of guessing the ratio.",
  },
  {
    title: "Kettle",
    body:
      "A good kettle helps control pour rate and agitation, which matters when you want clarity or a more even extraction.",
  },
  {
    title: "Brewer",
    body:
      "Brewer shape changes contact time, flow, and texture, so the choice should match the cup style you want to highlight.",
  },
  {
    title: "Filters",
    body:
      "Paper, metal, and cloth filters each change body, clarity, and sediment in different ways.",
  },
  {
    title: "Water",
    body:
      "Water is part of the equipment conversation because the mineral profile can change how the cup tastes and feels.",
  },
] as const;

const priorities = [
  "Buy the grinder first if you are building a kit from scratch.",
  "Keep the scale and kettle stable so the recipe stays repeatable.",
  "Match the brewer to the style of coffee you drink most often.",
  "Treat water as part of the setup, not an afterthought.",
];

export default function BrewingEquipmentPage() {
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
            Equipment note
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-[var(--site-muted)]">
              CafeAtlas AI
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Brewing equipment.</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">
                A practical guide to the grinder, brewer, kettle, scale, and filter choices that matter.
              </p>
              <ArticleMeta className="mt-1" />
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/learn/coffee-science"
                className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
              >
                Coffee science
              </Link>
              <Link
                href="/learn/brew-methods-and-extraction"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Brew methods
              </Link>
              <Link
                href="/learn/how-to-store-coffee"
                className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
              >
                Store coffee
              </Link>
            </div>
          </div>

          <div className="flex flex-col justify-between gap-5 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5">
            <BrandBadge />
            <div className="space-y-3">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">What this note covers</p>
              <p className="text-sm leading-7 text-[var(--site-text-soft)]">
                Equipment is not just hardware. It is the set of choices that make the recipe repeatable.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Start with</p>
                <p className="mt-2 text-base font-semibold">Grinder</p>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Then</p>
                <p className="mt-2 text-base font-semibold">Scale and kettle</p>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <article
              key={tool.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur"
            >
              <h2 className="text-2xl font-semibold tracking-tight">{tool.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{tool.body}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] backdrop-blur">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Equipment priorities</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              {priorities.map((priority) => (
                <p key={priority}>{priority}</p>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Next links</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {[
                { href: "/learn", label: "Learn hub" },
                { href: "/learn/coffee-science", label: "Coffee science" },
                { href: "/learn/brew-recipes", label: "Recipes" },
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
              The right setup does not need to be expensive. It needs to be stable enough to learn from.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
