import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";
import { fetchProducers, type ProducerRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SearchParams = {
  q?: string;
};

export default function ProducersScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const searchParams = useLocalSearchParams<SearchParams>();
  const q = Array.isArray(searchParams.q) ? searchParams.q[0] : searchParams.q ?? "";
  const [searchDraft, setSearchDraft] = useState(q);
  const [producers, setProducers] = useState<ProducerRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducers() {
      setLoading(true);
      setError(null);

      try {
        const nextProducers = await fetchProducers(q.trim() || undefined);
        if (!active) return;
        setProducers(nextProducers);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load producers.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadProducers();

    return () => {
      active = false;
    };
  }, [q]);

  useEffect(() => {
    setSearchDraft(q);
  }, [q]);

  function updateRoute(nextQuery: string) {
    const query = nextQuery.trim();
    router.replace(query ? `/producers?q=${encodeURIComponent(query)}` : "/producers");
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.actions}>
        <Link href="/" asChild>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <ThemedText type="defaultSemiBold">Back</ThemedText>
          </Pressable>
        </Link>
        <Link href="/farms" asChild>
          <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <ThemedText type="defaultSemiBold">Farms</ThemedText>
          </Pressable>
        </Link>
      </View>

      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText type="title" style={styles.heroTitle}>
          Producers
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>
          Browse the producers behind the coffees in the catalog.
        </ThemedText>
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <SearchToolbar
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="Search producers"
          onSubmit={() => updateRoute(searchDraft)}
          onClear={q ? () => updateRoute("") : undefined}
        />
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        {loading ? (
          <StatusPanel title="Loading producers..." loading />
        ) : error ? (
          <StatusPanel title="Could not load producers." message={error} />
        ) : producers.length === 0 ? (
          <StatusPanel
            title={q ? "No producers matched your search." : "No producers yet."}
            message={
              q
                ? "Try a different search term or clear the filter."
                : "Seed data has not been loaded yet."
            }
          />
        ) : (
          <View style={styles.list}>
            {producers.map((producer) => (
              <Link key={producer.id} href={`/producers/${producer.slug}`} asChild>
                <Pressable style={styles.card}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="subtitle">{producer.name}</ThemedText>
                    <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{producer.farms.length} farms</ThemedText>
                  </View>
                  <ThemedText numberOfLines={2} style={[styles.cardBody, { color: theme.mutedText }]}>
                    {producer.description || "A producer profile without a description yet."}
                  </ThemedText>
                </Pressable>
              </Link>
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardMeta: {
    fontSize: 12,
  },
  cardBody: {},
});
