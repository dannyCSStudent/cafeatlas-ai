export const LEARN_ARTICLES = [
  {
    href: "/learn/how-to-read-a-coffee-profile",
    title: "How to read a coffee profile",
    body: "A quick guide to the anatomy of a coffee detail page.",
    tag: "Reading guide",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/how-to-choose-a-coffee",
    title: "How to choose a coffee",
    body: "A practical note for matching the catalog to the cup you want.",
    tag: "Reading guide",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-to-filter-the-catalog",
    title: "How to filter the catalog",
    body: "A guide for narrowing the live catalog with search, state, producer, and featured filters.",
    tag: "Editorial note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-sourcing-works",
    title: "How sourcing works",
    body: "A note on how producer and farm relationships shape the catalog.",
    tag: "Origin note",
    readTime: "2 min",
    updated: "Aug 1, 2026",
  },
  {
    href: "/learn/how-to-compare-coffee-profiles",
    title: "How to compare coffee profiles",
    body: "A guide for reading two coffees side by side without losing the origin story.",
    tag: "Comparison note",
    readTime: "2 min",
    updated: "Aug 1, 2026",
  },
  {
    href: "/learn/how-to-taste-a-coffee",
    title: "How to taste a coffee",
    body: "A sensory note for reading sweetness, acidity, and structure with more clarity.",
    tag: "Sensory note",
    readTime: "2 min",
    updated: "Aug 1, 2026",
  },
  {
    href: "/learn/how-to-read-acidity",
    title: "How to read acidity",
    body: "A sensory note for reading brightness, lift, and structure in the cup.",
    tag: "Sensory note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-to-read-sweetness",
    title: "How to read sweetness",
    body: "A sensory note for finding sweetness as structure rather than just a flavor word.",
    tag: "Sensory note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-to-read-body",
    title: "How to read body",
    body: "A sensory note for understanding weight, texture, and how the cup fills out.",
    tag: "Sensory note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-to-read-varietal",
    title: "How to read varietal",
    body: "A reading note for understanding varietal as context instead of a label alone.",
    tag: "Reading guide",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/how-to-store-coffee",
    title: "How to store coffee",
    body: "A freshness note on bags, timing, and what to keep in mind after a roast date.",
    tag: "Editorial note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/seasonal-notes",
    title: "Seasonal notes",
    body: "A companion note about freshness, rotation, and what changes in the cup.",
    tag: "Editorial note",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/tasting-notes-glossary",
    title: "Tasting notes glossary",
    body: "A short glossary for reading tasting language with less mystery.",
    tag: "Glossary",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/brew-methods-and-extraction",
    title: "Brew methods and extraction",
    body: "A practical note about how brewing changes what you taste and why it matters.",
    tag: "Brew note",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/how-to-brew-for-clarity",
    title: "How to brew for clarity",
    body: "A brew note for dialing in cups that read cleaner, brighter, and more focused.",
    tag: "Brew note",
    readTime: "2 min",
    updated: "Aug 2, 2026",
  },
  {
    href: "/learn/roast-development-and-balance",
    title: "Roast development and balance",
    body: "A short note on how roast level shifts sweetness, structure, and balance in the cup.",
    tag: "Roast note",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
] as const satisfies readonly {
  href: string;
  title: string;
  body: string;
  tag: string;
  readTime: string;
  updated: string;
}[];

export type LearnArticle = (typeof LEARN_ARTICLES)[number];

export const LEARN_RECOMMENDED_ORDER = [
  "Reading guide",
  "Choose coffee",
  "Catalog filters",
  "Origin note",
  "Comparison note",
  "Sensory note",
  "Sweetness",
  "Body",
  "Varietal",
  "Store coffee",
  "Seasonal notes",
  "Glossary",
  "Brew methods",
  "Brew clarity",
  "Roast notes",
] as const;

export const LEARN_FILTERS = [
  "All",
  "Reading guide",
  "Origin note",
  "Comparison note",
  "Sensory note",
  "Editorial note",
  "Glossary",
  "Brew note",
  "Roast note",
] as const;
