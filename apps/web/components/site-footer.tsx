import Link from "next/link";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { getApiBaseUrl } from "@/lib/cafeatlas-api";
import { getCurrentSupabaseUser, isSupabaseAdminUser } from "@/lib/supabase-auth";

const footerLinks = [
  { href: "/", label: "Catalog" },
  { href: "/discover", label: "Discover" },
  { href: "/explore", label: "Explore" },
  { href: "/producers", label: "Producers" },
  { href: "/farms", label: "Farms" },
];

const learnLinks = [
  { href: "/learn", label: "Learn hub" },
  { href: "/about", label: "About" },
  { href: "/learn/how-to-read-a-coffee-profile", label: "Reading guide" },
  { href: "/learn/seasonal-notes", label: "Seasonal notes" },
  { href: "/about#how-it-works", label: "How it works" },
];

export async function SiteFooter() {
  const apiHref = `${getApiBaseUrl()}/api/v1/coffees`;
  const user = await getCurrentSupabaseUser();
  const isAdmin = isSupabaseAdminUser(user);

  return (
    <footer className="border-t border-[var(--site-border)] bg-[var(--site-footer)] text-[var(--site-footer-foreground)]">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-footer-muted)]">
            {cafeAtlasBrand.name}
          </p>
          <p className="max-w-xl text-lg leading-8 text-[var(--site-footer-muted)]">
            {cafeAtlasBrand.tagline} A digital destination for Mexican coffee discovery, with live catalog data,
            origin profiles, and a growing editorial foundation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-3">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-footer-muted)]">Explore</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--site-footer-link)] transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
              <a href={apiHref} className="text-[var(--site-footer-link)] transition hover:text-white">
                API
              </a>
              <Link href={user ? "/account" : "/auth"} className="text-[var(--site-footer-link)] transition hover:text-white">
                {user ? "Account" : "Sign in"}
              </Link>
              {isAdmin ? (
                <Link href="/admin" className="text-[var(--site-footer-link)] transition hover:text-white">
                  Admin
                </Link>
              ) : null}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-footer-muted)]">Learn</p>
            <div className="mt-4 flex flex-col gap-3">
              {learnLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-[var(--site-footer-link)] transition hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-footer-muted)]">Stack</p>
            <div className="mt-4 space-y-3 text-[var(--site-footer-link)]">
              <p>Next.js storefront</p>
              <p>FastAPI catalog backend</p>
              <p>Expo mobile client</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
