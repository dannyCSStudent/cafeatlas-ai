import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";

type EventCategory = "Coffee tasting" | "Virtual tour" | "Producer livestream";

type EventSession = {
  category: EventCategory;
  title: string;
  summary: string;
  startAt: string;
  duration: string;
  host: string;
  audience: string;
  href: string;
  cta: string;
  tags: string[];
  coffee?: CoffeeRead | null;
  imageUrl?: string | null;
};

const sessionSeeds: Array<{
  category: EventCategory;
  title: string;
  summary: string;
  daysAhead: number;
  hour: number;
  duration: string;
  audience: string;
  tags: string[];
  cta: string;
}> = [
  {
    category: "Coffee tasting",
    title: "Seasonal tasting circle",
    summary: "Compare two origin stories side by side and map sweetness, structure, and finish in real time.",
    daysAhead: 3,
    hour: 18,
    duration: "75 min",
    audience: "For curious tasters",
    tags: ["guided cupping", "brew notes", "live chat"],
    cta: "Open the coffee",
  },
  {
    category: "Virtual tour",
    title: "Origin walk-through",
    summary: "Follow a farm from drying patio to finished lot, with place-based context and production detail.",
    daysAhead: 5,
    hour: 12,
    duration: "45 min",
    audience: "For origin-first readers",
    tags: ["farm story", "process", "place"],
    cta: "Open the farm",
  },
  {
    category: "Producer livestream",
    title: "Producer conversation",
    summary: "Hear how the producer reads the harvest, selects lots, and decides what makes the final cut.",
    daysAhead: 7,
    hour: 19,
    duration: "60 min",
    audience: "For member Q&A",
    tags: ["producer Q&A", "harvest", "replay"],
    cta: "Open the producer",
  },
  {
    category: "Coffee tasting",
    title: "Method comparison clinic",
    summary: "Brew the same coffee two ways and compare extraction, clarity, and texture without guesswork.",
    daysAhead: 10,
    hour: 18,
    duration: "60 min",
    audience: "For home brewers",
    tags: ["pour over", "immersion", "recipe"],
    cta: "View the coffee",
  },
  {
    category: "Virtual tour",
    title: "Drying and milling tour",
    summary: "Trace how the lot moves after picking and where quality decisions are still being made.",
    daysAhead: 12,
    hour: 11,
    duration: "50 min",
    audience: "For process learners",
    tags: ["post-harvest", "quality", "traceability"],
    cta: "See the catalog",
  },
  {
    category: "Producer livestream",
    title: "Harvest recap live",
    summary: "A live debrief on the season, what changed in the field, and how that shaped the cup.",
    daysAhead: 14,
    hour: 17,
    duration: "45 min",
    audience: "For repeat viewers",
    tags: ["harvest recap", "field notes", "archive"],
    cta: "Open community",
  },
];

function formatSessionTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatSessionDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
  }).format(new Date(value));
}

function buildStartAt(daysAhead: number, hour: number) {
  const date = new Date();
  date.setDate(date.getDate() + daysAhead);
  date.setHours(hour, 0, 0, 0);
  return date.toISOString();
}

function buildEventHref(session: EventSession) {
  if (session.category === "Virtual tour") {
    return session.coffee?.farm?.slug ? `/farms/${session.coffee.farm.slug}` : session.coffee ? `/coffees/${session.coffee.slug}` : "/discover";
  }

  if (session.category === "Producer livestream") {
    return session.coffee?.producer?.slug ? `/producers/${session.coffee.producer.slug}` : session.coffee ? `/coffees/${session.coffee.slug}` : "/community";
  }

  return session.coffee ? `/coffees/${session.coffee.slug}` : "/coffees";
}

function buildEventSessions(coffees: CoffeeRead[]) {
  return sessionSeeds.map((seed, index) => {
    const coffee = coffees[index] ?? coffees[index % Math.max(coffees.length, 1)] ?? null;
    const title =
      seed.category === "Coffee tasting" && coffee
        ? `${seed.title} with ${coffee.name}`
        : seed.category === "Virtual tour" && coffee
          ? `${seed.title} with ${coffee.farm?.name ?? coffee.producer_name}`
          : seed.category === "Producer livestream" && coffee
            ? `${seed.title} with ${coffee.producer?.name ?? coffee.producer_name}`
            : seed.title;

    const session: EventSession = {
      category: seed.category,
      title,
      summary:
        coffee?.description?.trim() ||
        seed.summary ||
        "A curated event built from the catalog and the origin data already in the system.",
      startAt: buildStartAt(seed.daysAhead, seed.hour),
      duration: seed.duration,
      host:
        seed.category === "Producer livestream" && coffee
          ? coffee.producer?.name ?? coffee.producer_name
          : seed.category === "Virtual tour" && coffee
            ? coffee.farm?.name ?? coffee.producer_name
            : "CafeAtlas editorial team",
      audience: seed.audience,
      href: "#",
      cta: seed.cta,
      tags: seed.tags,
      coffee,
      imageUrl: coffee?.image_url ?? coffee?.images?.[0]?.image_url ?? null,
    };

    return {
      ...session,
      href: buildEventHref(session),
    };
  });
}

async function loadEventCoffees() {
  try {
    const page = await fetchCoffeeCatalog({ pageSize: 6, sort: "featured" });
    return { coffees: page.items, error: null as string | null };
  } catch (error) {
    return {
      coffees: [] as CoffeeRead[],
      error: error instanceof Error ? error.message : "Failed to load live catalog data.",
    };
  }
}

export const metadata: Metadata = {
  title: "Events | CafeAtlas AI",
  description: "Coffee tastings, virtual tours, and producer livestreams in one event platform.",
};

export default async function EventsPage() {
  const { coffees, error } = await loadEventCoffees();
  const sessions = buildEventSessions(coffees);
  const featuredSession = sessions[0];
  const tastingSessions = sessions.filter((session) => session.category === "Coffee tasting");
  const tourSessions = sessions.filter((session) => session.category === "Virtual tour");
  const livestreamSessions = sessions.filter((session) => session.category === "Producer livestream");

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
            href="/community"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Community
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            Events platform
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.5rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(48,27,15,0.98),rgba(121,79,41,0.95))] p-6 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:grid-cols-[1.06fr_0.94fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Live sessions
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Coffee tastings, virtual tours, and producer livestreams.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/82">
                A single event platform for discovery, education, and live origin context. The structure is ready for
                RSVP flows, reminders, and replay archives as soon as the backend catches up.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/community"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
              >
                Join the community
              </Link>
              <Link
                href="/club"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Coffee club
              </Link>
              <Link
                href="/coffees"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Browse coffees
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-[1.75rem] border border-white/10 bg-white/8 p-5 backdrop-blur">
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Sessions</p>
                <p className="mt-2 text-2xl font-semibold">{sessions.length}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Tracks</p>
                <p className="mt-2 text-2xl font-semibold">3</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Live coffees</p>
                <p className="mt-2 text-2xl font-semibold">{coffees.length}</p>
              </article>
            </div>
            <p className="text-sm leading-7 text-white/78">
              {error
                ? `Live catalog data could not be loaded, so the page is showing editorial event previews. ${error}`
                : "The sessions are seeded from live catalog data when available, which keeps the event platform tied to real coffees and origin records."}
            </p>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <article className="overflow-hidden rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <div className="relative aspect-[4/3] bg-[var(--site-surface-soft)]">
              {featuredSession.imageUrl ? (
                <Image
                  src={featuredSession.imageUrl}
                  alt={featuredSession.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(240,220,196,0.6))] px-8 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Featured session</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight text-[var(--foreground)]">
                      {featuredSession.title}
                    </p>
                    <p className="mt-2 text-sm text-[var(--site-text-soft)]">
                      Visuals will appear here once the catalog has an image URL to attach.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                <span>{featuredSession.category}</span>
                <span>•</span>
                <span>{formatSessionDate(featuredSession.startAt)}</span>
                <span>•</span>
                <span>{featuredSession.duration}</span>
              </div>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight">{featuredSession.title}</h2>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-[var(--site-text-soft)]">{featuredSession.summary}</p>
              <div className="mt-5 flex flex-wrap gap-2">
                {featuredSession.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href={featuredSession.href}
                  className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                >
                  {featuredSession.cta}
                </Link>
                <Link
                  href="/journal"
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Read the guide
                </Link>
              </div>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">What the platform covers</p>
            <div className="mt-4 space-y-4">
              {[
                {
                  title: "Coffee tastings",
                  body: "Structured cupping sessions that make flavor, roast, and brew method easier to compare.",
                  href: "/community",
                },
                {
                  title: "Virtual tours",
                  body: "Farm and mill walkthroughs that preserve the origin story even when the session is remote.",
                  href: "/farms",
                },
                {
                  title: "Producer livestreams",
                  body: "Live conversations that keep the producer visible and create a replay path for members.",
                  href: "/producers",
                },
              ].map((item) => (
                <Link
                  key={item.title}
                  href={item.href}
                  className="block rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-5 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
                >
                  <div className="text-sm font-semibold">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{item.body}</p>
                </Link>
              ))}
            </div>

            <div className="mt-6 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Next step</p>
              <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
                RSVP, reminders, and replay storage can slot into this layout without changing the structure. The
                product already knows how to render coffee, producer, and farm context.
              </p>
            </div>
          </article>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {[
            { title: "Coffee tastings", sessions: tastingSessions },
            { title: "Virtual tours", sessions: tourSessions },
            { title: "Producer livestreams", sessions: livestreamSessions },
          ].map((track) => (
            <article
              key={track.title}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Track</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight">{track.title}</h2>
                </div>
                <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-semibold text-[var(--site-text-soft)]">
                  {track.sessions.length}
                </span>
              </div>

              <div className="mt-4 space-y-3">
                {track.sessions.map((session) => (
                  <Link
                    key={`${session.category}-${session.title}`}
                    href={session.href}
                    className="block rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4 transition hover:border-[var(--site-accent)] hover:bg-[var(--site-surface-hover)]"
                  >
                    <div className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                      {session.category}
                    </div>
                    <div className="mt-2 text-sm font-semibold">{session.title}</div>
                    <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{formatSessionTime(session.startAt)}</p>
                    <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">{session.summary}</p>
                  </Link>
                ))}
              </div>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.96fr_1.04fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Session design</p>
            <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
              <p>Every event is anchored to a coffee, a producer, or a farm so the live experience stays traceable.</p>
              <p>That keeps the event platform aligned with the rest of the site: origin first, editorial second, commerce later.</p>
              <p>When RSVP and replay data arrive, this page can become the schedule surface without changing the information model.</p>
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
            <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Platform outlook</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">What comes next</h2>
            <div className="mt-4 space-y-3">
              {[
                "RSVP and waitlist data wired to the account area.",
                "Reminder emails tied to the signed-in Supabase session.",
                "Replay archives and session notes attached to community posts.",
                "Host tools for producers, farms, and editorial tastings.",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4 text-sm leading-7 text-[var(--site-inverse-muted)]"
                >
                  {item}
                </div>
              ))}
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
