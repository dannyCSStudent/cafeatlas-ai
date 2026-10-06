"use client";

import { useEffect, useState } from "react";

type InventoryItem = { id: number; name: string; origin_state: string; inventory_units: number };

export function AdminInventoryPanel() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    try {
      const response = await fetch("/api/admin/inventory", { cache: "no-store" });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not load inventory.");
      setItems(payload as InventoryItem[]);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not load inventory.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void load(); }, []);

  async function update(item: InventoryItem) {
    const rawValue = window.prompt(`Set inventory for ${item.name}`, String(item.inventory_units));
    if (rawValue === null) return;
    const inventoryUnits = Number(rawValue);
    if (!Number.isInteger(inventoryUnits) || inventoryUnits < 0) {
      setError("Inventory must be a non-negative whole number.");
      return;
    }
    setSavingId(item.id);
    setError(null);
    try {
      const response = await fetch(`/api/admin/inventory/${item.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inventory_units: inventoryUnits }),
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(typeof payload.detail === "string" ? payload.detail : "Could not update inventory.");
      setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, inventory_units: payload.inventory_units } : entry));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update inventory.");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <section className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-6 shadow-[0_24px_90px_rgba(102,62,22,0.08)] lg:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">Inventory control</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">Restock coffees without SQL.</h2>
        </div>
        <button type="button" onClick={() => void load()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-2 text-sm font-semibold">Refresh</button>
      </div>
      {error ? <p className="mt-4 rounded-2xl bg-red-50 p-4 text-sm text-red-800">{error}</p> : null}
      {loading ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">Loading inventory...</p> : items.length === 0 ? <p className="mt-6 text-sm text-[var(--site-text-soft)]">No coffees found.</p> : (
        <div className="mt-6 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-soft)] p-4">
              <div><p className="font-semibold">{item.name}</p><p className="mt-1 text-sm text-[var(--site-text-soft)]">{item.origin_state} · {item.inventory_units} units available</p></div>
              <button type="button" disabled={savingId === item.id} onClick={() => void update(item)} className="rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] disabled:opacity-50">{savingId === item.id ? "Saving..." : "Adjust stock"}</button>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
