import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";
import { fetchFarms, type FarmRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

type SearchParams = {
  q?: string;
};

export default function FarmsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const searchParams = useLocalSearchParams<SearchParams>();
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q ?? "";
  const [searchDraft, setSearchDraft] = useState(q);
  const [farms, setFarms] = useState<FarmRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadFarms() {
      setLoading(true);
      setError(null);

      try {
        const nextFarms = await fetchFarms(q.trim() || undefined);
        if (!active) return;
        setFarms(nextFarms);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load farms.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadFarms();

    return () => {
      active = false;
    };
  }, [q]);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  function updateRoute(nextQuery: string) {
    const query = nextQuery.trim();
    router.replace(query ? `/farms?q=${encodeURIComponent(query)}` : "/farms");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.actions}>
        <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="defaultSemiBold">Back</ThemedText>
        </Pressable>
        <Pressable onPress={() => router.push("/producers")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="defaultSemiBold">Producers</ThemedText>
        </Pressable>
      </View>

      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText type="title" style={styles.heroTitle}>
          Farms
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>
          Explore the farms and growing regions behind each coffee.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <SearchToolbar
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="Search farms"
          onSubmit={() => updateRoute(searchDraft)}
          onClear={q ? () => updateRoute("") : undefined}
        />
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        {loading ? (
          <StatusPanel title="Loading farms..." loading />
        ) : error ? (
          <StatusPanel title="Could not load farms." message={error} />
        ) : farms.length === 0 ? (
          <StatusPanel
            title={q ? "No farms matched your search." : "No farms yet."}
            message={
              q
                ? "Try a different search term or clear the filter."
                : "Seed data has not been loaded yet."
            }
          />
        ) : (
          <View style={styles.list}>
            {farms.map((farm) => (
              <Pressable key={farm.id} onPress={() => router.push(`/farms/${farm.slug}`)} style={styles.card}>
                <View style={[styles.cardMedia, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                  {farm.image_url ? (
                    <Image source={{ uri: farm.image_url }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cardFallback, { backgroundColor: theme.surfaceMuted }]}>
                      <View style={[styles.cardMonogram, { backgroundColor: theme.inverse }]}>
                        <ThemedText type="defaultSemiBold" style={[styles.cardMonogramText, { color: theme.inverseForeground }]}>
                          {buildMonogram(farm.name)}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.cardHeader}>
                  <ThemedText type="subtitle">{farm.name}</ThemedText>
                  <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{farm.state}</ThemedText>
                </View>
                <ThemedText style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={2}>
                  {farm.description || "A farm profile without a description yet."}
                </ThemedText>
                <View style={styles.cardChips}>
                  {farm.municipality ? (
                    <View style={[styles.cardChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                      <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                        {farm.municipality}
                      </ThemedText>
                    </View>
                  ) : null}
                  {farm.producer?.name ? (
                    <View style={[styles.cardChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                      <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                        {farm.producer.name}
                      </ThemedText>
                    </View>
                  ) : null}
                  <View style={[styles.cardChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  actions: {
    flexDirection: 'row',
    gap: 10,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroBody: {},
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 22,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  cardMedia: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    aspectRatio: 1.6,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMonogram: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMonogramText: {
    fontSize: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardMeta: {
    fontSize: 12,
  },
  cardBody: {},
  cardChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
  cardChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  cardChipText: {
    fontSize: 12,
  },
});
