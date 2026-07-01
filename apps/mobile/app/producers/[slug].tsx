import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { fetchProducerBySlug, type ProducerRead } from "@/lib/cafeatlas-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function ProducerDetailScreen() {
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
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            <Link href="/" asChild>
              <Pressable style={styles.secondaryButton}>
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
                    <Pressable style={styles.card}>
                      <View style={styles.cardHeader}>
                        <ThemedText type="subtitle">{farm.name}</ThemedText>
                        <ThemedText style={styles.cardMeta}>{farm.state}</ThemedText>
                      </View>
                      <ThemedText style={styles.cardBody} numberOfLines={2}>
                        {farm.municipality || "n/a"}
                      </ThemedText>
                    </Pressable>
                  </Link>
                ))
              ) : (
                <ThemedText style={styles.emptyText}>No farms linked yet.</ThemedText>
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
    borderColor: 'rgba(120, 85, 50, 0.2)',
    backgroundColor: '#ffffff',
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
  emptyText: {
    color: '#5f5146',
  },
});
