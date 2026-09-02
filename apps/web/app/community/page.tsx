import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { StatusPanel } from "@/components/status-panel";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";

type CommunityReview = {
  title: string;
  reviewer: string;
  rating: number;
  body: string;
  origin: string;
  imageUrl: string | null;
  notes: string[];
};

type CommunityQuestion = {
  question: string;
  answer: string;
  tag: string;
};

type ModerationItem = {
  title: string;
  detail: string;
  status: "Open" | "Needs review" | "Resolved";
};

function splitNotes(value?: string | null) {
  return value
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 3) ?? [];
}

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function buildReviewCards(coffees: CoffeeRead[]): CommunityReview[] {
  const fallback: CommunityReview[] = [
    {
      title: "Bright and structured",
      reviewer: "Alicia",
      rating: 5,
      body: "This reads clean and precise, with enough sweetness to keep the acidity balanced.",
      origin: "Oaxaca · Community preview",
      imageUrl: null,
      notes: ["citrus", "clean finish", "sweetness"],
    },
    {
      title: "Round and layered",
      reviewer: "Marco",
      rating: 4,
      body: "A fuller middle and a softer texture make it easy to revisit in more than one brew method.",
      origin: "Chiapas · Community preview",
      imageUrl: null,
      notes: ["caramel", "round body", "layered"],
    },
    {
      title: "Fruit-forward",
      reviewer: "Sofia",
      rating: 5,
      body: "The fruit notes are clear without losing structure, which makes the cup feel vivid but not loud.",
      origin: "Veracruz · Community preview",
      imageUrl: null,
      notes: ["berry", "juicy", "vivid"],
    },
    {
      title: "Balanced and calm",
      reviewer: "Nora",
      rating: 4,
      body: "It is the kind of coffee that rewards a steady brew recipe more than a dramatic one.",
      origin: "Community preview",
      imageUrl: null,
      notes: ["balanced", "steady", "repeatable"],
    },
  ];

  return fallback.map((seed, index) => {
    const coffee = coffees[index];
    if (!coffee) {
      return seed;
    }

    return {
      title: coffee.name,
      reviewer: ["Alicia", "Marco", "Sofia", "Nora"][index] ?? "Reader",
      rating: [5, 4, 5, 4][index] ?? 4,
      body:
        coffee.description ||
        "A community preview anchored to a live catalog coffee until user-submitted reviews are connected.",
      origin: `${coffee.origin_state} · ${coffee.producer?.name ?? coffee.producer_name}`,
      imageUrl: coffee.image_url ?? coffee.images?.[0]?.image_url ?? null,
      notes: splitNotes(coffee.tasting_notes),
    };
  });
}

function buildRatingCounts(reviews: CommunityReview[]) {
  return [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: reviews.filter((review) => review.rating === rating).length,
  }));
}

function formatAverage(reviews: CommunityReview[]) {
  if (!reviews.length) {
    return "0.0";
  }

  const total = reviews.reduce((sum, review) => sum + review.rating, 0);
  return (total / reviews.length).toFixed(1);
}

async function loadCommunityCoffees() {
  try {
    return { coffees: (await fetchCoffeeCatalog({ pageSize: 4, sort: "featured" })).items, error: null };
  } catch (error) {
    return {
      coffees: [] as CoffeeRead[],
      error: error instanceof Error ? error.message : "Failed to load live coffees.",
    };
  }
}

const questions: CommunityQuestion[] = [
  {
    question: "What should I taste first in a new coffee?",
    answer:
      "Start with structure, sweetness, and finish before zooming in on the notes. The note words make more sense after that first read.",
    tag: "Tasting",
  },
  {
    question: "How do I compare two coffees from the same state?",
    answer:
      "Hold the origin steady and compare producer, process, and roast instead. That makes the cup differences easier to hear.",
    tag: "Comparison",
  },
  {
    question: "How do I know if a review is useful?",
    answer:
      "A useful review says what the coffee felt like, what method was used, and what changed when the cup was revisited.",
    tag: "Reviewing",
  },
];

const moderationQueue: ModerationItem[] = [
  {
    title: "Photo moderation",
    detail: "Check gallery uploads for relevant coffee imagery and remove duplicates or off-topic shots.",
    status: "Open",
  },
  {
    title: "Review flags",
    detail: "Review a flagged note that needs a human pass before it can be shown in the feed.",
    status: "Needs review",
  },
  {
    title: "Duplicate question",
    detail: "Merge repeated tasting questions into the existing answer thread.",
    status: "Resolved",
  },
];

export const metadata: Metadata = {
  title: "Community | CafeAtlas AI",
  description: "Reviews, ratings, photos, questions, answers, and moderation for the coffee community.",
};

export default async function CommunityPage() {
  const { coffees, error } = await loadCommunityCoffees();
  const reviewCards = buildReviewCards(coffees);
  const ratingCounts = buildRatingCounts(reviewCards);
  const featuredCoffee = coffees[0] ?? null;
  const averageRating = formatAverage(reviewCards);
  const photoCards = reviewCards.filter((card) => card.imageUrl);

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
            Community
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.5rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(60,35,19,0.98),rgba(112,72,37,0.95))] p-6 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:grid-cols-[1.05fr_0.95fr] lg:p-8">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white/70">
              Community features
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
                Reviews, ratings, photos, and answers.
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-white/82">
                A public community layer for the catalog, with moderation scaffolding built in so the experience can
                grow without losing trust.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/journal"
                className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-[var(--site-inverse)] transition hover:opacity-90"
              >
                Journal
              </Link>
              <Link
                href="/club"
                className="rounded-full border border-white/16 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
              >
                Club
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
            <div className="grid gap-3 sm:grid-cols-3">
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Avg rating</p>
                <p className="mt-2 text-2xl font-semibold">{averageRating}/5</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Reviews</p>
                <p className="mt-2 text-2xl font-semibold">{reviewCards.length}</p>
              </article>
              <article className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-xs uppercase tracking-[0.22em] text-white/60">Photos</p>
                <p className="mt-2 text-2xl font-semibold">{photoCards.length}</p>
              </article>
            </div>
            <p className="text-sm leading-7 text-white/78">
              {featuredCoffee
                ? `Live catalog data is being used to seed the preview feed with ${featuredCoffee.name}.`
                : "The preview feed falls back to editorial sample content if the live catalog is unavailable."}
            </p>
          </div>
        </header>

        {error ? (
          <StatusPanel
            title="Community preview is using fallback content."
            message={error}
            tone="empty"
          />
        ) : null}

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Reviews", value: reviewCards.length, note: "Written reactions to live coffees." },
            { label: "Ratings", value: ratingCounts.reduce((sum, item) => sum + item.count, 0), note: "Star scores in the feed." },
            { label: "Photos", value: photoCards.length, note: "Image-driven community posts." },
            { label: "Questions", value: questions.length, note: "Reader questions ready for answers." },
          ].map((metric) => (
            <article
              key={metric.label}
              className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]"
            >
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{metric.label}</p>
              <p className="mt-3 text-3xl font-semibold">{metric.value}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{metric.note}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Reviews</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Reader reactions</h2>
              </div>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                Preview feed
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {reviewCards.map((review) => (
                <article key={`${review.title}-${review.reviewer}`} className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <div className="flex items-start gap-4">
                    <div className="relative h-20 w-20 overflow-hidden rounded-2xl bg-[var(--site-surface-soft)]">
                      {review.imageUrl ? (
                        <Image
                          src={review.imageUrl}
                          alt={`${review.title} artwork`}
                          fill
                          sizes="80px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),rgba(240,220,196,0.7))] text-lg font-semibold">
                          {buildMonogram(review.title)}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold tracking-tight">{review.title}</h3>
                          <p className="mt-1 text-sm text-[var(--site-text-soft)]">{review.origin}</p>
                        </div>
                        <span className="rounded-full bg-[var(--site-accent)] px-3 py-1 text-xs font-semibold text-[var(--site-accent-foreground)]">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{review.body}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {review.notes.map((note) => (
                          <span
                            key={note}
                            className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]"
                          >
                            {note}
                          </span>
                        ))}
                      </div>
                      <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">
                        Reviewed by {review.reviewer}
                      </p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </article>

          <aside className="grid gap-4">
            <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Ratings</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight">Distribution</h2>
              <div className="mt-5 space-y-3">
                {ratingCounts.map((item) => {
                  const max = Math.max(...ratingCounts.map((entry) => entry.count), 1);
                  const width = `${Math.max((item.count / max) * 100, item.count > 0 ? 12 : 6)}%`;

                  return (
                    <div key={item.rating} className="flex items-center gap-3">
                      <span className="w-10 text-sm font-semibold">{item.rating}★</span>
                      <div className="h-3 flex-1 overflow-hidden rounded-full bg-[var(--site-surface-soft)]">
                        <div className="h-full rounded-full bg-[var(--site-accent)]" style={{ width }} />
                      </div>
                      <span className="w-8 text-right text-sm text-[var(--site-text-soft)]">{item.count}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-sm leading-7 text-[var(--site-text-soft)]">
                Ratings will eventually come from the community feed. For now, this panel shows the structure the
                product will use.
              </p>
            </article>

            <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Questions and answers</p>
              <div className="mt-4 space-y-3">
                {questions.map((item) => (
                  <div key={item.question} className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">{item.tag}</p>
                    <p className="mt-2 text-sm font-semibold">{item.question}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--site-inverse-muted)]">{item.answer}</p>
                  </div>
                ))}
              </div>
            </article>
          </aside>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Photos</p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight">Community gallery</h2>
              </div>
              <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                Moderated uploads
              </span>
            </div>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {reviewCards.map((review) => (
                <div key={review.title} className="overflow-hidden rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card-strong)]">
                  <div className="relative aspect-[4/3] bg-[var(--site-surface-soft)]">
                    {review.imageUrl ? (
                      <Image
                        src={review.imageUrl}
                        alt={`${review.title} gallery image`}
                        fill
                        sizes="(max-width: 1024px) 50vw, 22vw"
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.8),rgba(240,220,196,0.7))] text-2xl font-semibold">
                        {buildMonogram(review.title)}
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="text-sm font-semibold">{review.title}</p>
                    <p className="mt-1 text-sm text-[var(--site-text-soft)]">{review.origin}</p>
                  </div>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
            <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Moderation</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">Keep the feed trustworthy</h2>
            <div className="mt-5 space-y-3">
              {moderationQueue.map((item) => (
                <div key={item.title} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-base font-semibold">{item.title}</p>
                      <p className="mt-1 text-sm leading-7 text-[var(--site-text-soft)]">{item.detail}</p>
                    </div>
                    <span className="rounded-full bg-[var(--site-surface-soft)] px-3 py-1 text-xs font-medium text-[var(--site-text-soft)]">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4 text-sm leading-7 text-[var(--site-text-soft)]">
              Moderation is scaffolded here so the eventual community tools have a clear place to live.
            </div>
          </article>
        </section>
      </section>
    </main>
  );
}
