"use client";

import { useState, type FormEvent } from "react";

import { subscribeToNewsletter } from "@/lib/cafeatlas-api";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function NewsletterSignupForm() {
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "info" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      setFeedback({ tone: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await subscribeToNewsletter(normalized);
      setFeedback(
        response.subscribed
          ? { tone: "success", message: "Thanks. You're on the list." }
          : { tone: "info", message: "You're already subscribed." }
      );
      setEmail("");
    } catch (nextError) {
      setFeedback({
        tone: "error",
        message: nextError instanceof Error ? nextError.message : "Failed to subscribe.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-3 rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_18px_55px_rgba(102,62,22,0.08)]">
      <div>
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Newsletter signup</p>
        <h3 className="mt-2 text-2xl font-semibold tracking-tight">Get new stories in your inbox</h3>
        <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">
          Seasonal notes, origin stories, and new coffee releases, delivered sparingly.
        </p>
      </div>

      <label className="grid gap-2">
        <span className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">Email</span>
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface)] px-4 py-3 text-sm outline-none transition placeholder:text-[var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </label>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-full bg-[var(--site-accent)] px-4 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? "Subscribing..." : "Subscribe"}
      </button>

      {feedback ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            feedback.tone === "success"
              ? "border-[color:var(--site-success-foreground)]/30 bg-[var(--site-success)] text-[var(--site-success-foreground)]"
              : feedback.tone === "info"
                ? "border-[var(--site-border)] bg-[var(--site-surface-soft)] text-[var(--site-text-soft)]"
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
