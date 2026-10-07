import type { Metadata } from "next";
import Link from "next/link";

import { BrewAssistantPanel } from "@/components/brew-assistant-panel";
import { fetchCoffeeCatalog } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Brew Assistant | CafeAtlas AI",
  description: "Generate a coffee recipe from the live CafeAtlas catalog.",
};

export default async function BrewAssistantPage() {
  const catalog = await fetchCoffeeCatalog({ pageSize: 100, sort: "featured" });
  return <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14"><section className="mx-auto flex w-full max-w-7xl flex-col gap-8"><div className="flex flex-wrap items-center gap-3 text-sm"><Link href="/explore" className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold">Back to explore</Link><span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">Brew assistant</span></div><header className="rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(108,70,35,0.95))] p-7 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:p-12"><p className="text-xs uppercase tracking-[0.28em] text-white/70">AI brew assistant</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Turn a coffee into a recipe.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Use the live coffee profile, roast, and process to build a practical starting recipe for your brew method.</p></header><BrewAssistantPanel coffees={catalog.items} /></section></main>;
}
