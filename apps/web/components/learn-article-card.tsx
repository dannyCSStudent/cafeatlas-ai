import Link from "next/link";

import { ArticleMeta } from "@/components/article-meta";
import type { LearnArticle } from "@repo/ui/learn";

type LearnArticleCardProps = {
  article: LearnArticle;
  rank?: string;
};

export function LearnArticleCard({ article, rank }: LearnArticleCardProps) {
  return (
    <article className="rounded-[1.75rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-5 shadow-[0_16px_50px_rgba(102,62,22,0.06)] backdrop-blur">
      {rank ? (
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] text-xs font-semibold text-[var(--site-text-soft)]">
            {rank}
          </span>
          <span className="h-px flex-1 bg-[var(--site-border)]" />
        </div>
      ) : null}
      <p className="text-xs uppercase tracking-[0.24em] text-[var(--site-muted)]">{article.tag}</p>
      <h2 className="mt-3 text-2xl font-semibold tracking-tight">{article.title}</h2>
      <p className="mt-3 text-sm leading-7 text-[var(--site-text-soft)]">{article.body}</p>
      <ArticleMeta className="mt-4" readTime={article.readTime} updated={article.updated} />
      <Link
        href={article.href}
        className="mt-5 inline-flex rounded-full bg-[var(--site-inverse)] px-4 py-2 text-sm font-semibold text-[var(--site-inverse-foreground)] transition hover:-translate-y-0.5"
      >
        Open article
      </Link>
    </article>
  );
}
