type ArticleMetaProps = {
  readTime?: string;
  updated?: string;
  className?: string;
};

export const LEARN_ARTICLE_META = {
  readTime: "2 min",
  updated: "Jul 31, 2026",
} as const;

export function ArticleMeta({
  readTime = LEARN_ARTICLE_META.readTime,
  updated = LEARN_ARTICLE_META.updated,
  className,
}: ArticleMetaProps) {
  return (
    <div className={`flex flex-wrap gap-2 text-xs${className ? ` ${className}` : ""}`}>
      <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
        Read {readTime}
      </span>
      <span className="rounded-full border border-[var(--site-border)] bg-[var(--site-surface-soft)] px-3 py-1 font-medium text-[var(--site-text-soft)]">
        Updated {updated}
      </span>
    </div>
  );
}
