const DEFAULT_API_URL = "http://127.0.0.1:8000";

export type CoffeeOriginSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  description?: string | null;
  created_at: string;
};

export type FarmSummary = {
  id: number;
  producer_id: number;
  name: string;
  slug: string;
  state: string;
  municipality: string | null;
  altitude_meters: number | null;
  description?: string | null;
  created_at: string;
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

export type ProducerRead = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  description?: string | null;
  created_at: string;
  farms: FarmSummary[];
};

export type FarmRead = FarmSummary & {
  producer?: ProducerRead | null;
};

export function getApiBaseUrl() {
  return process.env.EXPO_PUBLIC_CAFEATLAS_API_URL ?? DEFAULT_API_URL;
}

export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

async function fetchJson<T>(path: string): Promise<T> {
  const response = await fetch(new URL(path, getApiBaseUrl()));
  if (!response.ok) {
    throw new Error(`Request failed (${response.status})`);
  }
  return response.json() as Promise<T>;
}

export async function fetchCoffeeCatalog(params: CoffeeCatalogParams = {}): Promise<CoffeeListPage> {
  const url = new URL("/api/v1/coffees", getApiBaseUrl());

  if (typeof params.page === "number") url.searchParams.set("page", String(params.page));
  if (typeof params.pageSize === "number") url.searchParams.set("page_size", String(params.pageSize));
  if (params.sort) url.searchParams.set("sort", params.sort);
  if (params.state) url.searchParams.set("state", params.state);
  if (params.producerSlug) url.searchParams.set("producer_slug", params.producerSlug);
  if (typeof params.featured === "boolean") url.searchParams.set("featured", String(params.featured));

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load coffees (${response.status})`);
  }
  return response.json() as Promise<CoffeeListPage>;
}

export async function fetchCoffeeBySlug(slug: string): Promise<CoffeeRead> {
  return fetchJson<CoffeeRead>(`/api/v1/coffees/${slug}`);
}

export async function fetchProducers(): Promise<ProducerRead[]> {
  return fetchJson<ProducerRead[]>("/api/v1/producers");
}

export async function fetchProducerBySlug(slug: string): Promise<ProducerRead> {
  return fetchJson<ProducerRead>(`/api/v1/producers/${slug}`);
}

export async function fetchFarms(): Promise<FarmRead[]> {
  return fetchJson<FarmRead[]>("/api/v1/farms");
}

export async function fetchFarmBySlug(slug: string): Promise<FarmRead> {
  return fetchJson<FarmRead>(`/api/v1/farms/${slug}`);
}
