import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { EventRsvpForm } from "@/components/event-rsvp-form";
import { fetchEventBySlug } from "@/lib/cafeatlas-api";

type RouteParams = {
  slug: string;
};

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function getContextHref(event: Awaited<ReturnType<typeof fetchEventBySlug>>) {
  if (event.category === "Virtual tour" && event.farm?.slug) {
    return `/farms/${event.farm.slug}`;
  }
  if (event.category === "Producer livestream" && event.producer?.slug) {
    return `/producers/${event.producer.slug}`;
  }
  if (event.coffee?.slug) {
    return `/coffees/${event.coffee.slug}`;
  }
  return "/events";
}

function getContextLabel(category: string) {
  if (category === "Virtual tour") {
    return "Open farm profile";
  }
  if (category === "Producer livestream") {
    return "Open producer profile";
  }
  return "Open featured coffee";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<RouteParams>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const event = await fetchEventBySlug(slug);
    return {
      title: `${event.title} | CafeAtlas AI`,
      description: event.summary,
    };
  } catch {
    return {
      title: "Event | CafeAtlas AI",
      description: "Coffee tastings, virtual tours, and producer livestreams.",
    };
  }
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<RouteParams>;
}) {
  const { slug } = await params;
  let event;

  try {
    event = await fetchEventBySlug(slug);
  } catch (error) {
    const status = error instanceof Error ? (error as Error & { status?: number }).status : undefined;
    if (status === 404) {
      notFound();
    }
    throw error;
  }

  const contextHref = getContextHref(event);
  const imageUrl = event.image_url ?? event.coffee?.image_url ?? event.farm?.image_url ?? event.producer?.image_url;

  return (
    <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <Link
            href="/events"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Back to events
          </Link>
          <Link
            href="/community"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
          >
            Community
          </Link>
          <span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">
            {event.category}
          </span>
        </div>

        <header className="grid gap-8 rounded-[2.25rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.1)] lg:grid-cols-[1.06fr_0.94fr] lg:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">CafeAtlas live session</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{event.title}</h1>
              <p className="max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">{event.summary}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">When</dt>
                <dd className="mt-2 text-sm font-semibold leading-6">{formatEventDate(event.starts_at)}</dd>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">Duration</dt>
                <dd className="mt-2 text-lg font-semibold">{event.duration_minutes} min</dd>
              </div>
              <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] p-4">
                <dt className="text-xs uppercase tracking-[0.22em] text-[var(--site-muted)]">RSVPs</dt>
                <dd className="mt-2 text-lg font-semibold">{event.rsvp_count}</dd>
              </div>
            </dl>
          </div>

          <div className="overflow-hidden rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-soft)]">
            <div className="relative aspect-[4/3]">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={event.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 45vw"
                  className="object-cover"
                  unoptimized
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.7),rgba(240,220,196,0.6))] px-8 text-center">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Event artwork</p>
                    <p className="mt-3 text-2xl font-semibold tracking-tight">{event.title}</p>
                    <p className="mt-2 text-sm text-[var(--site-text-soft)]">Session visuals will appear here when supplied.</p>
                  </div>
                </div>
              )}
            </div>
            <div className="border-t border-[var(--site-border)] p-5">
              <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Hosted by</p>
              <p className="mt-2 text-lg font-semibold">{event.host_name}</p>
              <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{event.audience ?? "Open to the CafeAtlas community."}</p>
            </div>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
          <div className="grid gap-6">
            <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)]">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-muted)]">Session details</p>
              <div className="mt-4 space-y-4 text-sm leading-7 text-[var(--site-text-soft)]">
                <p>{event.description ?? event.summary}</p>
                <p>
                  This session is connected to the CafeAtlas origin graph so the conversation can lead back to the coffee,
                  producer, or farm behind it.
                </p>
              </div>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={contextHref}
                  className="rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
                >
                  {getContextLabel(event.category)}
                </Link>
                <Link
                  href="/events"
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
                >
                  Browse all events
                </Link>
              </div>
            </article>

            <article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-inverse)] p-6 text-[var(--site-inverse-foreground)] shadow-[0_24px_90px_rgba(28,17,8,0.18)]">
              <p className="text-sm uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">Event path</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                {[
                  ["01", "RSVP", "Reserve your place."],
                  ["02", "Prepare", "Read the linked origin story."],
                  ["03", "Join", "Use the event details when they arrive."],
                ].map(([number, title, body]) => (
                  <div key={number} className="rounded-2xl border border-[color:var(--site-inverse-foreground)]/12 bg-[color:var(--site-inverse-foreground)]/8 p-4">
                    <p className="text-xs uppercase tracking-[0.22em] text-[var(--site-inverse-muted)]">{number}</p>
                    <p className="mt-2 font-semibold">{title}</p>
                    <p className="mt-2 text-sm leading-6 text-[var(--site-inverse-muted)]">{body}</p>
                  </div>
                ))}
              </div>
            </article>
          </div>

          <EventRsvpForm eventSlug={event.slug} eventTitle={event.title} />
        </section>
      </section>
    </main>
  );
}
