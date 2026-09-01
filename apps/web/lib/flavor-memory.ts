import type { CoffeeRead } from "@/lib/cafeatlas-api";
import { buildFlavorGenomeEntry, summarizeFlavorGenome, type FlavorGenomeVector } from "@/lib/flavor-genome";
import type { JournalStore } from "@/lib/recommendations";

export const FLAVOR_MEMORY_STORAGE_KEY = "cafeatlas-flavor-memory";

export type FlavorMemoryKind = "purchase" | "brew" | "rating" | "favorite";

export type BrewMethod =
  | "pour-over"
  | "aeropress"
  | "espresso"
  | "french-press"
  | "drip"
  | "cold-brew"
  | "moka-pot"
  | "immersion";

export type FlavorMemoryEntry = {
  id: string;
  coffeeSlug: string;
  kind: Exclude<FlavorMemoryKind, "rating" | "favorite">;
  brewMethod: BrewMethod;
  note: string;
  createdAt: string;
};

export type FlavorMemoryStore = {
  entries: FlavorMemoryEntry[];
};

export type FlavorMemoryEvent = {
  id: string;
  coffeeSlug: string;
  coffeeName: string;
  originState: string;
  producerName: string;
  kind: FlavorMemoryKind;
  brewMethod: BrewMethod | null;
  note: string;
  createdAt: string;
  rating: number | null;
  weight: number;
};

export type FlavorMemoryInsight = {
  events: FlavorMemoryEvent[];
  memoryVector: FlavorGenomeVector;
  earlyVector: FlavorGenomeVector;
  recentVector: FlavorGenomeVector;
  topTraits: Array<{ key: string; label: string; value: number }>;
  evolution: Array<{ key: string; label: string; delta: number }>;
  brewMethods: Array<{ method: BrewMethod; count: number }>;
  summary: string[];
  purchaseCount: number;
  ratingCount: number;
  favoriteCount: number;
  brewCount: number;
  memoryCount: number;
  coffeeCount: number;
};

export const BREW_METHOD_OPTIONS: Array<{ value: BrewMethod; label: string; description: string }> = [
  { value: "pour-over", label: "Pour-over", description: "Clean extraction and clear structure" },
  { value: "aeropress", label: "AeroPress", description: "Compact, adaptable, and balanced" },
  { value: "espresso", label: "Espresso", description: "Intense and concentrated" },
  { value: "french-press", label: "French press", description: "Rounded body and texture" },
  { value: "drip", label: "Drip", description: "Classic filtered clarity" },
  { value: "cold-brew", label: "Cold brew", description: "Soft and low-acid" },
  { value: "moka-pot", label: "Moka pot", description: "Dense and expressive" },
  { value: "immersion", label: "Immersion", description: "Full contact and more body" },
];

const METHOD_WEIGHTS: Record<BrewMethod, number> = {
  "pour-over": 1,
  aeropress: 0.95,
  espresso: 1.2,
  "french-press": 0.9,
  drip: 0.85,
  "cold-brew": 0.8,
  "moka-pot": 1.05,
  immersion: 0.88,
};

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightedAverage(vectors: Array<{ vector: FlavorGenomeVector; weight: number }>) {
  const totalWeight = vectors.reduce((sum, entry) => sum + entry.weight, 0) || 1;

  return Object.keys(vectors[0]?.vector ?? {}).reduce((accumulator, key) => {
    const dimension = key as keyof FlavorGenomeVector;
    const value = vectors.reduce((sum, entry) => sum + entry.vector[dimension] * entry.weight, 0) / totalWeight;
    accumulator[dimension] = clampScore(value);
    return accumulator;
  }, {} as FlavorGenomeVector);
}

function emptyVector() {
  return {
    sweetness: 0,
    acidity: 0,
    chocolate: 0,
    caramel: 0,
    floral: 0,
    fruity: 0,
    nutty: 0,
    smoky: 0,
    body: 0,
    finish: 0,
    roast: 0,
  } satisfies FlavorGenomeVector;
}

function normalizeMemoryEntry(entry: Partial<FlavorMemoryEntry>): FlavorMemoryEntry | null {
  if (
    typeof entry.id !== "string" ||
    typeof entry.coffeeSlug !== "string" ||
    typeof entry.kind !== "string" ||
    typeof entry.brewMethod !== "string" ||
    typeof entry.createdAt !== "string"
  ) {
    return null;
  }

  return {
    id: entry.id,
    coffeeSlug: entry.coffeeSlug,
    kind: entry.kind === "brew" || entry.kind === "purchase" ? entry.kind : "brew",
    brewMethod: (BREW_METHOD_OPTIONS.find((option) => option.value === entry.brewMethod)?.value ?? "pour-over") as BrewMethod,
    note: typeof entry.note === "string" ? entry.note : "",
    createdAt: entry.createdAt,
  };
}

export function readFlavorMemorySnapshot() {
  if (typeof window === "undefined") {
    return JSON.stringify({ entries: [] } satisfies FlavorMemoryStore);
  }

  return window.localStorage.getItem(FLAVOR_MEMORY_STORAGE_KEY) ?? JSON.stringify({ entries: [] } satisfies FlavorMemoryStore);
}

export function parseFlavorMemoryStore(snapshot: string): FlavorMemoryStore {
  try {
    const parsed = JSON.parse(snapshot) as Partial<FlavorMemoryStore> | unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { entries: [] };
    }

    const rawEntries = (parsed as Record<string, unknown>).entries;
    if (!Array.isArray(rawEntries)) {
      return { entries: [] };
    }

    const entries = rawEntries.map((entry) => normalizeMemoryEntry(entry as Partial<FlavorMemoryEntry>));

    return {
      entries: entries.filter((entry): entry is FlavorMemoryEntry => Boolean(entry)),
    };
  } catch {
    return { entries: [] };
  }
}

export function writeFlavorMemoryStore(store: FlavorMemoryStore) {
  window.localStorage.setItem(FLAVOR_MEMORY_STORAGE_KEY, JSON.stringify(store));
}

export function subscribeToFlavorMemory(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === FLAVOR_MEMORY_STORAGE_KEY) {
      callback();
    }
  };

  const handleCustomEvent = () => callback();

  window.addEventListener("storage", handleStorage);
  window.addEventListener(FLAVOR_MEMORY_STORAGE_KEY, handleCustomEvent);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(FLAVOR_MEMORY_STORAGE_KEY, handleCustomEvent);
  };
}

function getCoffeeMap(coffees: CoffeeRead[]) {
  return new Map(coffees.map((coffee) => [coffee.slug, coffee] as const));
}

function buildImportedEvents(coffees: CoffeeRead[], journalStore: JournalStore) {
  const lookup = getCoffeeMap(coffees);

  return Object.entries(journalStore)
    .map(([slug, entry]) => {
      const coffee = lookup.get(slug);
      if (!coffee) {
        return null;
      }

      const kind: FlavorMemoryKind = entry.favorite ? "favorite" : entry.rating !== null ? "rating" : "brew";
      const note =
        kind === "favorite"
          ? "Marked as a favorite in the journal."
          : kind === "rating"
            ? `Rated ${entry.rating}/5 in the journal.`
            : "Captured in the journal.";

      return {
        id: `journal-${slug}-${entry.updatedAt}`,
        coffeeSlug: coffee.slug,
        coffeeName: coffee.name,
        originState: coffee.origin_state,
        producerName: coffee.producer_name,
        kind,
        brewMethod: null,
        note,
        createdAt: entry.updatedAt,
        rating: entry.rating,
        weight: entry.favorite ? 1.45 : entry.rating !== null ? 0.9 + entry.rating * 0.14 : 0.85,
      } satisfies FlavorMemoryEvent;
    })
    .filter(Boolean) as FlavorMemoryEvent[];
}

function buildManualEvents(coffees: CoffeeRead[], store: FlavorMemoryStore) {
  const lookup = getCoffeeMap(coffees);

  return store.entries
    .map((entry) => {
      const coffee = lookup.get(entry.coffeeSlug);
      if (!coffee) {
        return null;
      }

      return {
        id: entry.id,
        coffeeSlug: coffee.slug,
        coffeeName: coffee.name,
        originState: coffee.origin_state,
        producerName: coffee.producer_name,
        kind: entry.kind,
        brewMethod: entry.brewMethod,
        note: entry.note,
        createdAt: entry.createdAt,
        rating: null,
        weight: METHOD_WEIGHTS[entry.brewMethod],
      } satisfies FlavorMemoryEvent;
    })
    .filter(Boolean) as FlavorMemoryEvent[];
}

function buildWeightedGenome(events: FlavorMemoryEvent[]) {
  if (events.length === 0) {
    return emptyVector();
  }

  const weighted = events.map((event, index) => {
    const genome = buildFlavorGenomeEntry({
      id: index,
      producer_id: null,
      farm_id: null,
      name: event.coffeeName,
      slug: event.coffeeSlug,
      origin_state: event.originState,
      producer_name: event.producerName,
      price_cents: 0,
      is_featured: false,
      created_at: event.createdAt,
    });

    const recencyWeight = 0.85 + (index / Math.max(events.length - 1, 1)) * 0.4;
    return {
      vector: genome.vector,
      weight: event.weight * recencyWeight,
    };
  });

  return weightedAverage(weighted);
}

function buildGenomeSlice(events: FlavorMemoryEvent[]) {
  if (events.length === 0) {
    return emptyVector();
  }

  return buildWeightedGenome(events);
}

function getEvolution(earlyVector: FlavorGenomeVector, recentVector: FlavorGenomeVector) {
  return summarizeFlavorGenome(recentVector)
    .map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      delta: recentVector[dimension.key] - earlyVector[dimension.key],
    }))
    .sort((left, right) => Math.abs(right.delta) - Math.abs(left.delta))
    .slice(0, 4);
}

function getBrewMethods(events: FlavorMemoryEvent[]) {
  const counts = new Map<BrewMethod, number>();

  events.forEach((event) => {
    if (!event.brewMethod) {
      return;
    }

    counts.set(event.brewMethod, (counts.get(event.brewMethod) ?? 0) + 1);
  });

  return BREW_METHOD_OPTIONS.map((option) => ({
    method: option.value,
    count: counts.get(option.value) ?? 0,
  })).filter((entry) => entry.count > 0);
}

export function buildFlavorMemoryInsight(
  coffees: CoffeeRead[],
  journalStore: JournalStore,
  store: FlavorMemoryStore
): FlavorMemoryInsight {
  const importedEvents = buildImportedEvents(coffees, journalStore);
  const manualEvents = buildManualEvents(coffees, store);
  const events = [...importedEvents, ...manualEvents].sort(
    (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
  );

  const memoryVector = buildWeightedGenome(events);
  const midPoint = Math.max(1, Math.floor(events.length / 2));
  const earlyVector = buildGenomeSlice(events.slice(0, midPoint));
  const recentVector = buildGenomeSlice(events.slice(-midPoint));
  const topTraits = summarizeFlavorGenome(memoryVector).slice(0, 4).map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    value: dimension.value,
  }));
  const evolution = getEvolution(earlyVector, recentVector);
  const brewMethods = getBrewMethods(manualEvents);
  const favoriteCount = importedEvents.filter((event) => event.kind === "favorite").length;
  const ratingCount = importedEvents.filter((event) => event.kind === "rating").length;
  const purchaseCount = manualEvents.filter((event) => event.kind === "purchase").length;
  const brewCount = manualEvents.filter((event) => event.kind === "brew").length;
  const coffeeCount = unique(events.map((event) => event.coffeeSlug)).length;

  const summary = [
    events.length > 0 ? `${events.length} memory events are shaping the model.` : "No flavor memory has been recorded yet.",
    favoriteCount > 0 ? `${favoriteCount} favorite coffees are feeding the memory lane.` : "Favorites will sharpen the learned profile.",
    ratingCount > 0 ? `${ratingCount} journal ratings are contributing taste evidence.` : "Ratings will teach the engine what consistency looks like.",
    purchaseCount > 0 ? `${purchaseCount} purchase logs are preserved for future comparisons.` : "Purchase logs can be recorded from the memory form.",
    brewCount > 0 ? `${brewCount} brew sessions capture how method changes the cup.` : "Brew sessions will show how method changes the cup.",
  ];

  return {
    events,
    memoryVector,
    earlyVector,
    recentVector,
    topTraits,
    evolution,
    brewMethods,
    summary,
    purchaseCount,
    ratingCount,
    favoriteCount,
    brewCount,
    memoryCount: events.length,
    coffeeCount,
  };
}
