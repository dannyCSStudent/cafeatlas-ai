import Link from "next/link";

import { StatusPanel } from "@/components/status-panel";

type CustomerDashboardProps = {
  userId: string;
  email: string | null;
  displayName: string;
  createdAt: string;
  lastSignInAt?: string | null;
  emailConfirmedAt?: string | null;
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

function ModuleCard({
  title,
  tone,
  message,
  action,
}: {
  title: string;
  tone: "neutral" | "empty";
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <article
      className={`rounded-[1.75rem] border p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] ${
        tone === "empty"
          ? "border-dashed border-[var(--site-border)] bg-[var(--site-empty)] text-[var(--site-empty-foreground)]"
          : "border-[var(--site-border)] bg-[var(--site-surface-card)] text-[var(--foreground)]"
      }`}
    >
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{title}</p>
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
  return (
    <div className="grid gap-6">
      <StatusPanel
        title="Customer dashboard"
        message="The dashboard is wired to the signed-in Supabase session and is ready for customer data when the backend surfaces it."
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
          </div>
        }
      />

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Display name</p>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{displayName || "Not set yet"}</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Email</p>
          <p className="mt-3 break-all text-sm leading-7 text-[var(--site-text-soft)]">{email ?? "No email on file"}</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Signed up</p>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{formatDateTime(createdAt)}</p>
        </article>
        <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
          <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Email status</p>
          <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{formatVerifiedLabel(emailConfirmedAt)}</p>
        </article>
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
        <ModuleCard
          title="Orders"
          tone="empty"
          message="No orders yet. This panel will surface purchase history once the commerce layer is added."
          action={
            <Link
              href="/coffees"
              className="text-sm font-semibold text-[var(--site-accent)] transition hover:opacity-80"
            >
              Browse the catalog
            </Link>
          }
        />
        <ModuleCard
          title="Addresses"
          tone="empty"
          message="No saved addresses yet. Shipping profiles can slot in here when fulfillment is ready."
        />
        <ModuleCard
          title="Wishlist"
          tone="empty"
          message="Nothing saved yet. Use this area to bookmark coffees you want to return to."
        />
        <ModuleCard
          title="Subscriptions"
          tone="empty"
          message="Recurring deliveries are not configured yet, but the dashboard already has a place for them."
        />
        <ModuleCard
          title="Rewards"
          tone="empty"
          message="No rewards activity yet. Points, perks, and loyalty history can live here later."
        />
        <ModuleCard
          title="Next milestone"
          tone="neutral"
          message="The customer dashboard now has the right frame. The next code step is wiring these sections to real commerce data."
          action={
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
          }
        />
      </section>
    </div>
  );
}
