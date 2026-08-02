import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { ThemedText } from "@/components/themed-text";
import { fetchCoffeeCatalog, fetchProducerBySlug, type CoffeeRead, type ProducerRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export default function ProducerDetailScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const router = useRouter();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [producer, setProducer] = useState<ProducerRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [linkedLoading, setLinkedLoading] = useState(true);

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

  useEffect(() => {
    let active = true;

    async function loadLinkedCoffees() {
      if (!producer?.slug) {
        if (active) {
          setCoffees([]);
          setLinkedLoading(false);
        }
        return;
      }

      setLinkedLoading(true);

      try {
        const page = await fetchCoffeeCatalog({
          producerSlug: producer.slug,
          pageSize: 4,
          sort: "featured",
        });
        if (!active) return;
        setCoffees(page.items);
      } catch {
        if (!active) return;
        setCoffees([]);
      } finally {
        if (active) {
          setLinkedLoading(false);
        }
      }
    }

    void loadLinkedCoffees();

    return () => {
      active = false;
    };
  }, [producer?.slug]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailScreenShell
        loading={loading}
        error={error}
        loadingTitle="Loading producer..."
        errorTitle="Could not load producer."
        errorMessage={error ?? "Producer not found."}
        media={
          producer ? (
            <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
                {producer.image_url ? (
                  <Image
                    source={{ uri: producer.image_url }}
                    style={styles.mediaImage}
                    resizeMode="cover"
                  />
                ) : (
                  <>
                    <View style={[styles.mediaOverlay, { backgroundColor: theme.surfaceMuted }]} />
                    <View style={[styles.mediaMonogram, { backgroundColor: theme.accent }]}>
                      <ThemedText type="title" style={[styles.mediaMonogramText, { color: theme.accentForeground }]}>
                        {buildMonogram(producer.name)}
                      </ThemedText>
                    </View>
                  </>
                )}
              </View>
              <View style={styles.mediaCopy}>
                <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Producer collective</ThemedText>
                <ThemedText type="subtitle">{producer.name}</ThemedText>
                <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                  {producer.description || "A producer profile without a description yet."}
                </ThemedText>
              </View>
              <View style={styles.mediaStats}>
                <View style={[styles.mediaStat, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Family</ThemedText>
                  <ThemedText type="defaultSemiBold">{producer.family || "n/a"}</ThemedText>
                </View>
                <View style={[styles.mediaStat, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Farms</ThemedText>
                  <ThemedText type="defaultSemiBold">{producer.farms.length}</ThemedText>
                </View>
              </View>
            </View>
          ) : null
        }
        actions={
          <>
            <Pressable onPress={() => router.push("/producers")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Back</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Coffees</ThemedText>
            </Pressable>
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
            <ThemedText type="subtitle">Linked farms</ThemedText>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>
              The farms below keep the origin chain connected to the producer profile.
            </ThemedText>
            <View style={styles.list}>
              {producer.farms.length > 0 ? (
                producer.farms.map((farm) => (
                  <Pressable
                    key={farm.id}
                    onPress={() => router.push(`/farms/${farm.slug}`)}
                    style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
                  >
                    <View style={styles.cardHeader}>
                      <ThemedText type="subtitle">{farm.name}</ThemedText>
                      <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{farm.state}</ThemedText>
                    </View>
                    <ThemedText style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={2}>
                      {farm.municipality || "n/a"}
                    </ThemedText>
                    <View style={styles.cardChips}>
                      {farm.municipality ? (
                        <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                          <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                            {farm.municipality}
                          </ThemedText>
                        </View>
                      ) : null}
                      <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                        <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                          {farm.altitude_meters ? `${farm.altitude_meters.toLocaleString()} m` : "Altitude unknown"}
                        </ThemedText>
                      </View>
                    </View>
                  </Pressable>
                ))
              ) : (
                <ThemedText style={[styles.emptyText, { color: theme.mutedText }]}>No farms linked yet.</ThemedText>
              )}
            </View>
            <View style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Family</ThemedText>
                <ThemedText type="defaultSemiBold">{producer.family || "n/a"}</ThemedText>
              </View>
              <View style={styles.summaryRow}>
                <ThemedText style={[styles.summaryLabel, { color: theme.mutedText }]}>Source type</ThemedText>
                <ThemedText type="defaultSemiBold">{producer.farms.length > 1 ? "Multi-farm" : "Single farm"}</ThemedText>
              </View>
            </View>
            <View style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText style={[styles.nextPathsKicker, { color: theme.mutedText }]}>Linked coffees</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.mutedText }]}>
                These coffees carry the producer forward into the catalog, where you can compare process, varietal,
                and tasting notes.
              </ThemedText>
              {linkedLoading ? (
                <ThemedText style={[styles.emptyText, { color: theme.mutedText }]}>Loading coffees...</ThemedText>
              ) : coffees.length > 0 ? (
                <View style={styles.list}>
                  {coffees.map((coffee) => (
                    <Pressable
                      key={coffee.id}
                      onPress={() => router.push(`/coffees/${coffee.slug}`)}
                      style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
                    >
                      <View style={styles.cardHeader}>
                        <ThemedText type="subtitle">{coffee.name}</ThemedText>
                        <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{coffee.origin_state}</ThemedText>
                      </View>
                      <ThemedText style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={2}>
                        {coffee.process || "Process unknown"}
                        {coffee.varietal ? ` · ${coffee.varietal}` : ""}
                      </ThemedText>
                      <View style={styles.cardChips}>
                        <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                          <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                            {coffee.producer?.name ?? producer.name}
                          </ThemedText>
                        </View>
                        <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                          <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                            {coffee.is_featured ? "Featured" : "Catalog lot"}
                          </ThemedText>
                        </View>
                      </View>
                    </Pressable>
                  ))}
                </View>
              ) : (
                <ThemedText style={[styles.emptyText, { color: theme.mutedText }]}>No coffees linked yet.</ThemedText>
              )}
            </View>
            <View style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText style={[styles.nextPathsKicker, { color: theme.mutedText }]}>Reading cues</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.mutedText }]}>
                Start with the producer to understand the collective, then read the farms to see how the origin
                chain fans out across places and altitudes.
              </ThemedText>
              <View style={styles.cardChips}>
                {[
                  producer.family || "Family unknown",
                  `${producer.farms.length} farms`,
                  producer.farms[0]?.state ?? "State n/a",
                  producer.farms[0]?.altitude_meters
                    ? `${producer.farms[0].altitude_meters.toLocaleString()} m`
                    : "Altitude n/a",
                ].map((cue) => (
                  <View key={cue} style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                    <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      {cue}
                    </ThemedText>
                  </View>
                ))}
              </View>
            </View>
            <View style={[styles.nextPaths, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText style={[styles.nextPathsKicker, { color: theme.mutedText }]}>Continue exploring</ThemedText>
              <View style={styles.nextPathsGrid}>
                <Pressable
                  onPress={() => router.push(`/?producer_slug=${encodeURIComponent(producer.slug)}`)}
                  style={[styles.nextPathCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <ThemedText type="defaultSemiBold">View coffees</ThemedText>
                  <ThemedText style={[styles.nextPathBody, { color: theme.mutedText }]}>
                    Filter the catalog to this producer.
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/producers")}
                  style={[styles.nextPathCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <ThemedText type="defaultSemiBold">All producers</ThemedText>
                  <ThemedText style={[styles.nextPathBody, { color: theme.mutedText }]}>
                    Return to the origin index.
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => router.push("/farms")}
                  style={[styles.nextPathCard, { borderColor: theme.border, backgroundColor: theme.surface }]}
                >
                  <ThemedText type="defaultSemiBold">All farms</ThemedText>
                  <ThemedText style={[styles.nextPathBody, { color: theme.mutedText }]}>
                    Browse the farm index next.
                  </ThemedText>
                </Pressable>
              </View>
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
  emptyText: {
    lineHeight: 20,
  },
  mediaCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mediaFrame: {
    aspectRatio: 1.35,
    justifyContent: "flex-end",
    padding: 16,
  },
  mediaImage: {
    width: "100%",
    height: "100%",
  },
  mediaOverlay: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.85,
  },
  mediaMonogram: {
    alignSelf: "flex-start",
    width: 88,
    height: 88,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  mediaMonogramText: {
    fontSize: 30,
    lineHeight: 34,
  },
  mediaCopy: {
    paddingHorizontal: 16,
    gap: 8,
  },
  mediaLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  mediaBody: {
    lineHeight: 20,
  },
  mediaStats: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  mediaStat: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 4,
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
  meta: {
    lineHeight: 20,
  },
  cardChips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  cardChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  cardChipText: {
    fontSize: 11,
  },
  summary: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  summaryLabel: {
    fontSize: 12,
  },
  nextPaths: {
    marginTop: 16,
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 14,
    gap: 10,
  },
  nextPathsKicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  nextPathsGrid: {
    gap: 10,
  },
  nextPathCard: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 12,
    gap: 4,
  },
  nextPathBody: {
    lineHeight: 18,
  },
});
