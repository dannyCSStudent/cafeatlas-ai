import type { Metadata } from "next";

import { WebCartPanel } from "@/components/web-cart-panel";

export const metadata: Metadata = { title: "Cart | CafeAtlas AI", description: "Review your CafeAtlas coffee order." };

export default function CartPage() {
  return <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.45),rgba(248,237,224,0.7)_38%,rgba(239,222,204,0.9)_100%)] px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14"><section className="mx-auto w-full max-w-6xl"><header className="mb-8"><p className="text-xs uppercase tracking-[0.28em] text-[var(--site-muted)]">CafeAtlas shop</p><h1 className="mt-3 text-4xl font-semibold tracking-tight sm:text-6xl">Bring the origin story home.</h1><p className="mt-4 max-w-2xl text-lg leading-8 text-[var(--site-text-soft)]">Review your coffee, confirm shipping, and pay securely through Stripe.</p></header><WebCartPanel /></section></main>;
}
