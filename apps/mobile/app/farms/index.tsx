import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { SearchToolbar } from "@/components/search-toolbar";
import { fetchFarms, type FarmRead } from "@/lib/cafeatlas-api";

type SearchParams = {
  q?: string;
};

export default function FarmsScreen() {
  const router = useRouter();
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
        <Link href="/" asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">Back</ThemedText>
          </Pressable>
        </Link>
        <Link href="/producers" asChild>
          <Pressable style={styles.secondaryButton}>
            <ThemedText type="defaultSemiBold">Producers</ThemedText>
          </Pressable>
        </Link>
      </View>

      <ThemedView style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>
          Farms
        </ThemedText>
        <ThemedText style={styles.heroBody}>
          Explore the farms and growing regions behind each coffee.
        </ThemedText>
      </ThemedView>

      <ThemedView style={styles.panel}>
        <SearchToolbar
          value={searchDraft}
          onChangeText={setSearchDraft}
          placeholder="Search farms"
          onSubmit={() => updateRoute(searchDraft)}
          onClear={q ? () => updateRoute("") : undefined}
        />
      </ThemedView>

      <ThemedView style={styles.panel}>
        {loading ? (
          <State message="Loading farms..." />
        ) : error ? (
          <State title="Could not load farms." message={error} />
        ) : (
          <View style={styles.list}>
            {farms.map((farm) => (
              <Link key={farm.id} href={`/farms/${farm.slug}`} asChild>
                <Pressable style={styles.card}>
                  <View style={styles.cardHeader}>
                    <ThemedText type="subtitle">{farm.name}</ThemedText>
                    <ThemedText style={styles.cardMeta}>{farm.state}</ThemedText>
                  </View>
                  <ThemedText style={styles.cardBody} numberOfLines={2}>
                    {farm.description || "A farm profile without a description yet."}
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

function State({ title, message }: { title?: string; message: string }) {
  return (
    <View style={styles.stateBox}>
      {title ? <ThemedText type="defaultSemiBold">{title}</ThemedText> : null}
      <ThemedText style={styles.heroBody}>{message}</ThemedText>
    </View>
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
  stateBox: {
    minHeight: 140,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
