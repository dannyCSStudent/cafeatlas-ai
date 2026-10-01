"use client";

import { useEffect, useState } from "react";

export function WishlistButton({ coffeeId }: { coffeeId: number }) {
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/account/wishlist", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) return;
        const items = (await response.json()) as Array<{ coffee_id: number }>;
        setSaved(items.some((item) => item.coffee_id === coffeeId));
      })
      .finally(() => setLoading(false));
  }, [coffeeId]);

  async function toggle() {
    setLoading(true);
    setMessage(null);
    const response = await fetch(`/api/account/wishlist/${coffeeId}`, { method: saved ? "DELETE" : "PUT" });
    if (response.status === 401) {
      setMessage("Sign in to save coffees.");
    } else if (response.ok) {
      setSaved(!saved);
    } else {
      setMessage("Could not update wishlist.");
    }
    setLoading(false);
  }

  return (
    <div>
      <button type="button" disabled={loading} onClick={() => void toggle()} className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold text-[var(--foreground)] shadow-sm transition hover:bg-[var(--site-surface-hover)] disabled:opacity-50">
        {saved ? "Saved to wishlist" : "Save to wishlist"}
      </button>
      {message ? <p className="mt-2 text-xs text-[var(--site-text-soft)]">{message}</p> : null}
    </div>
  );
}
