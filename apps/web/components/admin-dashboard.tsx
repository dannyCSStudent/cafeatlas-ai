import Link from "next/link";

type AdminMetric = {
  label: string;
  value: string;
  note: string;
};

type AdminLane = {
  title: string;
  message: string;
  actionLabel: string;
  href: string;
  status: string;
};

function MetricCard({ label, value, note }: AdminMetric) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-7 text-[var(--site-text-soft)]">{note}</p>
    </article>
  );
}

function AdminLaneCard({ title, message, actionLabel, href, status }: AdminLane) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)]">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{title}</p>
        <span className="rounded-full bg-[var(--site-surface-soft)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-[var(--site-text-soft)]">
          {status}
        </span>
      </div>
      <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{message}</p>
      <div className="mt-4">
        <Link
          href={href}
          className="inline-flex rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)]"
        >
          {actionLabel}
        </Link>
      </div>
    </article>
  );
}

export function AdminDashboard() {
  const metrics: AdminMetric[] = [
    {
      label: "Coffees",
      value: "Catalog live",
      note: "Manage products, pricing, and featured placements.",
    },
    {
      label: "Farms",
      value: "Origin network",
      note: "Track farm records, origin stories, and locations.",
    },
    {
      label: "Inventory",
      value: "Stock-aware",
      note: "Watch sell-through and restock priorities.",
    },
    {
      label: "Photos",
      value: "Gallery-ready",
      note: "Upload and organize product and origin imagery.",
    },
  ];

  const lanes: AdminLane[] = [
    {
      title: "Coffee management",
      status: "Core",
      message: "Edit coffee records, featured flags, origin chain data, and pricing without leaving the admin surface.",
      actionLabel: "Open coffees",
      href: "/coffees",
    },
    {
      title: "Origin management",
      status: "Core",
      message: "Review producers and farms together so origin data stays consistent with the catalog structure.",
      actionLabel: "Open origins",
      href: "/producers",
    },
    {
      title: "Inventory control",
      status: "Planned",
      message: "Centralize stock adjustments, low-inventory alerts, and future replenishment workflows.",
      actionLabel: "View account",
      href: "/account",
    },
    {
      title: "Photo upload",
      status: "Planned",
      message: "Prepare the upload lane for product gallery assets and origin photography.",
      actionLabel: "Open gallery",
      href: "/coffees",
    },
    {
      title: "User management",
      status: "Planned",
      message: "Administer customer access, roles, and support actions from a single place.",
      actionLabel: "Open account",
      href: "/account",
    },
    {
      title: "Orders and analytics",
      status: "Planned",
      message: "Surface order history, fulfillment issues, and performance metrics once commerce data is online.",
      actionLabel: "Browse catalog",
      href: "/",
    },
  ];

  return (
    <div className="grid gap-6">
      <section className="grid gap-6 rounded-[2rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(58,34,18,0.96),rgba(101,62,32,0.94))] p-6 text-white shadow-[0_24px_90px_rgba(102,62,22,0.18)] lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-white/70">Admin dashboard</p>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Manage the marketplace from a dedicated control surface.
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-white/80">
            This scaffold reserves the operational lanes for coffees, farms, inventory, media, users, and orders.
            The backend can be attached one lane at a time without redesigning the page.
          </p>
        </div>

        <div className="grid gap-3 rounded-[1.75rem] border border-white/15 bg-white/8 p-5 backdrop-blur">
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/65">Access model</p>
            <p className="mt-2 text-sm leading-7 text-white/80">
              Admin access is gated from Supabase metadata. Only accounts flagged as `admin` should reach this page.
            </p>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
            <p className="text-xs uppercase tracking-[0.24em] text-white/65">Next work</p>
            <p className="mt-2 text-sm leading-7 text-white/80">
              Connect the first lane to CRUD operations and media uploads once the backend endpoints are ready.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} {...metric} />
        ))}
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {lanes.map((lane) => (
          <AdminLaneCard key={lane.title} {...lane} />
        ))}
      </section>
    </div>
  );
}
