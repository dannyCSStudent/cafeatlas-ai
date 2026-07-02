import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { fetchProducerBySlug, type ProducerRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProducerDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [producer, setProducer] = useState<ProducerRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProducer() {
      setLoading(true);
      setError(null);

      try {
        const nextProducer = await fetchProducerBySlug(slug);
        if (!active) return;
        setProducer(nextProducer);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load producer.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void loadProducer();
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
        loadingTitle="Loading producer..."
        errorTitle="Could not load producer."
        errorMessage={error ?? "Producer not found."}
        actions={
          <>
            <Link href="/producers" asChild>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            <Link href="/" asChild>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText type="defaultSemiBold">Coffees</ThemedText>
              </Pressable>
            </Link>
          </>
        }
        title={producer?.name ?? ""}
        description={producer?.description || "This producer does not have a description yet."}
        topStats={[
          { label: "Family", value: producer?.family || "n/a" },
          { label: "Farms", value: producer ? String(producer.farms.length) : "n/a" },
        ]}
        bottomStats={[
          { label: "Slug", value: producer?.slug ?? "n/a" },
          { label: "Listed", value: producer ? formatDate(producer.created_at) : "n/a" },
        ]}
      >
        {producer ? (
          <>
            <ThemedText type="subtitle">Farms</ThemedText>
            <View style={styles.list}>
              {producer.farms.length > 0 ? (
                  producer.farms.map((farm) => (
                    <Link key={farm.id} href={`/farms/${farm.slug}`} asChild>
                      <Pressable style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                        <View style={styles.cardHeader}>
                          <ThemedText type="subtitle">{farm.name}</ThemedText>
                          <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{farm.state}</ThemedText>
                        </View>
                        <ThemedText style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={2}>
                          {farm.municipality || "n/a"}
                        </ThemedText>
                      </Pressable>
                    </Link>
                  ))
                ) : (
                <ThemedText style={[styles.emptyText, { color: theme.mutedText }]}>No farms linked yet.</ThemedText>
              )}
            </View>
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
  cardBody: {
  },
  emptyText: {
  },
});
