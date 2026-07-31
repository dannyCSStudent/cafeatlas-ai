import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { Colors } from "@/constants/theme";
import { ArticleMeta } from "@/components/article-meta";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const articles = [
  {
    href: "/learn/how-to-read-a-coffee-profile",
    title: "How to read a coffee profile",
    body: "A quick guide to the anatomy of a coffee detail page.",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/seasonal-notes",
    title: "Seasonal notes",
    body: "A companion note about freshness, rotation, and what changes in the cup.",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/tasting-notes-glossary",
    title: "Tasting notes glossary",
    body: "A short glossary for reading tasting language with less mystery.",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
  {
    href: "/learn/brew-methods-and-extraction",
    title: "Brew methods and extraction",
    body: "A practical note about how brewing changes what you taste and why it matters.",
    readTime: "2 min",
    updated: "Jul 31, 2026",
  },
] as const;

export default function LearnHubScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

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
                Use the hub to move between profile reading and seasonal change.
              </ThemedText>
            </View>
          </View>
        }
        title="Learn hub"
        description="A central place for the editorial pieces that explain the catalog."
        topStats={[
          { label: "Articles", value: "4" },
          { label: "Focus", value: "Origin" },
        ]}
        bottomStats={[
          { label: "Use with", value: "Catalog" },
          { label: "Read time", value: "1 min" },
        ]}
      >
        <View style={styles.section}>
          {articles.map((article) => (
            <Pressable
              key={article.href}
              onPress={() => router.push(article.href)}
              style={[styles.articleCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
            >
              <ThemedText style={[styles.articleKicker, { color: theme.mutedText }]}>Article</ThemedText>
              <ThemedText type="subtitle">{article.title}</ThemedText>
              <ThemedText style={[styles.body, { color: theme.mutedText }]}>{article.body}</ThemedText>
              <ArticleMeta
                readTime={article.readTime}
                updated={article.updated}
                containerStyle={styles.articleMeta}
                borderColor={theme.border}
                backgroundColor={theme.surfaceStrong}
                textColor={theme.mutedText}
              />
            </Pressable>
          ))}
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <ThemedText type="subtitle">How to use it</ThemedText>
          <View style={styles.chips}>
            {["Reading guide", "Seasonal notes", "Glossary", "Brew methods", "About", "Catalog"].map((item) => (
              <Pressable
                key={item}
                onPress={() =>
                  router.push(
                    item === "Reading guide"
                      ? "/learn/how-to-read-a-coffee-profile"
                      : item === "Seasonal notes"
                        ? "/learn/seasonal-notes"
                        : item === "Glossary"
                          ? "/learn/tasting-notes-glossary"
                        : item === "Brew methods"
                          ? "/learn/brew-methods-and-extraction"
                        : item === "About"
                          ? "/about"
                          : "/"
                  )
                }
                style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
              >
                <ThemedText style={[styles.chipText, { color: theme.mutedText }]} numberOfLines={1}>
                  {item}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Recommended order</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Start with the reading guide, then seasonal notes, then the glossary, then brew methods. That gives you
            the shortest path from structure to change to language and extraction.
          </ThemedText>
          <View style={styles.orderRow}>
            {["Reading guide", "Seasonal notes", "Glossary", "Brew methods"].map((item, index) => (
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
    padding: 16,
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
    paddingHorizontal: 16,
    paddingBottom: 16,
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
    gap: 10,
  },
  body: {
    lineHeight: 20,
  },
  articleMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  articleCard: {
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  articleKicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
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
