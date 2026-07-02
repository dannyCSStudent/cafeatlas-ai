import type { CoffeeCatalogParams } from "@/lib/cafeatlas-api";

type CatalogFilterFormProps = {
  params: CoffeeCatalogParams;
  pageSizeOptions: number[];
};

export function CatalogFilterForm({ params, pageSizeOptions }: CatalogFilterFormProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-[var(--site-border)] bg-[var(--site-surface-card)] p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="state">
          State
        </label>
        <input
          id="state"
          name="state"
          defaultValue={params.state ?? ""}
          placeholder="Chiapas"
          className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="producer_slug">
          Producer slug
        </label>
        <input
          id="producer_slug"
          name="producer_slug"
          defaultValue={params.producerSlug ?? ""}
          placeholder="finca-la-esperanza"
          className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="sierra, chiapas, esperanza..."
          className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition placeholder:text-[color:var(--site-muted)] focus:border-[var(--site-accent)]"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={params.sort}
            className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="featured">Featured first</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="page_size">
            Page size
          </label>
          <select
            id="page_size"
            name="page_size"
            defaultValue={params.pageSize}
            className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
          >
            {pageSizeOptions.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-[var(--site-text-soft)]" htmlFor="featured">
          Featured
        </label>
        <select
          id="featured"
          name="featured"
          defaultValue={
            params.featured === null ? "" : params.featured === true ? "true" : params.featured === false ? "false" : ""
          }
          className="w-full rounded-2xl border border-[var(--site-border)] bg-[var(--site-surface-card-strong)] px-4 py-3 text-sm outline-none transition focus:border-[var(--site-accent)]"
        >
          <option value="">All coffees</option>
          <option value="true">Featured only</option>
          <option value="false">Non-featured only</option>
        </select>
      </div>
      <input type="hidden" name="page" value="1" />
      <button
        type="submit"
        className="mt-1 rounded-2xl bg-[var(--site-accent)] px-4 py-3 text-sm font-semibold text-[var(--site-accent-foreground)] transition hover:-translate-y-0.5"
      >
        Apply filters
      </button>
    </form>
  );
}
