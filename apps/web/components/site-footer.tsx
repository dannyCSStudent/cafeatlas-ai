import Link from "next/link";

const footerLinks = [
  { href: "/", label: "Catalog" },
  { href: "/producers", label: "Producers" },
  { href: "/farms", label: "Farms" },
  { href: "/api/v1/coffees", label: "API" },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-300/70 bg-stone-950 text-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.28em] text-stone-400">CafeAtlas AI</p>
          <p className="max-w-xl text-lg leading-8 text-stone-300">
            A digital destination for Mexican coffee discovery, with live catalog data, origin profiles,
            and a growing editorial foundation.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Explore</p>
            <div className="mt-4 flex flex-col gap-3">
              {footerLinks.map((item) => (
                <Link key={item.href} href={item.href} className="text-stone-200 transition hover:text-white">
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-stone-400">Stack</p>
            <div className="mt-4 space-y-3 text-stone-200">
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
