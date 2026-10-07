"use client";

import { useMemo, useState } from "react";

import type { CoffeeRead } from "@/lib/cafeatlas-api";

const methods = ["Pour-over", "French press", "AeroPress", "Espresso"] as const;
type Method = (typeof methods)[number];

function recipeFor(coffee: CoffeeRead, method: Method) {
  const roast = (coffee.roast_level ?? "medium").toLowerCase();
  const temperature = roast.includes("light") ? 96 : roast.includes("dark") ? 91 : 94;
  return {
    dose: method === "Espresso" ? 18 : method === "French press" ? 20 : 18,
    water: method === "Espresso" ? 36 : method === "French press" ? 300 : 270,
    temperature,
    grind: method === "Espresso" ? "Fine" : method === "French press" ? "Coarse" : method === "AeroPress" ? "Medium-fine" : "Medium-fine",
    time: method === "Espresso" ? "26-32 seconds" : method === "French press" ? "4 minutes" : method === "AeroPress" ? "2 minutes" : "2:45-3:15",
    note: coffee.process?.toLowerCase().includes("natural") ? "Keep agitation gentle so the fruit stays clear." : coffee.process?.toLowerCase().includes("washed") ? "Use a steady pour to preserve the clean structure." : "Taste halfway through and adjust one variable at a time.",
  };
}

export function BrewAssistantPanel({ coffees }: { coffees: CoffeeRead[] }) {
  const [selectedId, setSelectedId] = useState(coffees[0]?.id ?? 0);
  const [method, setMethod] = useState<Method>("Pour-over");
  const coffee = coffees.find((item) => item.id === selectedId) ?? coffees[0];
  const recipe = useMemo(() => coffee ? recipeFor(coffee, method) : null, [coffee, method]);

  if (!coffee || !recipe) return <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-8"><h2 className="text-2xl font-semibold">No coffees are available yet.</h2><p className="mt-3 text-[var(--site-text-soft)]">Add a coffee to the catalog to generate a recipe.</p></section>;

  return <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]"><section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6"><p className="text-xs uppercase tracking-[0.26em] text-[var(--site-muted)]">Choose a coffee</p><div className="mt-5 grid gap-2">{coffees.slice(0, 20).map((item) => <button key={item.id} type="button" onClick={() => setSelectedId(item.id)} className={`rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${item.id === coffee.id ? "border-[var(--site-accent)] bg-[var(--site-surface-muted)]" : "border-[var(--site-border)] bg-[var(--site-surface-card-strong)] hover:border-[var(--site-accent)]"}`}>{item.name}<span className="mt-1 block text-xs font-normal text-[var(--site-text-soft)]">{item.origin_state} · {item.process ?? "Process unknown"}</span></button>)}</div><p className="mt-6 text-xs uppercase tracking-[0.26em] text-[var(--site-muted)]">Choose a method</p><div className="mt-4 flex flex-wrap gap-2">{methods.map((item) => <button key={item} type="button" onClick={() => setMethod(item)} className={`rounded-full border px-4 py-2 text-sm font-semibold ${item === method ? "border-[var(--site-inverse)] bg-[var(--site-inverse)] text-[var(--site-inverse-foreground)]" : "border-[var(--site-border)]"}`}>{item}</button>)}</div></section><section className="rounded-[2rem] border border-[var(--site-accent)] bg-[var(--site-surface-muted)] p-6 lg:p-8"><p className="text-xs uppercase tracking-[0.26em] text-[var(--site-muted)]">{coffee.name} · {method}</p><h2 className="mt-3 text-4xl font-semibold tracking-tight">A balanced starting recipe.</h2><div className="mt-6 grid gap-3 sm:grid-cols-2"><Metric label="Coffee" value={`${recipe.dose} g`} /><Metric label="Water" value={`${recipe.water} g`} /><Metric label="Temperature" value={`${recipe.temperature}°C`} /><Metric label="Grind" value={recipe.grind} /><Metric label="Time" value={recipe.time} /></div><p className="mt-6 leading-8 text-[var(--site-text-soft)]">{recipe.note}</p><p className="mt-3 leading-8 text-[var(--site-text-soft)]">Start here, taste the cup, then change one variable at a time: grind first, followed by water temperature.</p></section></div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <article className="rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4"><p className="text-xs uppercase tracking-[0.2em] text-[var(--site-muted)]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></article>;
}
