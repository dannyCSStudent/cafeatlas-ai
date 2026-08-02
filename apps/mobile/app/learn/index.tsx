import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { LEARN_ARTICLES, LEARN_FILTERS, LEARN_RECOMMENDED_ORDER } from "@repo/ui/learn";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { LearnArticleCard } from "@/components/learn-article-card";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type LearnFilter = (typeof LEARN_FILTERS)[number];
type LearnSortMode = "recommended" | "latest";

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseFilter(value: string | string[] | undefined): LearnFilter {
  const resolved = firstParam(value);
  return LEARN_FILTERS.includes(resolved as LearnFilter) ? (resolved as LearnFilter) : "All";
}

function parseSortMode(value: string | string[] | undefined): LearnSortMode {
  return firstParam(value) === "latest" ? "latest" : "recommended";
}

export default function LearnHubScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const searchParams = useLocalSearchParams<{ filter?: string; sort?: string }>();
  const activeFilter = parseFilter(searchParams.filter);
  const sortMode = parseSortMode(searchParams.sort);
  const filteredArticles = useMemo(
    () => (activeFilter === "All" ? LEARN_ARTICLES : LEARN_ARTICLES.filter((article) => article.tag === activeFilter)),
    [activeFilter]
  );
  const displayedArticles = useMemo(
    () => (sortMode === "recommended" ? filteredArticles : [...filteredArticles].reverse()),
    [filteredArticles, sortMode]
  );
  function updateRoute(next: { filter?: LearnFilter; sort?: LearnSortMode }) {
    const params: { filter?: string; sort?: string } = {};
    const filter = next.filter ?? activeFilter;
    const nextSort = next.sort ?? sortMode;

    if (filter !== "All") params.filter = filter;
    if (nextSort !== "recommended") params.sort = nextSort;

    router.replace({ pathname: "/learn", params });
  }
  const quickLinks = [
    { label: "Reading guide", href: "/learn/how-to-read-a-coffee-profile" },
    { label: "Choose a coffee", href: "/learn/how-to-choose-a-coffee" },
    { label: "Filter catalog", href: "/learn/how-to-filter-the-catalog" },
    { label: "Sourcing note", href: "/learn/how-sourcing-works" },
    { label: "Compare coffees", href: "/learn/how-to-compare-coffee-profiles" },
    { label: "Taste a coffee", href: "/learn/how-to-taste-a-coffee" },
    { label: "Read acidity", href: "/learn/how-to-read-acidity" },
    { label: "Store coffee", href: "/learn/how-to-store-coffee" },
    { label: "Brew clarity", href: "/learn/how-to-brew-for-clarity" },
    { label: "Seasonal notes", href: "/learn/seasonal-notes" },
    { label: "Glossary", href: "/learn/tasting-notes-glossary" },
    { label: "Brew methods", href: "/learn/brew-methods-and-extraction" },
    { label: "Roast notes", href: "/learn/roast-development-and-balance" },
    { label: "About", href: "/about" },
    { label: "Catalog", href: "/" },
  ] as const;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailScreenShell
        loading={false}
        error={null}
        loadingTitle="Loading..."
        errorTitle="Could not load page."
        actions={
          <>
            <Pressable
              onPress={() => router.push("/")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/about")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">About</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaGlow, { backgroundColor: theme.accent }]} />
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  {cafeAtlasBrand.monogram}
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Learn hub</ThemedText>
              <ThemedText type="subtitle">Editorial pieces in one place</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                Use the hub to move between profile reading, sourcing, comparison, tasting, freshness, seasonal
                change, brew language, clarity, and roast balance.
              </ThemedText>
            </View>
          </View>
        }
        title="Learn hub"
        description="A central place for the editorial pieces that explain the catalog."
        topStats={[
          { label: "Articles", value: String(displayedArticles.length) },
          { label: "Focus", value: "Origin" },
        ]}
        bottomStats={[
          { label: "Use with", value: "Catalog" },
          { label: "Read time", value: "1 min" },
        ]}
      >
        <View style={styles.section}>
          <View style={[styles.filterBar, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
            <ThemedText type="subtitle">Filter articles</ThemedText>
            <View style={styles.chips}>
              {LEARN_FILTERS.map((item) => {
                const isActive = item === activeFilter;

                return (
                  <Pressable
                    key={item}
                    onPress={() => updateRoute({ filter: item })}
                    style={[
                      styles.chip,
                      {
                        borderColor: theme.border,
                        backgroundColor: isActive ? theme.accent : theme.surfaceStrong,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        {
                          color: isActive ? theme.accentForeground : theme.mutedText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item}
                    </ThemedText>
                </Pressable>
              );
              })}
            </View>
            <View style={styles.chips}>
              {[
                { label: "Recommended", value: "recommended" as const },
                { label: "Latest", value: "latest" as const },
              ].map((item) => {
                const isActive = item.value === sortMode;

                return (
                  <Pressable
                    key={item.value}
                    onPress={() => updateRoute({ sort: item.value })}
                    style={[
                      styles.chip,
                      {
                        borderColor: theme.border,
                        backgroundColor: isActive ? theme.accent : theme.surfaceStrong,
                      },
                    ]}
                  >
                    <ThemedText
                      style={[
                        styles.chipText,
                        {
                          color: isActive ? theme.accentForeground : theme.mutedText,
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {item.label}
                    </ThemedText>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {displayedArticles.map((article, index) => (
            <LearnArticleCard
              key={article.href}
              article={article}
              rank={String(index + 1).padStart(2, "0")}
              onPress={() => router.push(article.href)}
              borderColor={theme.border}
              backgroundColor={theme.surface}
              textColor={theme.mutedText}
              metaBackgroundColor={theme.surfaceStrong}
              metaTextColor={theme.mutedText}
            />
          ))}
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <ThemedText type="subtitle">How to use it</ThemedText>
          <View style={styles.chips}>
            {quickLinks.map((item) => (
              <Pressable
                key={item.label}
                onPress={() => router.push(item.href)}
                style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
              >
                <ThemedText style={[styles.chipText, { color: theme.mutedText }]} numberOfLines={1}>
                  {item.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Recommended order</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Start with the reading guide, then choose a coffee, then filter the catalog, then the sourcing note,
            then the comparison note, then the sensory note, then the storage note, then the brew clarity note,
            then seasonal notes, glossary, brew methods, and roast notes. That gives you the shortest path from
            structure to buying, search, origin, comparison, tasting, freshness, change, extraction, balance,
            language, and roast.
          </ThemedText>
          <View style={styles.orderRow}>
            {LEARN_RECOMMENDED_ORDER.map((item, index) => (
              <View
                key={item}
                style={[
                  styles.orderPill,
                  {
                    borderColor: theme.border,
                    backgroundColor: index === 0 ? theme.accent : theme.surfaceMuted,
                  },
                ]}
              >
                <ThemedText
                  style={[
                    styles.orderText,
                    {
                      color: index === 0 ? theme.accentForeground : theme.mutedText,
                    },
                  ]}
                >
                  {item}
                </ThemedText>
              </View>
            ))}
          </View>
        </View>
      </DetailScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 14,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  mediaCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mediaFrame: {
    aspectRatio: 1.35,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mediaGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.2,
  },
  mediaBadge: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  mediaBadgeText: {
    fontSize: 28,
  },
  mediaCopy: {
    paddingHorizontal: 14,
    paddingBottom: 14,
    gap: 8,
  },
  mediaLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  mediaBody: {
    lineHeight: 20,
  },
  section: {
    gap: 8,
  },
  filterBar: {
    gap: 8,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
  },
  body: {
    lineHeight: 20,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 11,
  },
  orderRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  orderPill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  orderText: {
    fontSize: 11,
  },
});
