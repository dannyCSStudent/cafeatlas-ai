import type { Metadata } from "next";
import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { NewsletterSignupForm } from "@/components/newsletter-signup-form";

const plans = [
  {
    name: "Seasonal Box",
    price: "$29",
    cadence: "Monthly",
    description: "A rotating two-bag box focused on accessible, high-signal coffees from the current catalog.",
    perks: ["2 coffees", "Roaster notes", "Seasonal rotation"],
  },
  {
    name: "Origin Club",
    price: "$49",
    cadence: "Monthly",
    description: "A deeper box for origin-first drinkers who want to follow producers, farms, and state stories.",
    perks: ["3 coffees", "Origin cards", "Priority access"],
  },
  {
    name: "Reserve Club",
    price: "$79",
    cadence: "Monthly",
    description: "The premium lane for limited lots, more detailed provenance notes, and a higher reward rate.",
    perks: ["4 coffees", "Limited lots", "Member rewards"],
  },
] as const;

const schedule = [
  {
    title: "Week 1",
    body: "Curation closes and the month’s selection is finalized against live inventory and freshness.",
  },
  {
    title: "Week 2",
    body: "Boxes are packed, notes are prepared, and members can preview the upcoming lineup in the account area.",
  },
  {
    title: "Week 3",
    body: "Shipments leave the roaster, with delivery windows tuned to the region and fulfillment capacity.",
  },
  {
    title: "Week 4",
    body: "Members compare the box, log favorites, and feed the flavor memory system for the next selection.",
  },
];

const rewards = [
  "Collect club points on every shipment.",
  "Unlock early access to limited lots.",
  "Use member history to guide future curation.",
  "Carry club status into the account dashboard.",
];

export const metadata: Metadata = {
  title: "Coffee Club | CafeAtlas AI",
  description: "Monthly coffee subscription with curated boxes, delivery schedule, and member rewards.",
};

export default function ClubPage() {
  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-7xl flex-col gap-8">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to catalog
          </Link>
          <Link
            href="/account"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Account
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Coffee club
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.5rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(58,34,18,0.98),rgba(118,76,39,0.95))] p-6 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:grid-cols-[1.06fr_0.94fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Monthly subscription
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Coffee club.</h1>
              <p className="max-w-2xl text-lg leading-8 text-white/82">
                Curated monthly boxes built from live catalog data, with delivery cadence, reward tiers, and member
                history ready to connect to billing when commerce lands.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/account"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
              >
                Open account
              </Link>
              <Link
                href="/learn/seasonal-notes"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Seasonal notes
              </Link>
              <Link
                href="/recommendations"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Recommendations
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <BrandBadge />
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Cadence</p>
                <p className="mt-2 text-2xl font-semibold">Monthly</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Delivery</p>
                <p className="mt-2 text-2xl font-semibold">Tracked</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Rewards</p>
                <p className="mt-2 text-2xl font-semibold">Enabled</p>
              </article>
            </div>
            <p className="text-sm leading-7 text-white/78">
              Billing is scaffolded, not live. This page defines the product shape and the customer journey first.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <article
              key={plan.name}
              className={`rounded-[1.75rem] border p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] ${
                index === 1
                  ? "border-[var(--site-accent)] bg-[var(--site-surface-card)]"
                  : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{plan.cadence}</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{plan.name}</h2>
                </div>
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                  {plan.price}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--site-text-soft)]">{plan.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {plan.perks.map((perk) => (
                  <span
                    key={perk}
                    className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                  >
                    {perk}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                >
                  Choose plan
                </Link>
                <Link
                  href="/learn/how-to-choose-a-coffee"
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Learn more
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Delivery schedule</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {schedule.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Rewards</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">What members unlock</h2>
            <div className="mt-4 space-y-3">
              {rewards.map((reward) => (
                <div key={reward} className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4 text-sm leading-7 text-[var(--site-inverse-muted)]">
                  {reward}
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--site-inverse-muted)]">
              Rewards are designed to extend the catalog experience, not replace it. They should make each delivery
              easier to follow and easier to remember.
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Why the club exists</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                The club gives CafeAtlas a recurring format for curating coffee instead of leaving each purchase fully
                one-off.
              </p>
              <p>
                That format can later connect to billing, shipping, and points while preserving the origin-first story
                the rest of the product already uses.
              </p>
              <p>
                For now, the page is a careful scaffold: the product, the cadence, and the member journey are visible
                even before checkout ships.
              </p>
            </div>
          </article>

          <NewsletterSignupForm />
        </section>
      </section>
    </main>
  );
}
