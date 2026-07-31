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
  "Seasonal notes",
  "Glossary",
  "Brew methods",
  "Roast notes",
] as const;

export const LEARN_FILTERS = [
  "All",
  "Reading guide",
  "Editorial note",
  "Glossary",
  "Brew note",
  "Roast note",
] as const;
