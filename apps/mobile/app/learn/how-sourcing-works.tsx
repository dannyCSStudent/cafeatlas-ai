import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

const notes = [
  {
    title: "Start with the producer",
    body: "The producer profile tells you who is organizing the lots and which farms belong to the group.",
  },
  {
    title: "Then read the farm",
    body: "The farm page adds place, state, municipality, altitude, and the shape of the land behind the lot.",
  },
  {
    title: "Trace the coffee",
    body: "Each coffee keeps the producer and farm connected so you can move from the cup back to the origin chain.",
  },
  {
    title: "Compare by state",
    body: "Filter the catalog by state when you want to see how one region changes across producers and farms.",
  },
];

export default function HowSourcingWorksScreen() {
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
              onPress={() => router.push("/producers")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Producers</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/farms")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Farms</ThemedText>
            </Pressable>
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  Origin
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Origin note</ThemedText>
              <ThemedText type="subtitle">How sourcing works</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                A quick note on how producer and farm relationships keep the origin chain visible.
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
        title="How sourcing works"
        description="A short note that explains how producer and farm relationships shape the catalog."
        topStats={[
          { label: "Steps", value: "4" },
          { label: "Focus", value: "Origin" },
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
            Sourcing is easier to read when producer and farm stay linked inside the coffee detail page. That keeps
            the origin chain intact while you browse.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            You can also compare by state to see how one region changes across producers and farms without losing
            context.
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
