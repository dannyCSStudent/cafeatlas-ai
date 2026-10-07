import type { Metadata } from "next";
import Link from "next/link";

import { fetchFeaturedFarms, fetchFeaturedProducers, fetchStates } from "@/lib/cafeatlas-api";

export const metadata: Metadata = {
  title: "Coffee Tourism | CafeAtlas AI",
  description: "Plan a coffee-origin route through Mexican states, farms, and producers.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function tripNote(state: string) {
  if (state === "Chiapas") return "Build a highland route around farm visits, floral cups, and slower mornings in the coffee belt.";
  if (state === "Oaxaca") return "Pair producer conversations with market food, cacao, and structured coffees from the mountain regions.";
  if (state === "Veracruz") return "Follow a greener route through farms, mills, and bright coffees shaped by the Gulf-side climate.";
  return `Use ${state} as your anchor, then follow the farms and producers attached to the live catalog.`;
}

export default async function CoffeeTourismPage({ searchParams }: { searchParams?: Promise<SearchParams> }) {
  const params = (await searchParams) ?? {};
  const selectedState = firstParam(params.state) ?? "";
  const [states, producers, farms] = await Promise.all([fetchStates(), fetchFeaturedProducers(), fetchFeaturedFarms()]);
  const state = states.find((item) => item.name === selectedState) ?? states[0];
  const stateFarms = state ? farms.filter((farm) => farm.state === state.name) : [];
  const stateProducers = state ? producers.filter((producer) => producer.farms.some((farm) => farm.state === state.name)) : [];

  return <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14"><section className="mx-auto w-full max-w-7xl"><Link href="/explore" className="text-sm font-semibold text-[var(--site-accent)]">Back to explore</Link><header className="mt-6 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(108,70,35,0.95))] p-7 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:p-12"><p className="text-xs uppercase tracking-[0.28em] text-white/70">Coffee tourism</p><h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-6xl">Plan a trip through the origin graph.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Choose a region, then follow its farms and producers. Every recommendation is grounded in live CafeAtlas origin data.</p></header>{states.length ? <div className="mt-8 flex flex-wrap gap-2">{states.map((item) => <Link key={item.id} href={`/coffee-tourism?state=${encodeURIComponent(item.name)}`} className={`rounded-full border px-4 py-2 text-sm font-semibold ${item.name === state?.name ? "border-[var(--site-inverse)] bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]" : "border-[var(--site-border)] bg-[var(--site-surface-card)]"}`}>{item.name}</Link>)}</div> : null}{state ? <><section className="mt-8 grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"><article className="rounded-[2rem] border border-[var(--site-accent)] bg-[var(--site-surface-muted)] p-7"><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Suggested route</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">{state.name}</h2><p className="mt-4 max-w-2xl text-base leading-8 text-[var(--site-text-soft)]">{tripNote(state.name)}</p><div className="mt-6 grid gap-3 sm:grid-cols-3"><Metric label="Farms" value={String(stateFarms.length)} /><Metric label="Producers" value={String(stateProducers.length)} /><Metric label="Coffees" value={String(state.coffee_count)} /></div></article><article className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-7"><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Route logic</p><p className="mt-3 leading-8 text-[var(--site-text-soft)]">Start with the producer profile, choose a farm stop, then open the coffees attached to that place. This keeps travel planning tied to real origin records instead of generic destination copy.</p></article></section><section className="mt-8 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-7"><p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">Stops to consider</p><div className="mt-5 grid gap-3 md:grid-cols-2">{stateFarms.slice(0, 8).map((farm) => <Link key={farm.id} href={`/farms/${farm.slug}`} className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4 transition hover:border-[var(--site-accent)]"><p className="font-semibold">{farm.name}</p><p className="mt-2 text-sm text-[var(--site-text-soft)]">{farm.municipality}, {farm.state} · {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m elevation` : "Elevation to confirm"}</p></Link>)}{stateFarms.length === 0 ? <p className="text-sm text-[var(--site-text-soft)]">No farm stops are linked to this region yet.</p> : null}</div></section></> : <section className="mt-8 rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-7"><h2 className="text-2xl font-semibold">No origin routes are available yet.</h2><p className="mt-3 text-[var(--site-text-soft)]">Add states, producers, and farms to build travel recommendations.</p></section>}</section></main>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{label}</p><p className="mt-2 text-2xl font-semibold">{value}</p></div>;
}
