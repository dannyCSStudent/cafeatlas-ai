import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const steps = [
  {
    title: "Notice the lift",
    body: "Acidity often lands as the first bright impression: crisp, juicy, citrusy, or gently sparkling.",
  },
  {
    title: "Separate brightness from sharpness",
    body: "Good acidity supports the cup's structure. Harshness usually feels distracting or unbalanced.",
  },
  {
    title: "Read the texture around it",
    body: "Sweetness, body, and aftertaste show whether the acidity feels integrated or isolated.",
  },
  {
    title: "Compare across origins",
    body: "The shape of acidity becomes easier to hear when you move between coffees and keep origin context visible.",
  },
];

export default function HowToReadAcidityScreen() {
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
              onPress={() => router.push("/learn/how-to-taste-a-coffee")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Taste</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-compare-coffee-profiles")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Compare</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  Acid
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Sensory note</ThemedText>
              <ThemedText type="subtitle">How to read acidity</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A sensory note for reading brightness, lift, and structure in the cup.
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
        title="How to read acidity"
        description="A short sensory guide for reading brightness, lift, and structure with more clarity."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Acidity" },
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
          <ThemedText type="subtitle">In practice</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Bright acidity often feels cleaner when sweetness and structure support it instead of fighting it.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Check whether the coffee feels lively, juicy, citrus-like, or crisp, then notice how that feeling
            changes as the cup cools.
          </ThemedText>
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
});
