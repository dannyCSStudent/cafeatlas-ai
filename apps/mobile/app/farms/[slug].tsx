import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { fetchFarmBySlug, type FarmRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function FarmDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [farm, setFarm] = useState<FarmRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFarm() {
      setLoading(true);
      setError(null);

      try {
        const nextFarm = await fetchFarmBySlug(slug);
        if (!active) return;
        setFarm(nextFarm);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load farm.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void loadFarm();
    }

    return () => {
      active = false;
    };
  }, [slug]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailScreenShell
        loading={loading}
        error={error}
        loadingTitle="Loading farm..."
        errorTitle="Could not load farm."
        errorMessage={error ?? "Farm not found."}
        media={
          farm ? (
            <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
                <View style={[styles.mediaOverlay, { backgroundColor: theme.surfaceMuted }]} />
                <View style={[styles.mediaMonogram, { backgroundColor: theme.inverse }]}>
                  <ThemedText type="title" style={[styles.mediaMonogramText, { color: theme.inverseForeground }]}>
                    {buildMonogram(farm.name)}
                  </ThemedText>
                </View>
              </View>
              <View style={styles.mediaCopy}>
                <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Farm landscape</ThemedText>
                <ThemedText type="subtitle">{farm.name}</ThemedText>
                <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                  {farm.description || "A farm profile without a description yet."}
                </ThemedText>
              </View>
              <View style={styles.mediaStats}>
                <View style={[styles.mediaStat, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>State</ThemedText>
                  <ThemedText type="defaultSemiBold">{farm.state}</ThemedText>
                </View>
                <View style={[styles.mediaStat, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Altitude</ThemedText>
                  <ThemedText type="defaultSemiBold">
                    {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a"}
                  </ThemedText>
                </View>
              </View>
            </View>
          ) : null
        }
        actions={
          <>
            <Link href="/farms" asChild>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            {farm?.producer?.slug ? (
              <Link href={`/producers/${farm.producer.slug}`} asChild>
                <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                  <ThemedText type="defaultSemiBold">Producer</ThemedText>
                </Pressable>
              </Link>
            ) : null}
            <Link href="/" asChild>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText type="defaultSemiBold">Coffees</ThemedText>
              </Pressable>
            </Link>
          </>
        }
        title={farm?.name ?? ""}
        description={farm?.description || "This farm does not have a description yet."}
        topStats={[
          { label: "State", value: farm?.state ?? "n/a" },
          { label: "Producer", value: farm?.producer?.name ?? "n/a" },
        ]}
        bottomStats={[
          {
            label: "Altitude",
            value: farm?.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a",
          },
          { label: "Listed", value: farm ? formatDate(farm.created_at) : "n/a" },
        ]}
      >
        {farm ? (
          <>
            <ThemedText type="subtitle">Location</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Municipality: {farm.municipality ?? "n/a"}</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Producer slug: {farm.producer?.slug ?? "n/a"}</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Farm slug: {farm.slug}</ThemedText>
          </>
        ) : null}
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
    alignItems: 'center',
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
    justifyContent: "flex-end",
    padding: 16,
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  mediaMonogram: {
    alignSelf: "flex-start",
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaMonogramText: {
    fontSize: 30,
    lineHeight: 34,
  },
  mediaCopy: {
    paddingHorizontal: 16,
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
  mediaStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mediaStat: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 4,
  },
  meta: {
  },
});
