import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const steps = [
  {
    title: "Read the note as direction",
    body: "Notes like citrus, cocoa, florals, or stone fruit are clues about what the cup emphasizes, not a fixed recipe.",
  },
  {
    title: "Separate structure from flavor",
    body: "Acidity, sweetness, and body describe how the coffee feels, while tasting notes describe what it resembles.",
  },
  {
    title: "Compare across coffees",
    body: "A note makes more sense when you compare it with another coffee from the same producer, farm, or process style.",
  },
  {
    title: "Bring it back to origin",
    body: "The best tasting note is one that leads you back to producer, farm, and process rather than ending at the label.",
  },
] as const;

export default function TastingNotesGlossaryScreen() {
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
              onPress={() => router.push("/learn")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Hub</ThemedText>
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
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Glossary</ThemedText>
              <ThemedText type="subtitle">Tasting notes</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A short guide to reading flavor language with a little less guesswork.
              </ThemedText>
            </View>
          </View>
        }
        title="Tasting notes glossary"
        description="A third Learn article that explains how to read the language around flavor."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Language" },
        ]}
        bottomStats={[
          { label: "Use with", value: "Detail pages" },
          { label: "Read time", value: "2 min" },
        ]}
      >
        <View style={styles.section}>
          {steps.map((step, index) => (
            <View key={step.title} style={[styles.stepCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <ThemedText style={[styles.stepKicker, { color: theme.mutedText }]}>Step {index + 1}</ThemedText>
              <ThemedText type="subtitle">{step.title}</ThemedText>
              <ThemedText style={[styles.body, { color: theme.mutedText }]}>{step.body}</ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <ThemedText type="subtitle">What to compare</ThemedText>
          <View style={styles.chips}>
            {["Learn hub", "Reading guide", "Seasonal notes", "Catalog"].map((item) => (
              <Pressable
                key={item}
                onPress={() =>
                  router.push(
                    item === "Learn hub"
                      ? "/learn"
                      : item === "Reading guide"
                        ? "/learn/how-to-read-a-coffee-profile"
                        : item === "Seasonal notes"
                          ? "/learn/seasonal-notes"
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
  stepCard: {
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stepKicker: {
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
});
