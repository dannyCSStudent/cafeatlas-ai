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
    <div className="grid gap-3 rounded-[1.5rem] border border-stone-200 bg-white/75 p-4 shadow-sm sm:grid-cols-[1fr_auto]">
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor={name}>
          {label}
        </label>
        <input
          id={name}
          name={name}
          defaultValue={defaultValue}
          placeholder={placeholder}
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500"
        />
      </div>
      <div className="flex gap-3 sm:items-end">
        <button
          type="submit"
          className="w-full rounded-full bg-stone-950 px-5 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5 sm:w-auto"
        >
          {submitLabel}
        </button>
        {clearHref ? (
          <Link
            href={clearHref}
            className="w-full rounded-full border border-stone-300 bg-white px-5 py-3 text-center text-sm font-semibold text-stone-800 transition hover:bg-stone-50 sm:w-auto"
          >
            {clearLabel}
          </Link>
        ) : null}
      </div>
    </div>
  );
}
