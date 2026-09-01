import type { Metadata } from "next";
import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";

const giftBoxes = [
  {
    name: "Holiday Pair",
    price: "$58",
    description: "Two coffees with a seasonal note card and festive packaging.",
    highlights: ["2 coffees", "Gift wrap", "Personal note"],
  },
  {
    name: "Office Tasting Set",
    price: "$132",
    description: "A four-bag tasting box designed for teams, client gifts, and shared sampling.",
    highlights: ["4 coffees", "Bulk pricing", "Ships to one address"],
  },
  {
    name: "Reserve Gift Box",
    price: "$96",
    description: "A premium box for memorable gifts, limited lots, and a more detailed origin story.",
    highlights: ["Limited lots", "Origin cards", "Handwritten insert"],
  },
] as const;

const giftTypes = [
  {
    title: "Holiday boxes",
    body:
      "Seasonal gifting with warm packaging, a card insert, and a box format that reads as premium without feeling fussy.",
  },
  {
    title: "Corporate gifts",
    body:
      "A clear lane for client gifts, team milestones, thank-you boxes, and other bulk orders that need consistency.",
  },
  {
    title: "Personalized notes",
    body:
      "Every box can carry a short message, so the gift feels specific instead of generic.",
  },
  {
    title: "Bulk purchasing",
    body:
      "The platform is designed to scale from one gift to a small campaign or a larger team shipment.",
  },
] as const;

const giftSteps = [
  "Choose a box or start from a budget.",
  "Add the note card text or brand message.",
  "Pick the delivery window and destination list.",
  "Confirm the order or request a quote for larger runs.",
];

export const metadata: Metadata = {
  title: "Gift Boxes | CafeAtlas AI",
  description: "Holiday boxes, corporate gifts, personalized notes, and bulk coffee orders.",
};

export default function GiftsPage() {
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
            href="/club"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Coffee club
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Gift platform
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.5rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(108,70,35,0.95))] p-6 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:grid-cols-[1.06fr_0.94fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Gift boxes
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">Gift boxes.</h1>
              <p className="max-w-2xl text-lg leading-8 text-white/82">
                Holiday boxes, corporate gifts, personalized notes, and bulk purchasing, all framed as a premium
                coffee gifting lane.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/club"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
              >
                Monthly club
              </Link>
              <Link
                href="/account"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Account
              </Link>
              <Link
                href="/learn/how-to-choose-a-coffee"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Choose a coffee
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <BrandBadge />
            <div className="grid gap-3 sm:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Holiday</p>
                <p className="mt-2 text-2xl font-semibold">Ready</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Corporate</p>
                <p className="mt-2 text-2xl font-semibold">Scaffolded</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Notes</p>
                <p className="mt-2 text-2xl font-semibold">Personalized</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Bulk</p>
                <p className="mt-2 text-2xl font-semibold">Supported</p>
              </article>
            </div>
            <p className="text-sm leading-7 text-white/78">
              The platform shape is live. Checkout and fulfillment hooks can be added later without changing the
              surface model.
            </p>
          </div>
        </header>

        <section className="grid gap-4 lg:grid-cols-3">
          {giftBoxes.map((box, index) => (
            <article
              key={box.name}
              className={`rounded-[1.75rem] border p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] ${
                index === 1
                  ? "border-[var(--site-accent)] bg-[var(--site-surface-card)]"
                  : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)]"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Gift box</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{box.name}</h2>
                </div>
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                  {box.price}
                </span>
              </div>

              <p className="mt-4 text-sm leading-7 text-[var(--site-text-soft)]">{box.description}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {box.highlights.map((highlight) => (
                  <span
                    key={highlight}
                    className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                  >
                    {highlight}
                  </span>
                ))}
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href="/account"
                  className="rounded-full bg-[var(--site-accent)] px-4 py-2 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                >
                  Request gift
                </Link>
                <Link
                  href="/club"
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Club
                </Link>
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.92fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Gift types</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {giftTypes.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-base font-semibold">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{item.body}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Order flow</p>
            <div className="mt-4 space-y-3">
              {giftSteps.map((step, index) => (
                <div key={step} className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Step {index + 1}</p>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-inverse-muted)]">{step}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--site-inverse-muted)]">
              Bulk orders can later connect to quoting and fulfillment without changing the page structure.
            </p>
          </article>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Personalized notes</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>
                Add a short note card to make a gift feel specific to the person, the team, or the occasion.
              </p>
              <p>
                The note can reference the producer, the origin state, or the reason the box was chosen.
              </p>
              <p>
                This keeps the gift tied to the catalog story instead of turning it into generic merchandise.
              </p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Bulk purchasing</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {[
                { label: "Small", value: "5-10 boxes" },
                { label: "Team", value: "10-50 boxes" },
                { label: "Campaign", value: "50+ boxes" },
              ].map((tier) => (
                <div key={tier.label} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">{tier.label}</p>
                  <p className="mt-2 text-lg font-semibold">{tier.value}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-[var(--site-text-soft)]">
              These tiers are a starting point for quote generation, not a hard limit.
            </p>
          </article>
        </section>
      </section>
    </main>
  );
}
