import type { ReactNode } from "react";

type DetailStat = {
  label: string;
  value: ReactNode;
};

type DetailPageShellProps = {
  actions: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
  stats: [DetailStat, DetailStat, DetailStat];
  children: ReactNode;
};

export function DetailPageShell({
  actions,
  eyebrow,
  title,
  description,
  stats,
  children,
}: DetailPageShellProps) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.96),_rgba(248,237,224,0.9)_38%,_rgba(239,222,204,0.98)_100%)] px-6 py-10 text-stone-950 lg:px-10 lg:py-14">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">{actions}</div>

        <article className="grid gap-8 rounded-[2rem] border border-stone-300/80 bg-white/80 p-6 shadow-[0_24px_90px_rgba(102,62,22,0.1)] backdrop-blur lg:grid-cols-[1.1fr_0.9fr] lg:p-8">
          <div className="space-y-6">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.24em] text-stone-500">{eyebrow}</p>
              <h1 className="text-4xl font-semibold tracking-tight text-balance sm:text-5xl">{title}</h1>
              <p className="max-w-2xl text-lg leading-8 text-stone-700">{description}</p>
            </div>

            <dl className="grid gap-4 sm:grid-cols-3">
              {stats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-stone-200 bg-stone-50 p-4">
                  <dt className="text-xs uppercase tracking-[0.22em] text-stone-500">{stat.label}</dt>
                  <dd className="mt-2 text-lg font-semibold">{stat.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <aside className="space-y-4">{children}</aside>
        </article>
      </section>
    </main>
  );
}
