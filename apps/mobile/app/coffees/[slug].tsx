import { Link, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { fetchCoffeeBySlug, formatPrice, type CoffeeRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export default function CoffeeDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
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
      <DetailScreenShell
        loading={loading}
        error={error}
        loadingTitle="Loading coffee..."
        errorTitle="Could not load coffee."
        errorMessage={error ?? "Coffee not found."}
        media={
          coffee ? (
            <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
                {coffee.image_url ? (
                  <Image
                    source={{ uri: coffee.image_url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.mediaFallback, { backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.mutedText }}>
                      {coffee.name}
                    </ThemedText>
                  </View>
                )}
              </View>
              <View style={styles.mediaMeta}>
                <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Process</ThemedText>
                <ThemedText type="defaultSemiBold">{coffee.process || "n/a"}</ThemedText>
              </View>
              <View style={styles.mediaMeta}>
                <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Varietal</ThemedText>
                <ThemedText type="defaultSemiBold">{coffee.varietal || "n/a"}</ThemedText>
              </View>
              <View style={styles.mediaMeta}>
                <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Notes</ThemedText>
                <ThemedText type="defaultSemiBold">{coffee.tasting_notes || "n/a"}</ThemedText>
              </View>
            </View>
          ) : null
        }
        actions={
          <>
            <Link href="/" asChild>
              <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <ThemedText type="defaultSemiBold">Back</ThemedText>
              </Pressable>
            </Link>
            {coffee?.producer?.slug ? (
              <Link href={`/producers/${coffee.producer.slug}`} asChild>
                <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                  <ThemedText type="defaultSemiBold">Producer</ThemedText>
                </Pressable>
              </Link>
            ) : null}
            {coffee?.farm?.slug ? (
              <Link href={`/farms/${coffee.farm.slug}`} asChild>
                <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                  <ThemedText type="defaultSemiBold">Farm</ThemedText>
                </Pressable>
              </Link>
            ) : null}
          </>
        }
        title={coffee?.name ?? ""}
        description={coffee?.description || "This coffee does not have a description yet."}
        topStats={[
          { label: "State", value: coffee?.origin_state ?? "n/a" },
          { label: "Price", value: coffee ? formatPrice(coffee.price_cents) : "n/a" },
        ]}
        bottomStats={[
          { label: "Producer", value: coffee?.producer_name ?? "n/a" },
          { label: "Listed", value: coffee ? formatDate(coffee.created_at) : "n/a" },
        ]}
      >
        {coffee ? (
          <>
            <ThemedText type="subtitle">Origin profile</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Producer: {coffee.producer?.name ?? coffee.producer_name}</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Farm: {coffee.farm?.name ?? "Unknown farm"}</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Municipality: {coffee.farm?.municipality ?? "n/a"}</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>
              Altitude: {coffee.farm?.altitude_meters ? `${coffee.farm.altitude_meters.toLocaleString()} m` : "n/a"}
            </ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Slug: {coffee.slug}</ThemedText>
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
  mediaCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mediaFrame: {
    aspectRatio: 1.35,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
  },
  mediaMeta: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  mediaLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
    marginBottom: 4,
  },
  meta: {
  },
});
