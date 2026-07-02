import Link from "next/link";

import { BrandBadge } from "@/components/brand-badge";
import { ThemeToggle } from "@/components/theme-toggle";

const navItems = [
  { href: "/#catalog", label: "Catalog" },
  { href: "/producers", label: "Producers" },
  { href: "/farms", label: "Farms" },
  { href: "/api/v1/coffees", label: "API" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--site-border)] bg-[var(--site-surface)] backdrop-blur">
      <div className="mx-auto w-full max-w-7xl px-6 py-4 lg:px-10">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="inline-flex items-center gap-3">
            <BrandBadge />
          </Link>

          <div className="hidden items-center gap-3 lg:flex">
            <nav aria-label="Primary" className="flex flex-wrap items-center gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--site-foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <ThemeToggle />
          </div>

          <details className="relative lg:hidden">
            <summary className="list-none rounded-full border border-[var(--site-border)] bg-[var(--site-surface-strong)] px-4 py-2 text-sm font-semibold text-[var(--site-foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)]">
              Menu
            </summary>
            <div className="absolute right-0 top-full z-50 mt-3 w-72 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-strong)] p-3 shadow-2xl shadow-stone-950/10">
              <nav aria-label="Primary" className="grid gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="rounded-2xl border border-[var(--site-border)] px-4 py-3 text-sm font-semibold text-[var(--site-foreground)] transition hover:bg-[var(--site-surface-hover)]"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-3">
                <ThemeToggle />
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
