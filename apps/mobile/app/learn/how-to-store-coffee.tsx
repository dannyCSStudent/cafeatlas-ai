import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const steps = [
  {
    title: "Watch the roast date",
    body: "Freshness starts with knowing when the coffee was roasted and how quickly you plan to open it.",
  },
  {
    title: "Keep the bag sealed",
    body: "Air, heat, and light move flavor faster than most people expect. A sealed bag slows that down.",
  },
  {
    title: "Store it simply",
    body: "A cool, dry cupboard is often better than a decorative canister or a warm countertop.",
  },
  {
    title: "Taste before it fades",
    body: "Compare the opening days with the later ones so you can hear when the coffee is at its best.",
  },
];

export default function HowToStoreCoffeeScreen() {
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
              onPress={() => router.push("/learn/seasonal-notes")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Seasonal</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  Fresh
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Editorial note</ThemedText>
              <ThemedText type="subtitle">How to store coffee</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A freshness note on bags, timing, and what to keep in mind after a roast date.
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
        title="How to store coffee"
        description="A short freshness guide for reading roast date, bag handling, and timing with more clarity."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Freshness" },
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
            The simplest storage often works best: keep it sealed, dry, and away from heat.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            The cup will usually tell you when the coffee is at its best, so compare the first brews with the later
            ones.
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
