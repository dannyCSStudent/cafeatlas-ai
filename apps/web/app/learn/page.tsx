import { Suspense } from "react";

import { LearnHubClient } from "./learn-hub-client";

export default function LearnPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-transparent px-6 py-10 text-[var(--foreground)] lg:px-10 lg:py-14">
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
            <div className="rounded-[2rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_20px_80px_rgba(102,62,22,0.08)] backdrop-blur">
              <p className="text-sm text-[var(--site-text-soft)]">Loading Learn hub...</p>
            </div>
          </section>
        </main>
      }
    >
      <LearnHubClient />
    </Suspense>
  );
}
