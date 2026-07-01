import type { CoffeeCatalogParams } from "@/lib/cafeatlas-api";

type CatalogFilterFormProps = {
  params: CoffeeCatalogParams;
  pageSizeOptions: number[];
};

export function CatalogFilterForm({ params, pageSizeOptions }: CatalogFilterFormProps) {
  return (
    <form className="grid gap-4 rounded-3xl border border-stone-200 bg-stone-50/90 p-4">
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="state">
          State
        </label>
        <input
          id="state"
          name="state"
          defaultValue={params.state ?? ""}
          placeholder="Chiapas"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="producer_slug">
          Producer slug
        </label>
        <input
          id="producer_slug"
          name="producer_slug"
          defaultValue={params.producerSlug ?? ""}
          placeholder="finca-la-esperanza"
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500"
        />
      </div>
      <div>
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="q">
          Search
        </label>
        <input
          id="q"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="sierra, chiapas, esperanza..."
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-stone-500"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="sort">
            Sort
          </label>
          <select
            id="sort"
            name="sort"
            defaultValue={params.sort}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="price_asc">Price: low to high</option>
            <option value="price_desc">Price: high to low</option>
            <option value="featured">Featured first</option>
          </select>
        </div>
        <div>
          <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="page_size">
            Page size
          </label>
          <select
            id="page_size"
            name="page_size"
            defaultValue={params.pageSize}
            className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
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
        <label className="mb-2 block text-sm font-medium text-stone-700" htmlFor="featured">
          Featured
        </label>
        <select
          id="featured"
          name="featured"
          defaultValue={
            params.featured === null ? "" : params.featured === true ? "true" : params.featured === false ? "false" : ""
          }
          className="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-stone-500"
        >
          <option value="">All coffees</option>
          <option value="true">Featured only</option>
          <option value="false">Non-featured only</option>
        </select>
      </div>
      <input type="hidden" name="page" value="1" />
      <button
        type="submit"
        className="mt-1 rounded-2xl bg-stone-950 px-4 py-3 text-sm font-semibold text-white transition hover:-translate-y-0.5"
      >
        Apply filters
      </button>
    </form>
  );
}
