import Link from "next/link";

type SearchToolbarProps = {
  label: string;
  name: string;
  defaultValue: string;
  placeholder: string;
  submitLabel?: string;
  clearHref?: string;
  clearLabel?: string;
};

export function SearchToolbar({
  label,
  name,
  defaultValue,
  placeholder,
  submitLabel = "Search",
  clearHref,
  clearLabel = "Clear",
}: SearchToolbarProps) {
  return (
    <div className="grid gap-3 rounded-[1.5rem] border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4 shadow-sm sm:grid-cols-[1fr_auto]">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </div>
      <div className="flex gap-3 sm:items-end">
        <button
          type="submit"
          className="w-full rounded-full bg-[var(--site-accent)] px-5 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5 sm:w-auto"
        >
          {submitLabel}
        </button>
        {clearHref ? (
          <Link
            href={clearHref}
            className="w-full rounded-full border border-[var(--site-border)] bg-[var(--site-surface-card)] px-5 py-3 text-center text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--site-surface-hover)] sm:w-auto"
          >
            {clearLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
