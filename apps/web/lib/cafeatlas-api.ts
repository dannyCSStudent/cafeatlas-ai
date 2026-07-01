export type CoffeeOriginSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  description?: string | null;
};

export type FarmSummary = {
  id: number;
  producer_id: number;
  name: string;
  slug: string;
  state: string;
  municipality: string;
  altitude_meters: number | null;
  description?: string | null;
};

export type CoffeeRead = {
  id: number;
  producer_id: number | null;
  farm_id: number | null;
  name: string;
  slug: string;
  origin_state: string;
  producer_name: string;
  description?: string | null;
  price_cents: number;
  is_featured: boolean;
  created_at: string;
  producer?: CoffeeOriginSummary | null;
  farm?: FarmSummary | null;
};

export type CoffeeListPage = {
  items: CoffeeRead[];
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
};

export type CoffeeCatalogParams = {
  page?: number;
  pageSize?: number;
  sort?: string;
  state?: string;
  producerSlug?: string;
  featured?: boolean | null;
};

const DEFAULT_API_URL = "http://127.0.0.1:8000";

export function getApiBaseUrl() {
  return process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? DEFAULT_API_URL;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export async function fetchCoffeeCatalog(params: CoffeeCatalogParams = {}): Promise<CoffeeListPage> {
  const url = new URL("/api/v1/coffees", getApiBaseUrl());

  if (typeof params.page === "number") {
    url.searchParams.set("page", String(params.page));
  }
  if (typeof params.pageSize === "number") {
    url.searchParams.set("page_size", String(params.pageSize));
  }
  if (params.sort) {
    url.searchParams.set("sort", params.sort);
  }
  if (params.state) {
    url.searchParams.set("state", params.state);
  }
  if (params.producerSlug) {
    url.searchParams.set("producer_slug", params.producerSlug);
  }
  if (typeof params.featured === "boolean") {
    url.searchParams.set("featured", String(params.featured));
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load coffees (${response.status})`);
  }

  return response.json() as Promise<CoffeeListPage>;
}
