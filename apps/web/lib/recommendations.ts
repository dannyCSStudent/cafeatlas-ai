import type { CoffeeRead } from "@/lib/cafeatlas-api";
import {
  FLAVOR_GENOME_DIMENSIONS,
  buildFlavorGenomeEntry,
  buildGenomeAverage,
  summarizeFlavorGenome,
  type FlavorGenomeEntry,
  type FlavorGenomeVector,
} from "@/lib/flavor-genome";
import type { FlavorPreference, ProcessPreference, RoastPreference, SommelierPreferences } from "@/lib/sommelier";

export type JournalEntry = {
  rating: number | null;
  favorite: boolean;
  notes: string;
  updatedAt: string;
};

export type JournalStore = Record<string, JournalEntry>;

export type RecommendationProfile = {
  preferenceVector: FlavorGenomeVector;
  learnedVector: FlavorGenomeVector;
  targetVector: FlavorGenomeVector;
  favoriteCount: number;
  ratedCount: number;
  passportCount: number;
  likedStates: string[];
  likedProducers: string[];
  passportStates: string[];
  topTraits: Array<{ key: string; label: string; value: number }>;
  summary: string[];
};

export type RecommendationResult = {
  coffee: CoffeeRead;
  genome: FlavorGenomeEntry;
  similarity: number;
  score: number;
  explorationScore: number;
  reasons: string[];
  crossReasons: string[];
};

const BASE_VECTOR: FlavorGenomeVector = {
  sweetness: 46,
  acidity: 46,
  chocolate: 46,
  caramel: 46,
  floral: 46,
  fruity: 46,
  nutty: 46,
  smoky: 46,
  body: 46,
  finish: 46,
  roast: 46,
};

const ROAST_VECTORS: Record<RoastPreference, FlavorGenomeVector> = {
  light: {
    sweetness: 42,
    acidity: 82,
    chocolate: 18,
    caramel: 24,
    floral: 74,
    fruity: 68,
    nutty: 18,
    smoky: 8,
    body: 30,
    finish: 78,
    roast: 24,
  },
  balanced: {
    sweetness: 68,
    acidity: 52,
    chocolate: 52,
    caramel: 66,
    floral: 38,
    fruity: 44,
    nutty: 50,
    smoky: 20,
    body: 56,
    finish: 60,
    roast: 52,
  },
  dark: {
    sweetness: 44,
    acidity: 24,
    chocolate: 78,
    caramel: 40,
    floral: 16,
    fruity: 22,
    nutty: 42,
    smoky: 82,
    body: 70,
    finish: 34,
    roast: 88,
  },
};

const PROCESS_VECTORS: Record<ProcessPreference, FlavorGenomeVector> = {
  washed: {
    sweetness: 48,
    acidity: 80,
    chocolate: 22,
    caramel: 26,
    floral: 68,
    fruity: 44,
    nutty: 20,
    smoky: 8,
    body: 34,
    finish: 80,
    roast: 36,
  },
  honey: {
    sweetness: 78,
    acidity: 46,
    chocolate: 48,
    caramel: 82,
    floral: 30,
    fruity: 58,
    nutty: 40,
    smoky: 16,
    body: 60,
    finish: 56,
    roast: 48,
  },
  natural: {
    sweetness: 62,
    acidity: 40,
    chocolate: 32,
    caramel: 40,
    floral: 28,
    fruity: 84,
    nutty: 26,
    smoky: 18,
    body: 66,
    finish: 46,
    roast: 44,
  },
};

const FLAVOR_VECTORS: Record<FlavorPreference, FlavorGenomeVector> = {
  bright: {
    sweetness: 52,
    acidity: 84,
    chocolate: 16,
    caramel: 24,
    floral: 60,
    fruity: 58,
    nutty: 20,
    smoky: 8,
    body: 28,
    finish: 80,
    roast: 28,
  },
  floral: {
    sweetness: 46,
    acidity: 72,
    chocolate: 18,
    caramel: 24,
    floral: 86,
    fruity: 48,
    nutty: 18,
    smoky: 8,
    body: 30,
    finish: 74,
    roast: 28,
  },
  fruity: {
    sweetness: 54,
    acidity: 56,
    chocolate: 18,
    caramel: 38,
    floral: 34,
    fruity: 88,
    nutty: 18,
    smoky: 10,
    body: 42,
    finish: 64,
    roast: 32,
  },
  chocolate: {
    sweetness: 58,
    acidity: 28,
    chocolate: 84,
    caramel: 52,
    floral: 18,
    fruity: 28,
    nutty: 42,
    smoky: 36,
    body: 68,
    finish: 44,
    roast: 60,
  },
  sweet: {
    sweetness: 84,
    acidity: 42,
    chocolate: 36,
    caramel: 88,
    floral: 28,
    fruity: 42,
    nutty: 24,
    smoky: 12,
    body: 54,
    finish: 68,
    roast: 40,
  },
  nutty: {
    sweetness: 54,
    acidity: 34,
    chocolate: 48,
    caramel: 58,
    floral: 20,
    fruity: 24,
    nutty: 88,
    smoky: 18,
    body: 66,
    finish: 52,
    roast: 52,
  },
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function weightedAverage(vectors: Array<{ vector: FlavorGenomeVector; weight: number }>) {
  const totalWeight = vectors.reduce((sum, entry) => sum + entry.weight, 0) || 1;

  return FLAVOR_GENOME_DIMENSIONS.reduce((accumulator, dimension) => {
    const value = vectors.reduce((sum, entry) => sum + entry.vector[dimension.key] * entry.weight, 0) / totalWeight;
    accumulator[dimension.key] = clampScore(value);
    return accumulator;
  }, {} as FlavorGenomeVector);
}

function blendBaseVectors(...vectors: FlavorGenomeVector[]) {
  return weightedAverage(vectors.map((vector) => ({ vector, weight: 1 })));
}

function normalizeJournalStore(journalStore: JournalStore) {
  const cleaned: JournalStore = {};

  for (const [slug, entry] of Object.entries(journalStore)) {
    const rating =
      typeof entry.rating === "number" && Number.isFinite(entry.rating)
        ? Math.min(5, Math.max(1, Math.round(entry.rating)))
        : null;

    cleaned[slug] = {
      rating,
      favorite: Boolean(entry.favorite),
      notes: typeof entry.notes === "string" ? entry.notes : "",
      updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString(),
    };
  }

  return cleaned;
}

function preferenceVector(preferences: SommelierPreferences) {
  return blendBaseVectors(BASE_VECTOR, ROAST_VECTORS[preferences.roast], PROCESS_VECTORS[preferences.process], FLAVOR_VECTORS[preferences.flavor]);
}

function normalizeState(value: string) {
  return slugify(value);
}

function averageGenomeEntries(entries: FlavorGenomeEntry[]) {
  if (entries.length === 0) {
    return null;
  }

  return buildGenomeAverage(entries);
}

export function buildRecommendationProfile(
  coffees: CoffeeRead[],
  journalStore: JournalStore,
  passportStates: string[],
  preferences: SommelierPreferences
): RecommendationProfile {
  const normalizedJournal = normalizeJournalStore(journalStore);
  const likedSlugs = Object.entries(normalizedJournal)
    .filter(([, entry]) => entry.favorite || (typeof entry.rating === "number" && entry.rating >= 4))
    .map(([slug]) => slug);
  const likedCoffees = coffees.filter((coffee) => likedSlugs.includes(coffee.slug));
  const likedEntries = likedCoffees.map((coffee) => buildFlavorGenomeEntry(coffee));
  const learnedVector = averageGenomeEntries(likedEntries) ?? preferenceVector(preferences);
  const preferenceTarget = preferenceVector(preferences);
  const learnedWeight = likedEntries.length > 0 ? Math.min(0.75, 0.45 + likedEntries.length * 0.08) : 0;
  const targetVector =
    likedEntries.length > 0
      ? weightedAverage([
          { vector: learnedVector, weight: learnedWeight },
          { vector: preferenceTarget, weight: 1 - learnedWeight },
        ])
      : preferenceTarget;
  const likedStates = unique(likedCoffees.map((coffee) => normalizeState(coffee.origin_state)));
  const likedProducers = unique(
    likedCoffees.map((coffee) => coffee.producer?.slug ?? slugify(coffee.producer_name))
  );
  const favoriteCount = likedCoffees.length;
  const ratedCount = Object.values(normalizedJournal).filter((entry) => entry.rating !== null).length;
  const passportCount = passportStates.length;
  const topTraits = summarizeFlavorGenome(targetVector).slice(0, 4).map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    value: dimension.value,
  }));

  const summary = unique([
    favoriteCount ? `${favoriteCount} favorite coffees shape the profile.` : "",
    ratedCount ? `${ratedCount} rated coffees inform the model.` : "",
    passportCount ? `${passportCount} states are recorded in the passport.` : "",
    `Preferences lean toward ${preferences.roast} roast, ${preferences.process} process, and ${preferences.flavor} notes.`,
  ]);

  return {
    preferenceVector: preferenceTarget,
    learnedVector,
    targetVector,
    favoriteCount,
    ratedCount,
    passportCount,
    likedStates,
    likedProducers,
    passportStates: unique(passportStates.map(normalizeState)),
    topTraits,
    summary,
  };
}

function similarityScore(candidate: FlavorGenomeVector, target: FlavorGenomeVector) {
  const totalDifference = FLAVOR_GENOME_DIMENSIONS.reduce(
    (sum, dimension) => sum + Math.abs(candidate[dimension.key] - target[dimension.key]),
    0
  );

  return clampScore(100 - totalDifference / FLAVOR_GENOME_DIMENSIONS.length);
}

function scoreCandidate(
  coffee: CoffeeRead,
  profile: RecommendationProfile,
  mode: "personal" | "cross"
): RecommendationResult {
  const genome = buildFlavorGenomeEntry(coffee);
  const similarity = similarityScore(genome.vector, profile.targetVector);
  const stateSlug = normalizeState(coffee.origin_state);
  const producerSlug = coffee.producer?.slug ?? slugify(coffee.producer_name);
  const stateMatch = profile.likedStates.includes(stateSlug);
  const producerMatch = profile.likedProducers.includes(producerSlug);
  const passportMatch = profile.passportStates.includes(stateSlug);

  const explorationScore =
    (stateMatch ? 0 : 10) + (producerMatch ? 0 : 6) + (passportMatch ? 0 : 4) + (coffee.is_featured ? 2 : 0);

  const score =
    mode === "personal"
      ? clampScore(similarity * 0.82 + (stateMatch ? 7 : 0) + (producerMatch ? 5 : 0) + (passportMatch ? 3 : 0))
      : clampScore(similarity * 0.7 + explorationScore);

  const targetTraits = new Set(profile.topTraits.slice(0, 3).map((trait) => trait.label));
  const signatureLabels = genome.signature.map((dimension) => dimension.label);
  const sharedTraits = signatureLabels.filter((label) => targetTraits.has(label));
  const reasons = unique([
    sharedTraits.length ? `Shares ${sharedTraits.slice(0, 2).join(" and ")} with your learned profile.` : "",
    stateMatch ? "This state appears in your favorite coffees." : "",
    passportMatch ? "You've already explored this state in the passport." : "",
    producerMatch ? "It keeps you with a producer you already enjoy." : "",
    coffee.process ? `Process cue: ${coffee.process}.` : "",
  ]).slice(0, 3);

  const crossReasons = unique([
    stateMatch ? "" : "Different state from your recent favorites.",
    passportMatch ? "" : "Expands beyond the states already in your passport.",
    producerMatch ? "" : "New producer relative to your current favorites.",
    `Still echoes ${genome.signature[0]?.label.toLowerCase() ?? "the top flavor traits"} in the cup.`,
  ]).slice(0, 3);

  return {
    coffee,
    genome,
    similarity,
    score,
    explorationScore,
    reasons,
    crossReasons,
  };
}

export function rankPersonalRecommendations(coffees: CoffeeRead[], profile: RecommendationProfile) {
  return coffees
    .map((coffee) => scoreCandidate(coffee, profile, "personal"))
    .sort((left, right) => right.score - left.score || right.coffee.created_at.localeCompare(left.coffee.created_at))
    .slice(0, 6);
}

export function rankCrossRecommendations(coffees: CoffeeRead[], profile: RecommendationProfile) {
  return coffees
    .map((coffee) => scoreCandidate(coffee, profile, "cross"))
    .filter((result) => !profile.likedStates.includes(normalizeState(result.coffee.origin_state)) || !profile.likedProducers.includes(result.coffee.producer?.slug ?? slugify(result.coffee.producer_name)))
    .sort((left, right) => right.score - left.score || right.coffee.created_at.localeCompare(left.coffee.created_at))
    .slice(0, 4);
}

