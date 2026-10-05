import type { Metadata } from "next";
import Link from "next/link";
import { WholesaleRequestForm } from "@/components/wholesale-request-form";
import { WholesaleBusinessProfile } from "@/components/wholesale-business-profile";
import { WholesalePricingTiers } from "@/components/wholesale-pricing-tiers";

export const metadata: Metadata = { title: "Wholesale | CafeAtlas AI", description: "Request a CafeAtlas wholesale coffee quote for teams, cafes, and corporate programs." };

export default function WholesalePage() {
  return <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14"><section className="mx-auto grid w-full max-w-5xl gap-8"><div className="flex flex-wrap items-center gap-3 text-sm"><Link href="/" className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-4 py-2 font-semibold">Back to catalog</Link><span className="rounded-full bg-[var(--site-inverse)] px-4 py-2 font-semibold text-[var(--site-inverse-foreground)]">Wholesale</span></div><header className="rounded-[2.5rem] border border-[var(--site-border)] bg-[linear-gradient(135deg,rgba(56,33,18,0.98),rgba(108,70,35,0.95))] p-6 text-white shadow-[0_28px_100px_rgba(102,62,22,0.18)] lg:p-10"><p className="text-xs uppercase tracking-[0.28em] text-white/70">B2B coffee program</p><h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">Build a wholesale coffee program around Mexican origin.</h1><p className="mt-5 max-w-2xl text-lg leading-8 text-white/80">Start with a quote request for team orders, cafes, hospitality, and corporate programs. Volume pricing and invoicing will be tailored after we review your needs.</p></header><WholesaleBusinessProfile /><WholesalePricingTiers /><WholesaleRequestForm /></section></main>;
}
