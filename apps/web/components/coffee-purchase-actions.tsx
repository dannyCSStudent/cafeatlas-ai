"use client";

import Link from "next/link";

import { useWebCart } from "@/lib/cart";

type Props = {
  coffee: {
    id: number;
    slug: string;
    name: string;
    price_cents: number;
    currency_code?: string | null;
    inventory_units?: number | null;
    image_url?: string | null;
  };
};

export function CoffeePurchaseActions({ coffee }: Props) {
  const { addItem, items, hydrated } = useWebCart();
  const quantity = items.find((item) => item.coffeeId === coffee.id)?.quantity ?? 0;
  const available = coffee.inventory_units ?? 0;

  if (!hydrated) return <div className="h-11" aria-hidden="true" />;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        disabled={available < 1}
        onClick={() => addItem({ coffeeId: coffee.id, slug: coffee.slug, name: coffee.name, priceCents: coffee.price_cents, currencyCode: coffee.currency_code ?? "USD", inventoryUnits: available, imageUrl: coffee.image_url })}
        className="rounded-full bg-[var(--site-inverse)] px-5 py-3 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {available < 1 ? "Out of stock" : quantity ? `Add another (${quantity} in cart)` : "Add to cart"}
      </button>
      {quantity ? <Link href="/cart" className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-sm font-semibold">Open cart</Link> : null}
    </div>
  );
}
