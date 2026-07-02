import Link from "next/link";

const navItems = [
  { href: "/#catalog", label: "Catalog" },
  { href: "/producers", label: "Producers" },
  { href: "/farms", label: "Farms" },
  { href: "/api/v1/coffees", label: "API" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-stone-300/70 bg-[rgba(250,244,236,0.88)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between lg:px-10">
        <Link href="/" className="inline-flex items-center gap-3 self-start">
          <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-lg shadow-stone-950/20">
            CA
          </span>
          <span className="space-y-0.5">
            <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-stone-500">
              CafeAtlas AI
            </span>
            <span className="block text-sm text-stone-700">
              Discover Mexican coffee through origin, story, and place.
            </span>
          </span>
        </Link>

        <nav aria-label="Primary" className="flex flex-wrap items-center gap-2 lg:justify-end">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-stone-300 bg-white/80 px-4 py-2 text-sm font-semibold text-stone-800 shadow-sm transition hover:bg-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
