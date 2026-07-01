import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet } from "react-native";

import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
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
      <DetailScreenShell
        loading={loading}
        error={error}
        loadingTitle="Loading farm..."
        errorTitle="Could not load farm."
        errorMessage={error ?? "Farm not found."}
        actions={
          <>
            <Link href="/farms" asChild>
              <Pressable style={styles.secondaryButton}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            {farm?.producer?.slug ? (
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
            <ThemedText style={styles.meta}>Municipality: {farm.municipality ?? "n/a"}</ThemedText>
            <ThemedText style={styles.meta}>Producer slug: {farm.producer?.slug ?? "n/a"}</ThemedText>
            <ThemedText style={styles.meta}>Farm slug: {farm.slug}</ThemedText>
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
  meta: {
    color: '#5f5146',
  },
});
