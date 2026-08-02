import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const steps = [
  {
    title: "Varietal as context",
    body: "Varietal describes the plant line, but it works best when you read it with origin, process, and notes.",
  },
  {
    title: "Notice what it suggests",
    body: "Some varietals are often linked to clarity, sweetness, structure, or body, but farming still matters.",
  },
  {
    title: "Compare the same origin",
    body: "Reading two coffees from the same origin helps separate plant genetics from place.",
  },
  {
    title: "Keep the full picture",
    body: "Use varietal as one cue in the profile, not the final word on flavor.",
  },
];

export default function ReadVarietalScreen() {
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
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-read-a-coffee-profile")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Reading</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-choose-a-coffee")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Choose</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  Var
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Reading guide</ThemedText>
              <ThemedText type="subtitle">How to read varietal</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A reading note for understanding varietal as context rather than a label alone.
              </ThemedText>
              <ArticleMeta
                containerStyle={styles.articleMeta}
                borderColor={theme.border}
                backgroundColor={theme.surfaceStrong}
                textColor={theme.mutedText}
              />
            </View>
          </View>
        }
        title="How to read varietal"
        description="A reading guide for understanding varietal as part of the coffee profile."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Varietal" },
        ]}
        bottomStats={[
          { label: "Use with", value: "Catalog" },
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
          <ThemedText type="subtitle">What to scan first</ThemedText>
          <View style={styles.chips}>
            {["Origin", "Process", "Notes", "Profile"].map((item) => (
              <View key={item} style={[styles.chip, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText style={[styles.chipText, { color: theme.mutedText }]} numberOfLines={1}>
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
  },
  mediaBadge: {
    width: 94,
    height: 94,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaBadgeText: {
    fontSize: 24,
    letterSpacing: 1,
    textTransform: "uppercase",
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
  articleMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  section: {
    gap: 10,
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
});
