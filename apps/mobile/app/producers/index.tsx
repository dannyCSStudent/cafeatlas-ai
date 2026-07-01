import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SearchToolbar } from "@/components/search-toolbar";
import { StatusPanel } from "@/components/status-panel";
import { fetchProducers, type ProducerRead } from "@/lib/cafeatlas-api";

type SearchParams = {
  q?: string;
};

export default function ProducersScreen() {
  const router = useRouter();
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
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">Back</ThemedText>
          </Pressable>
        </Link>
        <Link href="/farms" asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">Farms</ThemedText>
          </Pressable>
        </Link>
      </View>

      <ThemedView style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>
          Producers
        </ThemedText>
        <ThemedText style={styles.heroBody}>
          Browse the producers behind the coffees in the catalog.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.panel}>
        <SearchToolbar
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="Search producers"
          onSubmit={() => updateRoute(searchDraft)}
          onClear={q ? () => updateRoute("") : undefined}
        />
      </ThemedView>

      <ThemedView style={styles.panel}>
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
                    <ThemedText style={styles.cardMeta}>{producer.farms.length} farms</ThemedText>
                  </View>
                  <ThemedText numberOfLines={2} style={styles.cardBody}>
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
    borderColor: 'rgba(120, 85, 50, 0.2)',
    backgroundColor: '#ffffff',
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.18)',
    backgroundColor: '#fff8f1',
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroBody: {
    color: '#5f5146',
  },
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.18)',
    backgroundColor: '#fffdf9',
  },
  list: {
    gap: 10,
  },
  card: {
    borderRadius: 22,
    backgroundColor: '#ffffff',
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.14)',
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardMeta: {
    color: '#7d6e62',
    fontSize: 12,
  },
  cardBody: {
    color: '#5f5146',
  },
});
