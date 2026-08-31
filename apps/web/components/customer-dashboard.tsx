import Link from "next/link";
import type { ReactNode } from "react";

import { StatusPanel } from "@/components/status-panel";

type CustomerDashboardProps = {
  userId: string;
  email: string | null;
  displayName: string;
  createdAt: string;
  lastSignInAt?: string | null;
  emailConfirmedAt?: string | null;
};

type DashboardSection = {
  title: string;
  tone: "neutral" | "empty";
  message: string;
  action?: ReactNode;
  status?: string;
};

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatVerifiedLabel(value?: string | null) {
  if (!value) {
    return "Pending verification";
  }

  return `Verified ${formatDateTime(value)}`;
}

function MetricCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{label}</p>
      <p className="mt-3 break-words text-sm leading-7 text-[var(--site-text-soft)]">{value}</p>
      {note ? <p className="mt-2 text-xs leading-6 text-[var(--site-muted)]">{note}</p> : null}
    </article>
  );
}

function ModuleCard({ title, tone, message, action, status }: DashboardSection) {
  return (
    <article
      className={`rounded-[1.75rem] border p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] ${
        tone === "empty"
          ? "border-dashed border-[var(--site-border)] bg-[var(--site-empty)] text-[var(--site-empty-foreground)]"
          : "border-[var(--site-border)] bg-[var(--site-surface-card)] text-[var(--foreground)]"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{title}</p>
        {status ? (
          <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-text-soft)]">
            {status}
          </span>
        ) : null}
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{message}</p>
      {action ? <div className="mt-4">{action}</div> : null}
    </article>
  );
}

export function CustomerDashboard({
  userId,
  email,
  displayName,
  createdAt,
  lastSignInAt,
  emailConfirmedAt,
}: CustomerDashboardProps) {
  const summaryCards = [
    {
      label: "Display name",
      value: displayName || "Not set yet",
      note: "Stored in Supabase auth metadata.",
    },
    {
      label: "Email",
      value: email ?? "No email on file",
      note: "Used for sign-in and account recovery.",
    },
    {
      label: "Signed up",
      value: formatDateTime(createdAt),
      note: "Initial account creation timestamp.",
    },
    {
      label: "Email status",
      value: formatVerifiedLabel(emailConfirmedAt),
      note: lastSignInAt ? `Last sign-in ${formatDateTime(lastSignInAt)}` : "No sign-in recorded yet.",
    },
  ];

  const dashboardSections: DashboardSection[] = [
    {
      title: "Orders",
      tone: "empty",
      status: "Soon",
      message:
        "No orders yet. This panel will surface purchase history, fulfillment status, and invoices once commerce data is connected.",
      action: (
        <Link
          href="/coffees"
          className="text-sm font-semibold text-[var(--site-accent)] transition hover:opacity-80"
        >
          Browse the catalog
        </Link>
      ),
    },
    {
      title: "Addresses",
      tone: "empty",
      status: "Soon",
      message:
        "Shipping profiles do not exist yet. When checkout lands, this is where the saved address book will appear.",
    },
    {
      title: "Wishlist",
      tone: "empty",
      status: "Soon",
      message:
        "Nothing is bookmarked yet. This slot is reserved for coffees the customer wants to revisit later.",
    },
    {
      title: "Subscriptions",
      tone: "empty",
      status: "Soon",
      message:
        "Recurring deliveries are not configured yet, but the dashboard already has a dedicated place for them.",
    },
    {
      title: "Rewards",
      tone: "empty",
      status: "Soon",
      message:
        "No rewards activity yet. Loyalty tiers, points, and perks can drop into this module when the backend supports it.",
    },
    {
      title: "Next milestone",
      tone: "neutral",
      status: "Planned",
      message:
        "The customer portal now has a stable frame. The next step is wiring these sections to real commerce data instead of placeholder copy.",
      action: (
        <div className="flex flex-wrap gap-3 text-sm">
          <Link
            href="/learn"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
          >
            Learn hub
          </Link>
          <Link
            href="/auth"
            className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
          >
            Auth
          </Link>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-6">
      <StatusPanel
        title="Customer dashboard"
        message="The dashboard is wired to the signed-in Supabase session and now presents a complete customer portal frame."
        action={
          <div className="flex flex-wrap gap-3 text-sm">
            <Link
              href="/coffees"
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
            >
              Browse coffees
            </Link>
            <Link
              href="/producers"
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
            >
              Producers
            </Link>
            <Link
              href="/farms"
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
            >
              Farms
            </Link>
            <Link
              href="/auth/reset-password"
              className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
            >
              Reset password
            </Link>
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <MetricCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Account id</p>
          <p className="mt-3 break-all text-sm leading-7 text-[var(--site-text-soft)]">{userId}</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Last sign-in</p>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">
            {lastSignInAt ? formatDateTime(lastSignInAt) : "No sign-in recorded yet"}
          </p>
        </article>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {dashboardSections.map((section) => (
          <ModuleCard key={section.title} {...section} />
        ))}
      </section>
    </div>
  );
}
