import { Platform } from "react-native";

const DEFAULT_WEB_API_URL = "http://127.0.0.1:8000";
const DEFAULT_NATIVE_API_URL = Platform.select({
  android: "http://10.0.2.2:8000",
  default: "http://127.0.0.1:8000",
}) as string;
const LOOPBACK_HOSTNAMES = new Set(["localhost", "127.0.0.1", "::1"]);

export type CoffeeOriginSummary = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  image_url?: string | null;
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

export type CheckoutPrepareRead = {
  items: Array<{
    coffee_id: number;
    slug: string;
    name: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
    available_inventory_units: number;
  }>;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  currency_code: string;
  checkout_ready: boolean;
};

export type OrderRead = {
  id: number;
  status: string;
  currency_code: string;
  subtotal_cents: number;
  shipping_cents: number;
  tax_cents: number;
  total_cents: number;
  recipient_name?: string | null;
  address_line1?: string | null;
  address_line2?: string | null;
  city?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  created_at: string;
  items: Array<{
    coffee_id: number;
    coffee_name: string;
    coffee_slug: string;
    quantity: number;
    unit_price_cents: number;
    line_total_cents: number;
  }>;
};

export type ProducerRead = {
  id: number;
  name: string;
  slug: string;
  family?: string | null;
  image_url?: string | null;
  description?: string | null;
  created_at: string;
  farms: FarmSummary[];
};

export type FarmRead = FarmSummary & {
  producer?: ProducerRead | null;
};

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
  coffee?: CoffeeRead | null;
  producer?: ProducerRead | null;
  farm?: FarmRead | null;
};

export type EventRSVPCreate = {
  attendee_name: string;
  attendee_email: string;
  note?: string | null;
};

export type EventRSVPRead = {
  id: number;
  event_session_id: number;
  attendee_name: string;
  attendee_email: string;
  user_id?: string | null;
  note?: string | null;
  created_at: string;
};

export function getApiBaseUrl() {
  const sharedUrl = process.env.EXPO_PUBLIC_CAFEATLAS_API_URL;
  const webUrl = process.env.EXPO_PUBLIC_CAFEATLAS_API_URL_WEB;
  const nativeUrl = process.env.EXPO_PUBLIC_CAFEATLAS_API_URL_NATIVE;

  if (Platform.OS === "web") {
    const configuredUrl = webUrl ?? sharedUrl;
    if (configuredUrl) {
      const normalizedUrl = normalizeWebUrl(configuredUrl);
      if (!isLoopbackUrl(normalizedUrl)) {
        return normalizedUrl;
      }
    }

    return getRuntimeWebApiUrl() ?? normalizeWebUrl(configuredUrl ?? DEFAULT_WEB_API_URL);
  }

  return nativeUrl ?? sharedUrl ?? DEFAULT_NATIVE_API_URL;
}

function getRuntimeWebApiUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const { hostname, protocol } = window.location;
  if (!hostname) {
    return null;
  }

  const url = new URL(DEFAULT_WEB_API_URL);
  url.hostname = hostname;
  url.protocol = protocol === "https:" ? "https:" : "http:";
  return url.toString().replace(/\/$/, "");
}

function normalizeWebUrl(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname === "10.0.2.2") {
      url.hostname = "127.0.0.1";
    }
    return url.toString().replace(/\/$/, "");
  } catch {
    return value;
  }
}

function isLoopbackUrl(value: string) {
  try {
    const url = new URL(value);
    return LOOPBACK_HOSTNAMES.has(url.hostname);
  } catch {
    return false;
  }
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
  if (params.q) url.searchParams.set("q", params.q);
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

export async function prepareCheckout(items: Array<{ coffee_id: number; quantity: number }>): Promise<CheckoutPrepareRead> {
  const response = await fetch(new URL("/api/v1/checkout/prepare", getApiBaseUrl()), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error(`Failed to prepare checkout (${response.status})`);
  }
  return response.json() as Promise<CheckoutPrepareRead>;
}

export async function createOrderDraft(
  items: Array<{ coffee_id: number; quantity: number }>,
  accessToken: string,
): Promise<OrderRead> {
  const response = await fetch(new URL("/api/v1/orders", getApiBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ items }),
  });
  if (!response.ok) {
    throw new Error(`Failed to create order draft (${response.status})`);
  }
  return response.json() as Promise<OrderRead>;
}

export async function fetchOrders(accessToken: string): Promise<OrderRead[]> {
  const response = await fetch(new URL("/api/v1/orders", getApiBaseUrl()), {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to load orders (${response.status})`);
  }
  return response.json() as Promise<OrderRead[]>;
}

export async function updateOrderShipping(
  orderId: number,
  address: {
    recipient_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    region: string;
    postal_code: string;
    country_code: string;
  },
  accessToken: string,
): Promise<OrderRead> {
  const response = await fetch(new URL(`/api/v1/orders/${orderId}/shipping`, getApiBaseUrl()), {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(address),
  });
  if (!response.ok) {
    throw new Error(`Failed to save shipping details (${response.status})`);
  }
  return response.json() as Promise<OrderRead>;
}

export async function createStripeCheckoutSession(
  orderId: number,
  urls: { success_url: string; cancel_url: string },
  accessToken: string,
): Promise<{ order_id: number; session_id: string; checkout_url: string }> {
  const response = await fetch(new URL(`/api/v1/orders/${orderId}/checkout`, getApiBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(urls),
  });
  if (!response.ok) {
    throw new Error(`Failed to start checkout (${response.status})`);
  }
  return response.json();
}

export async function fetchEvents(): Promise<EventSessionRead[]> {
  return fetchJson<EventSessionRead[]>("/api/v1/events?upcoming_only=true");
}

export async function fetchStates(): Promise<StateRead[]> {
  return fetchJson<StateRead[]>("/api/v1/states");
}

export async function fetchEventBySlug(slug: string): Promise<EventSessionRead> {
  return fetchJson<EventSessionRead>(`/api/v1/events/${slug}`);
}

export async function createEventRsvp(slug: string, payload: EventRSVPCreate): Promise<EventRSVPRead> {
  const response = await fetch(new URL(`/api/v1/events/${slug}/rsvps`, getApiBaseUrl()), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(`Failed to save RSVP (${response.status})`);
  }

  return response.json() as Promise<EventRSVPRead>;
}

export async function fetchProducers(q?: string): Promise<ProducerRead[]> {
  const url = new URL("/api/v1/producers", getApiBaseUrl());
  if (q) url.searchParams.set("q", q);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load producers (${response.status})`);
  }
  return response.json() as Promise<ProducerRead[]>;
}

export async function fetchProducerBySlug(slug: string): Promise<ProducerRead> {
  return fetchJson<ProducerRead>(`/api/v1/producers/${slug}`);
}

export async function fetchFarms(q?: string): Promise<FarmRead[]> {
  const url = new URL("/api/v1/farms", getApiBaseUrl());
  if (q) url.searchParams.set("q", q);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load farms (${response.status})`);
  }
  return response.json() as Promise<FarmRead[]>;
}

export async function fetchFarmBySlug(slug: string): Promise<FarmRead> {
  return fetchJson<FarmRead>(`/api/v1/farms/${slug}`);
}

export async function subscribeToNewsletter(email: string): Promise<NewsletterSubscribeResponse> {
  const response = await fetch(new URL("/api/v1/newsletter/subscribe", getApiBaseUrl()), {
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
