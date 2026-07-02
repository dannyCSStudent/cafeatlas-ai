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
  process?: string | null;
  varietal?: string | null;
  tasting_notes?: string | null;
  image_url?: string | null;
  description?: string | null;
  price_cents: number;
  is_featured: boolean;
  created_at: string;
  producer?: CoffeeOriginSummary | null;
  farm?: FarmSummary | null;
};

export type ProducerSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  description?: string | null;
  created_at: string;
};

export type FarmRead = FarmSummary & {
  producer?: ProducerSummary | null;
};

export type ProducerRead = ProducerSummary & {
  farms: FarmSummary[];
};

export type ProducerListItem = ProducerRead;

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
  q?: string;
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
  if (params.q) {
    url.searchParams.set("q", params.q);
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

export async function fetchCoffeeBySlug(slug: string): Promise<CoffeeRead> {
  const url = new URL(`/api/v1/coffees/${slug}`, getApiBaseUrl());
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const error = new Error(`Failed to load coffee (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<CoffeeRead>;
}

export async function fetchProducers(q?: string): Promise<ProducerRead[]> {
  const url = new URL("/api/v1/producers", getApiBaseUrl());
  if (q) url.searchParams.set("q", q);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load producers (${response.status})`);
  }

  return response.json() as Promise<ProducerRead[]>;
}

export async function fetchFeaturedProducers(): Promise<ProducerRead[]> {
  return fetchProducers();
}

export async function fetchProducerBySlug(slug: string): Promise<ProducerRead> {
  const url = new URL(`/api/v1/producers/${slug}`, getApiBaseUrl());
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const error = new Error(`Failed to load producer (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<ProducerRead>;
}

export async function fetchFarms(q?: string): Promise<FarmRead[]> {
  const url = new URL("/api/v1/farms", getApiBaseUrl());
  if (q) url.searchParams.set("q", q);
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    throw new Error(`Failed to load farms (${response.status})`);
  }

  return response.json() as Promise<FarmRead[]>;
}

export async function fetchFeaturedFarms(): Promise<FarmRead[]> {
  return fetchFarms();
}

export async function fetchFarmBySlug(slug: string): Promise<FarmRead> {
  const url = new URL(`/api/v1/farms/${slug}`, getApiBaseUrl());
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const error = new Error(`Failed to load farm (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<FarmRead>;
}
