export type CoffeeOriginSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  image_url?: string | null;
  description?: string | null;
};

export type ImageRead = {
  id: number;
  coffee_id?: number | null;
  farm_id?: number | null;
  producer_id?: number | null;
  image_url: string;
  alt_text?: string | null;
  caption?: string | null;
  sort_order: number;
  created_at: string;
};

export type FarmSummary = {
  id: number;
  producer_id: number;
  name: string;
  slug: string;
  state: string;
  municipality: string;
  altitude_meters: number | null;
  image_url?: string | null;
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
  inventory_units?: number | null;
  currency_code?: string | null;
  compare_at_cents?: number | null;
  process?: string | null;
  roast_level?: string | null;
  varietal?: string | null;
  tasting_notes?: string | null;
  image_url?: string | null;
  description?: string | null;
  price_cents: number;
  is_featured: boolean;
  created_at: string;
  producer?: CoffeeOriginSummary | null;
  farm?: FarmSummary | null;
  images?: ImageRead[];
};

export type EventCoffeeSummary = {
  id: number;
  name: string;
  slug: string;
  origin_state: string;
  producer_name: string;
  image_url?: string | null;
  description?: string | null;
};

export type ProducerSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
};

export type FarmRead = FarmSummary & {
  producer?: ProducerSummary | null;
  images?: ImageRead[];
};

export type ProducerRead = ProducerSummary & {
  farms: FarmSummary[];
  images?: ImageRead[];
};

export type ProducerListItem = ProducerRead;

export type StateRead = {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  farm_count: number;
  coffee_count: number;
};

export type NewsletterSubscribeResponse = {
  email: string;
  subscribed: boolean;
  created_at: string;
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

export type EventSessionRead = {
  id: number;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description?: string | null;
  starts_at: string;
  duration_minutes: number;
  host_name: string;
  audience?: string | null;
  meeting_url?: string | null;
  replay_url?: string | null;
  image_url?: string | null;
  is_featured: boolean;
  rsvp_count: number;
  created_at: string;
  coffee?: EventCoffeeSummary | null;
  producer?: ProducerSummary | null;
  farm?: FarmSummary | null;
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

export type EventCatalogParams = {
  q?: string;
  category?: string;
  upcomingOnly?: boolean;
};

const DEFAULT_API_URL = "http://127.0.0.1:8000";

export function getApiBaseUrl() {
  return process.env.CAFEATLAS_API_URL ?? process.env.NEXT_PUBLIC_CAFEATLAS_API_URL ?? DEFAULT_API_URL;
}

export function formatPrice(cents: number, currencyCode = "USD") {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currencyCode,
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

export async function fetchEvents(params: EventCatalogParams = {}): Promise<EventSessionRead[]> {
  const url = new URL("/api/v1/events", getApiBaseUrl());

  if (params.q) {
    url.searchParams.set("q", params.q);
  }
  if (params.category) {
    url.searchParams.set("category", params.category);
  }
  if (typeof params.upcomingOnly === "boolean") {
    url.searchParams.set("upcoming_only", String(params.upcomingOnly));
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load events (${response.status})`);
  }

  return response.json() as Promise<EventSessionRead[]>;
}

export async function fetchStates(q?: string): Promise<StateRead[]> {
  const url = new URL("/api/v1/states", getApiBaseUrl());
  if (q) {
    url.searchParams.set("q", q);
  }

  const response = await fetch(url, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Failed to load states (${response.status})`);
  }

  return response.json() as Promise<StateRead[]>;
}

export async function fetchStateBySlug(slug: string): Promise<StateRead> {
  const url = new URL(`/api/v1/states/${slug}`, getApiBaseUrl());
  const response = await fetch(url, { cache: "no-store" });

  if (!response.ok) {
    const error = new Error(`Failed to load state (${response.status})`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }

  return response.json() as Promise<StateRead>;
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

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResponse> {
  const url = new URL("/api/v1/newsletter/subscribe", getApiBaseUrl());
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    throw new Error(`Failed to subscribe (${response.status})`);
  }

  return response.json() as Promise<NewsletterSubscribeResponse>;
}
