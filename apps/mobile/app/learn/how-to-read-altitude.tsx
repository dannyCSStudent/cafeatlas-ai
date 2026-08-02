import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const notes = [
  {
    title: "Start with the number",
    body: "Altitude is a useful cue, but it is not a quality score. Read it as context, not as a verdict.",
  },
  {
    title: "Read structure",
    body: "Higher elevation can point toward brightness or structure, but the real question is how it shows up in the cup.",
  },
  {
    title: "Compare within origin",
    body: "Altitude becomes easier to hear when you compare coffees from the same producer, farm, or state.",
  },
  {
    title: "Keep the farm in view",
    body: "The farm page keeps altitude connected to place, so elevation stays linked to municipality, state, and terrain.",
  },
];

export default function ReadAltitudeScreen() {
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
              onPress={() => router.push("/learn/how-sourcing-works")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Sourcing</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-read-process")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Process</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  Alt
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Origin note</ThemedText>
              <ThemedText type="subtitle">How to read altitude</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A quick note on how altitude can help you read structure, brightness, and texture without turning it
                into a rule.
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
        title="How to read altitude"
        description="A short origin note for reading altitude as a profile cue."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Altitude" },
        ]}
        bottomStats={[
          { label: "Use with", value: "Catalog" },
          { label: "Read time", value: "2 min" },
        ]}
      >
        <View style={styles.section}>
          {notes.map((note, index) => (
            <View key={note.title} style={[styles.noteCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <ThemedText style={[styles.stepKicker, { color: theme.mutedText }]}>Step {index + 1}</ThemedText>
              <ThemedText type="subtitle">{note.title}</ThemedText>
              <ThemedText style={[styles.body, { color: theme.mutedText }]}>{note.body}</ThemedText>
            </View>
          ))}
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <ThemedText type="subtitle">In practice</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Altitude can hint at brightness, structure, or more tension in the cup, but it does not predict the final
            flavor on its own.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Read it with process, varietal, and the farm page so the clue stays connected to the full origin chain.
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
  noteCard: {
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
