import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchFarmBySlug, type FarmRead } from "@/lib/cafeatlas-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function FarmDetailScreen() {
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
      {loading ? (
        <ThemedView style={styles.stateBox}>
          <ActivityIndicator />
          <ThemedText>Loading farm...</ThemedText>
        </ThemedView>
      ) : error || !farm ? (
        <ThemedView style={styles.stateBox}>
          <ThemedText type="defaultSemiBold">Could not load farm.</ThemedText>
          <ThemedText style={styles.stateText}>{error ?? "Farm not found."}</ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.actions}>
            <Link href="/farms" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            {farm.producer?.slug ? (
              <Link href={`/producers/${farm.producer.slug}`} asChild>
                <Pressable style={styles.secondaryButton}>
                  <ThemedText type="defaultSemiBold">Producer</ThemedText>
                </Pressable>
              </Link>
            ) : null}
            <Link href="/" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="defaultSemiBold">Coffees</ThemedText>
              </Pressable>
            </Link>
          </View>

          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              {farm.name}
            </ThemedText>
            <ThemedText style={styles.heroBody}>
              {farm.description || "This farm does not have a description yet."}
            </ThemedText>
            <View style={styles.statRow}>
              <Stat label="State" value={farm.state} />
              <Stat label="Producer" value={farm.producer?.name ?? "n/a"} />
            </View>
            <View style={styles.statRow}>
              <Stat label="Altitude" value={farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "n/a"} />
              <Stat label="Listed" value={formatDate(farm.created_at)} />
            </View>
          </ThemedView>

          <ThemedView style={styles.panel}>
            <ThemedText type="subtitle">Location</ThemedText>
            <ThemedText style={styles.meta}>Municipality: {farm.municipality ?? "n/a"}</ThemedText>
            <ThemedText style={styles.meta}>Producer slug: {farm.producer?.slug ?? "n/a"}</ThemedText>
            <ThemedText style={styles.meta}>Farm slug: {farm.slug}</ThemedText>
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
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(120, 85, 50, 0.18)',
    backgroundColor: '#fffdf9',
  },
  meta: {
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
