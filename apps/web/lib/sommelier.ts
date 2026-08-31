import type { CoffeeRead } from "@/lib/cafeatlas-api";

export const SOMMELIER_STORAGE_KEY = "cafeatlas-sommelier-state";

export type RoastPreference = "light" | "balanced" | "dark";
export type ProcessPreference = "washed" | "honey" | "natural";
export type FlavorPreference = "bright" | "floral" | "fruity" | "chocolate" | "sweet" | "nutty";

export type SommelierPreferences = {
  roast: RoastPreference;
  process: ProcessPreference;
  flavor: FlavorPreference;
};

export type SommelierMessageRole = "user" | "assistant";

export type SommelierMessage = {
  id: string;
  role: SommelierMessageRole;
  content: string;
  createdAt: string;
  recommendations?: string[];
};

export type SommelierStore = {
  preferences: SommelierPreferences;
  messages: SommelierMessage[];
};

export type SommelierRecommendation = {
  coffee: CoffeeRead;
  score: number;
  reasons: string[];
  tastingCue: string;
};

export const defaultSommelierPreferences: SommelierPreferences = {
  roast: "balanced",
  process: "washed",
  flavor: "bright",
};

export const defaultSommelierStore: SommelierStore = {
  preferences: defaultSommelierPreferences,
  messages: [],
};

const flavorKeywords: Record<FlavorPreference, string[]> = {
  bright: ["bright", "clean", "crisp", "citrus", "tea", "sparkling", "lively"],
  floral: ["floral", "jasmine", "rose", "lavender", "aromatic"],
  fruity: ["fruit", "fruity", "berry", "stone", "tropical", "jam", "citrus", "peach", "plum"],
  chocolate: ["chocolate", "cocoa", "mocha", "cacao"],
  sweet: ["sweet", "caramel", "honey", "brown sugar", "toffee", "dessert"],
  nutty: ["nutty", "almond", "hazelnut", "peanut", "walnut"],
};

const roastKeywords: Record<RoastPreference, string[]> = {
  light: ["light", "bright", "delicate", "high-toned", "floral"],
  balanced: ["medium", "balanced", "round", "sweet", "caramel", "chocolate"],
  dark: ["dark", "roast", "bold", "smoky", "cocoa", "deep"],
};

const processKeywords: Record<ProcessPreference, string[]> = {
  washed: ["washed", "clean", "clarity", "sparkling", "floral"],
  honey: ["honey", "sweet", "caramel", "round", "creamy"],
  natural: ["natural", "fruit", "berry", "jam", "tropical", "funky"],
};

function normalize(text: string) {
  return text.toLowerCase();
}

function unique(values: string[]) {
  return [...new Set(values.filter(Boolean))];
}

function collectCoffeeText(coffee: CoffeeRead) {
  return normalize(
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

function matchKeywords(text: string, keywords: string[]) {
  return keywords.filter((keyword) => text.includes(keyword));
}

function scoreMatches(text: string, keywords: string[], points: number) {
  return matchKeywords(text, keywords).length > 0 ? points : 0;
}

function roastHint(preference: RoastPreference) {
  switch (preference) {
    case "light":
      return "lighter roast character with clearer structure";
    case "dark":
      return "deeper roast tone with more body";
    case "balanced":
    default:
      return "balanced sweetness and structure";
  }
}

function processHint(preference: ProcessPreference) {
  switch (preference) {
    case "washed":
      return "cleaner extraction and more definition";
    case "honey":
      return "rounder sweetness and a fuller middle";
    case "natural":
      return "more fruit depth and a softer finish";
  }
}

function flavorHint(preference: FlavorPreference) {
  switch (preference) {
    case "bright":
      return "bright, crisp acidity";
    case "floral":
      return "floral aromatics";
    case "fruity":
      return "fruit-forward notes";
    case "chocolate":
      return "cocoa and chocolate depth";
    case "sweet":
      return "caramel and sugar sweetness";
    case "nutty":
      return "nutty, rounded comfort";
  }
}

function buildBrewCue(coffee: CoffeeRead) {
  const process = normalize(coffee.process ?? "");
  const roast = normalize(coffee.roast_level ?? "");

  if (process.includes("washed")) {
    return "Best as a pour-over or AeroPress for clarity.";
  }

  if (process.includes("natural")) {
    return "Works well in immersion or a fuller-body brew.";
  }

  if (process.includes("honey")) {
    return "Try a balanced brew that keeps sweetness intact.";
  }

  if (roast.includes("dark")) {
    return "Best in fuller extraction methods that keep structure.";
  }

  return "Start with a clean brew and adjust grind for sweetness.";
}

function scoreCoffee(coffee: CoffeeRead, preferences: SommelierPreferences, prompt: string) {
  const text = collectCoffeeText(coffee);
  const promptText = normalize(prompt);
  let score = coffee.is_featured ? 4 : 0;
  const reasons: string[] = [];

  const roastScore = scoreMatches(text, roastKeywords[preferences.roast], 24);
  if (roastScore > 0) {
    score += roastScore;
    reasons.push(`Matches your ${preferences.roast} roast preference.`);
  }

  const processScore = scoreMatches(text, processKeywords[preferences.process], 22);
  if (processScore > 0) {
    score += processScore;
    reasons.push(`Process leans toward ${preferences.process} style cups.`);
  }

  const flavorScore = scoreMatches(text, flavorKeywords[preferences.flavor], 20);
  if (flavorScore > 0) {
    score += flavorScore;
    reasons.push(`Tasting cues suggest ${flavorHint(preferences.flavor)}.`);
  }

  const promptKeywords = unique(
    Object.values(flavorKeywords).flatMap((keywords) => keywords.filter((keyword) => promptText.includes(keyword)))
  );

  if (promptKeywords.length > 0) {
    score += Math.min(20, promptKeywords.length * 6);
    reasons.push(`Your prompt mentioned ${promptKeywords.slice(0, 3).join(", ")}.`);
  }

  const promptTokens = unique(
    promptText
      .split(/[^a-z0-9]+/g)
      .map((token) => token.trim())
      .filter((token) => token.length > 3)
  );

  if (promptTokens.length > 0) {
    const textualHits = promptTokens.filter((token) => text.includes(token));
    if (textualHits.length > 0) {
      score += Math.min(18, textualHits.length * 4);
      reasons.push(`The catalog copy overlaps with ${textualHits.slice(0, 3).join(", ")}.`);
    }
  }

  if (score === 0) {
    score = 1;
  }

  return {
    coffee,
    score,
    reasons: unique(reasons).slice(0, 3),
    tastingCue: buildBrewCue(coffee),
  };
}

export function rankCoffees(
  coffees: CoffeeRead[],
  preferences: SommelierPreferences,
  prompt: string
): SommelierRecommendation[] {
  return coffees
    .map((coffee) => scoreCoffee(coffee, preferences, prompt))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return right.coffee.created_at.localeCompare(left.coffee.created_at);
    })
    .slice(0, 4);
}

export function buildAssistantReply(
  preferences: SommelierPreferences,
  prompt: string,
  recommendations: SommelierRecommendation[]
) {
  const promptText = prompt.trim();
  const lead = promptText
    ? `I heard "${promptText}".`
    : "I am using your saved taste preferences to narrow the catalog.";
  const preferenceLine = `I am leaning toward ${preferences.roast} roast, ${preferences.process} process, and ${flavorHint(
    preferences.flavor
  )}. That usually means ${roastHint(preferences.roast)} and ${processHint(preferences.process)}.`;
  const topLine = recommendations.length
    ? `Best starting points: ${recommendations
        .slice(0, 3)
        .map((item) => item.coffee.name)
        .join(", ")}.`
    : "I need more catalog entries to make a recommendation.";

  return `${lead} ${preferenceLine} ${topLine}`;
}

export function buildConversationStarter(preferences: SommelierPreferences) {
  return `Tell me what you want and I will keep the response anchored to ${preferences.roast}, ${preferences.process}, and ${flavorHint(
    preferences.flavor
  )}.`;
}
