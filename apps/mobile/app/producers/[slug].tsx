import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
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
      {loading ? (
        <ThemedView style={styles.stateBox}>
          <ActivityIndicator />
          <ThemedText>Loading producer...</ThemedText>
        </ThemedView>
      ) : error || !producer ? (
        <ThemedView style={styles.stateBox}>
          <ThemedText type="defaultSemiBold">Could not load producer.</ThemedText>
          <ThemedText style={styles.stateText}>{error ?? "Producer not found."}</ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.actions}>
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
          </View>

          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              {producer.name}
            </ThemedText>
            <ThemedText style={styles.heroBody}>
              {producer.description || "This producer does not have a description yet."}
            </ThemedText>
            <View style={styles.statRow}>
              <Stat label="Family" value={producer.family || "n/a"} />
              <Stat label="Farms" value={String(producer.farms.length)} />
            </View>
            <View style={styles.statRow}>
              <Stat label="Slug" value={producer.slug} />
              <Stat label="Listed" value={formatDate(producer.created_at)} />
            </View>
          </ThemedView>

          <ThemedView style={styles.panel}>
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
                <ThemedText style={styles.stateText}>No farms linked yet.</ThemedText>
              )}
            </View>
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.statValue}>
        {value}
      </ThemedText>
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
    gap: 14,
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
  statRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#ffffff',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.14)',
  },
  label: {
    color: '#7d6e62',
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontSize: 12,
  },
  statValue: {
    marginTop: 8,
  },
  panel: {
    borderRadius: 28,
    padding: 20,
    gap: 12,
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
    minHeight: 320,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    borderRadius: 28,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.18)',
    backgroundColor: '#fffdf9',
  },
  stateText: {
    color: '#5f5146',
  },
});
