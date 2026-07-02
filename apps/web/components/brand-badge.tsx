import { cafeAtlasBrand } from "@repo/ui/brand";

export function BrandBadge() {
  return (
    <div className="inline-flex items-center gap-3">
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-stone-950 text-sm font-semibold text-white shadow-lg shadow-stone-950/20">
        {cafeAtlasBrand.monogram}
      </span>
      <span className="space-y-0.5">
        <span className="block text-sm font-semibold uppercase tracking-[0.28em] text-[var(--site-muted)]">
          {cafeAtlasBrand.name}
        </span>
        <span className="hidden text-sm text-[var(--site-foreground)]/80 md:block">
          {cafeAtlasBrand.tagline}
        </span>
      </span>
    </div>
  );
}
