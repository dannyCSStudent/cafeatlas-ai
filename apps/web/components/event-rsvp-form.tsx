"use client";

import { useState, type FormEvent } from "react";

import { createEventRsvp } from "@/lib/cafeatlas-api";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

type EventRsvpFormProps = {
  eventSlug: string;
  eventTitle: string;
  initialEmail?: string | null;
};

export function EventRsvpForm({ eventSlug, eventTitle, initialEmail }: EventRsvpFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setFeedback({ tone: "error", message: "Enter your name." });
      return;
    }

    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setFeedback({ tone: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      await createEventRsvp(eventSlug, {
        attendee_name: normalizedName,
        attendee_email: normalizedEmail,
        note: note.trim() || null,
      });
      setFeedback({
        tone: "success",
        message: `You are on the list for ${eventTitle}. We will use this email for event details.`,
      });
    } catch (error) {
      setFeedback({
        tone: "error",
        message: error instanceof Error ? error.message : "Unable to save your RSVP.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="grid gap-4 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Reserve a seat</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Join this session</h2>
        <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
          RSVP is open without an account. Your email is only used for this event’s details.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Name</span>
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          placeholder="Your name"
          className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          autoComplete="email"
          placeholder="you@example.com"
          className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </label>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Note (optional)</span>
        <textarea
          value={note}
          onChange={(event) => setNote(event.target.value)}
          rows={3}
          placeholder="Anything you want the host to know?"
          className="resize-y rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--site-accent)] px-4 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Saving RSVP..." : "Reserve my seat"}
      </button>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-[color:var(--site-success-foreground)]/30 bg-[var(--site-success)] text-[var(--site-success-foreground)]"
              : "border-[color:var(--site-error-foreground)]/30 bg-[var(--site-error)] text-[var(--site-error-foreground)]"
          }`}
          aria-live="polite"
        >
          {feedback.message}
        </div>
      ) : null}
    </form>
  );
}
