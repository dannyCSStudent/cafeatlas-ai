import type { CoffeeRead } from "@/lib/cafeatlas-api";

export const FLAVOR_GENOME_DIMENSIONS = [
  { key: "sweetness", label: "Sweetness", description: "Caramel, sugar, honey, and rounded fruit sweetness." },
  { key: "acidity", label: "Acidity", description: "Bright lift, citrus, and sparkling structure." },
  { key: "chocolate", label: "Chocolate", description: "Cocoa, cacao, and mocha depth." },
  { key: "caramel", label: "Caramel", description: "Toffee, panela, and brown-sugar character." },
  { key: "floral", label: "Floral", description: "Jasmine, rose, and perfumed aromatics." },
  { key: "fruity", label: "Fruity", description: "Berry, stone-fruit, and tropical expression." },
  { key: "nutty", label: "Nutty", description: "Almond, hazelnut, and rounded comfort." },
  { key: "smoky", label: "Smoky", description: "Roast, char, and darker intensity." },
  { key: "body", label: "Body", description: "Weight, texture, and palate fullness." },
  { key: "finish", label: "Finish", description: "Length, cleanliness, and aftertaste clarity." },
  { key: "roast", label: "Roast", description: "Development level and roast depth." },
] as const;

export type FlavorGenomeDimensionKey = (typeof FLAVOR_GENOME_DIMENSIONS)[number]["key"];

export type FlavorGenomeVector = Record<FlavorGenomeDimensionKey, number>;

export type FlavorGenomeEntry = {
  coffee: CoffeeRead;
  vector: FlavorGenomeVector;
  average: number;
  signature: Array<{ key: FlavorGenomeDimensionKey; label: string; value: number }>;
};

const SWEETNESS_KEYWORDS = ["sweet", "sugar", "honey", "caramel", "toffee", "brown sugar", "panela", "rounded"];
const ACIDITY_KEYWORDS = ["bright", "citrus", "lemon", "lime", "grapefruit", "sparkling", "lively", "juicy"];
const CHOCOLATE_KEYWORDS = ["chocolate", "cocoa", "cacao", "mocha"];
const CARAMEL_KEYWORDS = ["caramel", "toffee", "brown sugar", "panela", "butterscotch", "honey"];
const FLORAL_KEYWORDS = ["floral", "jasmine", "rose", "lavender", "honeysuckle", "bergamot", "perfumed"];
const FRUITY_KEYWORDS = ["fruit", "fruity", "berry", "peach", "plum", "apple", "tropical", "stone fruit", "jam"];
const NUTTY_KEYWORDS = ["nutty", "almond", "hazelnut", "peanut", "walnut", "macadamia"];
const SMOKY_KEYWORDS = ["smoky", "smoke", "charcoal", "tobacco", "roast", "baked"];
const BODY_KEYWORDS = ["body", "creamy", "syrupy", "dense", "round", "silky", "structured", "full"];
const FINISH_KEYWORDS = ["finish", "aftertaste", "clean", "lingering", "long", "persistent", "soft", "clear"];
const ROAST_KEYWORDS = ["light", "medium", "balanced", "dark", "roast", "developed", "bold", "deep"];

function normalizeText(value: string) {
  return value.toLowerCase();
}

function clampScore(value: number) {
  return Math.min(100, Math.max(0, Math.round(value)));
}

function matchCount(text: string, keywords: string[]) {
  return keywords.reduce((count, keyword) => count + (text.includes(keyword) ? 1 : 0), 0);
}

function hasAny(text: string, keywords: string[]) {
  return matchCount(text, keywords) > 0;
}

function buildText(coffee: CoffeeRead) {
  return normalizeText(
    [
      coffee.name,
      coffee.slug,
      coffee.origin_state,
      coffee.producer_name,
      coffee.process ?? "",
      coffee.roast_level ?? "",
      coffee.varietal ?? "",
      coffee.tasting_notes ?? "",
      coffee.description ?? "",
    ].join(" ")
  );
}

function buildRoastText(coffee: CoffeeRead) {
  return normalizeText(coffee.roast_level ?? "");
}

function buildProcessText(coffee: CoffeeRead) {
  return normalizeText(coffee.process ?? "");
}

function buildAltitudeText(coffee: CoffeeRead) {
  return typeof coffee.farm?.altitude_meters === "number" ? coffee.farm.altitude_meters : null;
}

export function buildFlavorGenome(coffee: CoffeeRead): FlavorGenomeVector {
  const text = buildText(coffee);
  const roastText = buildRoastText(coffee);
  const processText = buildProcessText(coffee);
  const altitude = buildAltitudeText(coffee);
  const highAltitude = typeof altitude === "number" && altitude >= 1700;
  const elevatedAltitude = typeof altitude === "number" && altitude >= 1500;

  const sweetness =
    26 +
    matchCount(text, SWEETNESS_KEYWORDS) * 8 +
    matchCount(text, FRUITY_KEYWORDS) * 3 +
    (processText.includes("honey") ? 10 : 0) +
    (processText.includes("natural") ? 6 : 0) +
    (roastText.includes("balanced") || roastText.includes("medium") ? 6 : 0) -
    (roastText.includes("dark") ? 6 : 0) +
    (elevatedAltitude ? 4 : 0);

  const acidity =
    24 +
    matchCount(text, ACIDITY_KEYWORDS) * 10 +
    (processText.includes("washed") ? 12 : 0) +
    (roastText.includes("light") ? 8 : 0) +
    (highAltitude ? 8 : 0) -
    (roastText.includes("dark") ? 10 : 0);

  const chocolate =
    18 +
    matchCount(text, CHOCOLATE_KEYWORDS) * 14 +
    (roastText.includes("dark") ? 12 : 0) +
    (roastText.includes("balanced") || roastText.includes("medium") ? 8 : 0) +
    (processText.includes("honey") ? 4 : 0);

  const caramel =
    18 +
    matchCount(text, CARAMEL_KEYWORDS) * 14 +
    (processText.includes("honey") ? 12 : 0) +
    (roastText.includes("balanced") || roastText.includes("medium") ? 8 : 0) +
    (roastText.includes("light") ? 2 : 0);

  const floral =
    16 +
    matchCount(text, FLORAL_KEYWORDS) * 14 +
    (processText.includes("washed") ? 10 : 0) +
    (roastText.includes("light") ? 8 : 0) +
    (highAltitude ? 8 : 0);

  const fruity =
    18 +
    matchCount(text, FRUITY_KEYWORDS) * 12 +
    (processText.includes("natural") ? 12 : 0) +
    (roastText.includes("light") ? 8 : 0) +
    (elevatedAltitude ? 4 : 0);

  const nutty =
    16 +
    matchCount(text, NUTTY_KEYWORDS) * 14 +
    (roastText.includes("balanced") || roastText.includes("medium") ? 8 : 0) +
    (processText.includes("honey") ? 6 : 0);

  const smoky =
    10 +
    matchCount(text, SMOKY_KEYWORDS) * 14 +
    (roastText.includes("dark") ? 16 : 0) +
    (roastText.includes("bold") ? 6 : 0);

  const body =
    22 +
    matchCount(text, BODY_KEYWORDS) * 10 +
    (processText.includes("honey") ? 10 : 0) +
    (processText.includes("natural") ? 10 : 0) +
    (roastText.includes("dark") ? 8 : 0) -
    (processText.includes("washed") ? 4 : 0);

  const finish =
    22 +
    matchCount(text, FINISH_KEYWORDS) * 10 +
    (processText.includes("washed") ? 10 : 0) +
    (highAltitude ? 6 : 0) +
    (roastText.includes("light") ? 4 : 0) +
    (hasAny(text, SWEETNESS_KEYWORDS) ? 4 : 0) -
    (roastText.includes("dark") ? 4 : 0);

  const roast =
    roastText.includes("dark")
      ? 88
      : roastText.includes("light")
        ? 28
        : roastText.includes("medium") || roastText.includes("balanced")
          ? 56
          : 42;

  return {
    sweetness: clampScore(sweetness),
    acidity: clampScore(acidity),
    chocolate: clampScore(chocolate),
    caramel: clampScore(caramel),
    floral: clampScore(floral),
    fruity: clampScore(fruity),
    nutty: clampScore(nutty),
    smoky: clampScore(smoky),
    body: clampScore(body),
    finish: clampScore(finish),
    roast: clampScore(
      roast +
        (matchCount(text, ROAST_KEYWORDS) > 0 ? 4 : 0) +
        (matchCount(text, SMOKY_KEYWORDS) > 0 ? 4 : 0) +
        (typeof altitude === "number" && altitude < 1400 ? 4 : 0)
    ),
  };
}

export function summarizeFlavorGenome(vector: FlavorGenomeVector) {
  return FLAVOR_GENOME_DIMENSIONS.map((dimension) => ({
    key: dimension.key,
    label: dimension.label,
    value: vector[dimension.key],
    description: dimension.description,
  })).sort((left, right) => right.value - left.value);
}

export function buildFlavorGenomeEntry(coffee: CoffeeRead): FlavorGenomeEntry {
  const vector = buildFlavorGenome(coffee);
  const ranked = summarizeFlavorGenome(vector);

  return {
    coffee,
    vector,
    average:
      ranked.reduce((total, dimension) => total + dimension.value, 0) / (ranked.length || FLAVOR_GENOME_DIMENSIONS.length),
    signature: ranked.slice(0, 3).map((dimension) => ({
      key: dimension.key,
      label: dimension.label,
      value: dimension.value,
    })),
  };
}

export function buildGenomeAverage(entries: FlavorGenomeEntry[]): FlavorGenomeVector {
  const total = FLAVOR_GENOME_DIMENSIONS.reduce((accumulator, dimension) => {
    accumulator[dimension.key] = 0;
    return accumulator;
  }, {} as FlavorGenomeVector);

  if (entries.length === 0) {
    return total;
  }

  entries.forEach((entry) => {
    FLAVOR_GENOME_DIMENSIONS.forEach((dimension) => {
      total[dimension.key] += entry.vector[dimension.key];
    });
  });

  FLAVOR_GENOME_DIMENSIONS.forEach((dimension) => {
    total[dimension.key] = clampScore(total[dimension.key] / entries.length);
  });

  return total;
}

export function buildGenomeDeck(coffees: CoffeeRead[]) {
  return coffees
    .map((coffee) => buildFlavorGenomeEntry(coffee))
    .sort((left, right) => right.average - left.average || right.coffee.created_at.localeCompare(left.coffee.created_at));
}

