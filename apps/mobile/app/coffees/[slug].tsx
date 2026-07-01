import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeBySlug, formatPrice, type CoffeeRead } from "@/lib/cafeatlas-api";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CoffeeDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [coffee, setCoffee] = useState<CoffeeRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadCoffee() {
      setLoading(true);
      setError(null);

      try {
        const nextCoffee = await fetchCoffeeBySlug(slug);
        if (!active) return;
        setCoffee(nextCoffee);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load coffee.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    if (slug) {
      void loadCoffee();
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
          <ThemedText>Loading coffee...</ThemedText>
        </ThemedView>
      ) : error || !coffee ? (
        <ThemedView style={styles.stateBox}>
          <ThemedText type="defaultSemiBold">Could not load coffee.</ThemedText>
          <ThemedText style={styles.stateText}>{error ?? "Coffee not found."}</ThemedText>
        </ThemedView>
      ) : (
        <>
          <View style={styles.actions}>
            <Link href="/" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            {coffee.producer?.slug ? (
              <Link href={`/producers/${coffee.producer.slug}`} asChild>
                <Pressable style={styles.secondaryButton}>
                  <ThemedText type="defaultSemiBold">Producer</ThemedText>
                </Pressable>
              </Link>
            ) : null}
            {coffee.farm?.slug ? (
              <Link href={`/farms/${coffee.farm.slug}`} asChild>
                <Pressable style={styles.secondaryButton}>
                  <ThemedText type="defaultSemiBold">Farm</ThemedText>
                </Pressable>
              </Link>
            ) : null}
          </View>

          <ThemedView style={styles.hero}>
            <ThemedText type="title" style={styles.heroTitle}>
              {coffee.name}
            </ThemedText>
            <ThemedText style={styles.heroBody}>
              {coffee.description || "This coffee does not have a description yet."}
            </ThemedText>

            <View style={styles.statRow}>
              <Stat label="State" value={coffee.origin_state} />
              <Stat label="Price" value={formatPrice(coffee.price_cents)} />
            </View>

            <View style={styles.statRow}>
              <Stat label="Producer" value={coffee.producer_name} />
              <Stat label="Listed" value={formatDate(coffee.created_at)} />
            </View>
          </ThemedView>

          <ThemedView style={styles.panel}>
            <ThemedText type="subtitle">Origin profile</ThemedText>
            <ThemedText style={styles.meta}>Producer: {coffee.producer?.name ?? coffee.producer_name}</ThemedText>
            <ThemedText style={styles.meta}>Farm: {coffee.farm?.name ?? "Unknown farm"}</ThemedText>
            <ThemedText style={styles.meta}>Municipality: {coffee.farm?.municipality ?? "n/a"}</ThemedText>
            <ThemedText style={styles.meta}>
              Altitude: {coffee.farm?.altitude_meters ? `${coffee.farm.altitude_meters.toLocaleString()} m` : "n/a"}
            </ThemedText>
            <ThemedText style={styles.meta}>Slug: {coffee.slug}</ThemedText>
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
