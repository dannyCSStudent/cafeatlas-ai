import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { cafeAtlasBrand } from "@repo/ui/brand";

export default function AboutScreen() {
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
              <ThemedText type="defaultSemiBold">Learn hub</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/producers")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Producers</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/farms")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Farms</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-read-a-coffee-profile")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Reading guide</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/seasonal-notes")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Seasonal notes</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-sourcing-works")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Sourcing note</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-compare-coffee-profiles")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Compare coffees</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn/how-to-taste-a-coffee")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Taste a coffee</ThemedText>
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
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>About</ThemedText>
              <ThemedText type="subtitle">{cafeAtlasBrand.name}</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                {cafeAtlasBrand.tagline} This page explains the platform model and where the live data comes from.
              </ThemedText>
            </View>
          </View>
        }
        title="About CafeAtlas AI"
        description="A branded story page that explains the platform model without repeating the homepage pitch."
        topStats={[
          { label: "Focus", value: "Origin" },
          { label: "Mode", value: "Editorial" },
        ]}
        bottomStats={[
          { label: "Platform", value: "Web + mobile" },
          { label: "Backend", value: "FastAPI" },
        ]}
      >
        <View style={styles.section}>
          <ThemedText type="subtitle">How it works</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            The catalog, origin pages, and coffee detail screens all read from the same backend, so the experience
            stays live as the dataset changes.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            Coffee detail pages surface process, varietal, tasting notes, producer, and farm context together. Landing
            pages point toward the next story instead of ending at a dead end.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            The sourcing note explains how producer and farm relationships stay visible across the catalog.
          </ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>
            The comparison note shows how to read two coffees side by side without flattening origin context.
          </ThemedText>
        </View>

        <View style={[styles.section, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <ThemedText type="subtitle">What’s included</ThemedText>
          <View style={styles.chips}>
            {["Live catalog", "Origin profiles", "Editorial landing pages", "Shared brand system"].map((item) => (
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
