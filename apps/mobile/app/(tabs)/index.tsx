import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import {
  fetchCoffeeCatalog,
  formatPrice,
  type CoffeeCatalogParams,
  type CoffeeRead,
} from "@/lib/cafeatlas-api";

const SORT_OPTIONS: NonNullable<CoffeeCatalogParams["sort"]>[] = [
  "newest",
  "price_asc",
  "price_desc",
  "featured",
];

const STATE_OPTIONS = ["Chiapas", "Oaxaca", "Veracruz"] as const;
const DEFAULT_PAGE_SIZE = 8;

type CatalogSearchParams = {
  page?: string;
  sort?: string;
  featured?: string;
  state?: string;
  producer_slug?: string;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCatalogParams(params: CatalogSearchParams) {
  const page = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const sort = firstParam(params.sort) ?? "newest";
  const featured = firstParam(params.featured);
  const state = firstParam(params.state)?.trim() || null;
  const producerSlug = firstParam(params.producer_slug)?.trim() || null;

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: SORT_OPTIONS.includes(sort as NonNullable<CoffeeCatalogParams["sort"]>)
      ? (sort as NonNullable<CoffeeCatalogParams["sort"]>)
      : "newest",
    featured: featured === "true" ? true : featured === "false" ? false : null,
    state,
    producerSlug,
  };
}

function buildCatalogQuery(params: {
  page: number;
  sort: NonNullable<CoffeeCatalogParams["sort"]>;
  featured: boolean | null;
  state: string | null;
  producerSlug: string | null;
}) {
  const query = new URLSearchParams();
  if (params.page > 1) query.set("page", String(params.page));
  if (params.sort !== "newest") query.set("sort", params.sort);
  if (typeof params.featured === "boolean") query.set("featured", String(params.featured));
  if (params.state) query.set("state", params.state);
  if (params.producerSlug) query.set("producer_slug", params.producerSlug);
  return query.toString();
}

export default function CoffeeCatalogScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<CatalogSearchParams>();
  const routeParams = parseCatalogParams(searchParams);
  const { page, sort, featured, state, producerSlug } = routeParams;
  const catalogFilters = useMemo(
    () => ({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      sort,
      state: state ?? undefined,
      producerSlug: producerSlug ?? undefined,
      featured,
    } satisfies CoffeeCatalogParams),
    [page, sort, featured, state, producerSlug]
  );

  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [hasNext, setHasNext] = useState(false);

  const loadCatalog = useCallback(
    async (filters: CoffeeCatalogParams, replace: boolean, refresh = false) => {
      if (refresh) {
        setRefreshing(true);
      } else if (replace) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      setError(null);

      try {
        const result = await fetchCoffeeCatalog(filters);
        setCoffees((current) => (replace ? result.items : [...current, ...result.items]));
        setTotal(result.total);
        setTotalPages(result.total_pages);
        setHasNext(result.has_next);
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Failed to load catalog.");
      } finally {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    },
    []
  );

  useEffect(() => {
    void loadCatalog(catalogFilters, catalogFilters.page === 1);
  }, [loadCatalog, catalogFilters]);

  const currentProducerChips = useMemo(
    () =>
      Array.from(
        new Map(
          coffees
            .filter((coffee) => coffee.producer?.slug)
            .map((coffee) => [coffee.producer?.slug ?? coffee.producer_name, coffee.producer?.name ?? coffee.producer_name])
        ).entries()
      ),
    [coffees]
  );

  function updateRoute(next: Partial<ReturnType<typeof parseCatalogParams>>) {
    const merged = { ...routeParams, ...next };
    router.replace(`/?${buildCatalogQuery(merged)}`);
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => void loadCatalog(catalogFilters, true, true)}
        />
      }>
      <ThemedView style={styles.hero}>
        <View style={styles.badge}>
          <ThemedText type="defaultSemiBold" style={styles.badgeText}>
            CafeAtlas AI
          </ThemedText>
        </View>
        <ThemedText type="title" style={styles.heroTitle}>
          Specialty coffee on mobile.
        </ThemedText>
        <ThemedText style={styles.heroBody}>
          Browse the live FastAPI catalog, then jump into coffee, producer, and farm detail pages.
        </ThemedText>

        <View style={styles.heroStats}>
          <Stat label="Coffees" value={String(total)} />
          <Stat label="Page" value={`${page}/${Math.max(totalPages, 1)}`} />
          <Stat label="Sort" value={String(sort).replace("_", " ")} />
        </View>

        <View style={styles.actions}>
          <Link href="/producers" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText type="defaultSemiBold">Producers</ThemedText>
            </Pressable>
          </Link>
          <Link href="/farms" asChild>
            <Pressable style={styles.secondaryButton}>
              <ThemedText type="defaultSemiBold">Farms</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      <ThemedView style={styles.panel}>
        <View style={styles.filterRow}>
          <ThemedText type="subtitle">Catalog</ThemedText>
          <Pressable
            onPress={() => updateRoute({ page: 1, sort: "newest", featured: null, state: null, producerSlug: null })}
            style={styles.clearButton}
          >
            <ThemedText type="defaultSemiBold" style={styles.clearButtonText}>
              Reset
            </ThemedText>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRowChips}>
          <Pressable
            onPress={() => updateRoute({ page: 1, featured: featured === true ? null : true })}
            style={[styles.chip, featured === true && styles.chipActive]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={featured === true ? styles.chipTextActive : styles.chipText}
            >
              Featured only
            </ThemedText>
          </Pressable>

          {STATE_OPTIONS.map((state) => (
            <Pressable
              key={state}
              onPress={() => updateRoute({ page: 1, state: routeParams.state === state ? null : state })}
              style={[styles.chip, routeParams.state === state && styles.chipActive]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={routeParams.state === state ? styles.chipTextActive : styles.chipText}
              >
                {state}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.filterGroup}>
          <ThemedText style={styles.filterGroupLabel}>Producers</ThemedText>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
            {currentProducerChips.map(([slug, label]: [string, string]) => (
              <Pressable
                key={slug}
                onPress={() => updateRoute({ page: 1, producerSlug: routeParams.producerSlug === slug ? null : slug })}
                style={[styles.sortChip, routeParams.producerSlug === slug && styles.sortChipActive]}
              >
                <ThemedText
                  type="defaultSemiBold"
                  style={routeParams.producerSlug === slug ? styles.sortChipTextActive : styles.sortChipText}
                >
                  {label}
                </ThemedText>
              </Pressable>
            ))}
          </ScrollView>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.sortRow}>
          {SORT_OPTIONS.map((option) => (
            <Pressable
              key={option}
              onPress={() => updateRoute({ page: 1, sort: option })}
              style={[styles.sortChip, routeParams.sort === option && styles.sortChipActive]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={routeParams.sort === option ? styles.sortChipTextActive : styles.sortChipText}
              >
                {option.replace("_", " ")}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>

        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator />
            <ThemedText style={styles.stateText}>Loading coffees...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <ThemedText type="defaultSemiBold">Could not load coffees</ThemedText>
            <ThemedText style={styles.stateText}>{error}</ThemedText>
          </View>
        ) : coffees.length === 0 ? (
          <View style={styles.stateBox}>
            <ThemedText type="defaultSemiBold">No coffees matched your filters.</ThemedText>
          </View>
        ) : (
          <View style={styles.cardGrid}>
            {coffees.map((coffee) => (
              <Link key={coffee.id} href={`/coffees/${coffee.slug}`} asChild>
                <Pressable style={styles.card}>
                  <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                      <ThemedText type="subtitle">{coffee.name}</ThemedText>
                      <ThemedText style={styles.cardMeta}>{coffee.origin_state}</ThemedText>
                    </View>
                    {coffee.is_featured ? (
                      <View style={styles.featureBadge}>
                        <ThemedText type="defaultSemiBold" style={styles.featureBadgeText}>
                          Featured
                        </ThemedText>
                      </View>
                    ) : null}
                  </View>

                  <ThemedText numberOfLines={3} style={styles.cardBody}>
                    {coffee.description || "A coffee with no description yet."}
                  </ThemedText>

                  <View style={styles.cardFooter}>
                    <View>
                      <ThemedText style={styles.cardLabel}>Price</ThemedText>
                      <ThemedText type="defaultSemiBold">{formatPrice(coffee.price_cents)}</ThemedText>
                    </View>
                    <View style={styles.cardPill}>
                      <ThemedText type="defaultSemiBold">Open</ThemedText>
                    </View>
                  </View>
                </Pressable>
              </Link>
            ))}
          </View>
        )}

        {!loading && !error && hasNext ? (
          <Pressable
            onPress={() => updateRoute({ page: routeParams.page + 1 })}
            style={styles.loadMoreButton}
          >
            {loadingMore ? (
              <ActivityIndicator color="#ffffff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.loadMoreText}>
                Load more
              </ThemedText>
            )}
          </Pressable>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={styles.cardLabel}>{label}</ThemedText>
      <ThemedText type="title" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fff8f1",
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    backgroundColor: "#22150f",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    color: "#ffffff",
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
  heroBody: {
    color: "#5f5146",
  },
  heroStats: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.14)",
  },
  statValue: {
    fontSize: 24,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.2)",
    backgroundColor: "#ffffff",
  },
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fffdf9",
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  filterRowChips: {
    gap: 10,
    paddingRight: 8,
  },
  filterGroup: {
    gap: 10,
  },
  filterGroupLabel: {
    color: "#7d6e62",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  clearButton: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#22150f",
  },
  clearButtonText: {
    color: "#ffffff",
    fontSize: 13,
  },
  chip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3ece4",
  },
  chipActive: {
    backgroundColor: "#22150f",
  },
  chipText: {
    color: "#5f5146",
    fontSize: 13,
  },
  chipTextActive: {
    color: "#ffffff",
    fontSize: 13,
  },
  sortRow: {
    gap: 10,
    paddingRight: 8,
  },
  sortChip: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#f3ece4",
  },
  sortChipActive: {
    backgroundColor: "#8c5b2b",
  },
  sortChipText: {
    color: "#5f5146",
    fontSize: 13,
    textTransform: "capitalize",
  },
  sortChipTextActive: {
    color: "#ffffff",
    fontSize: 13,
    textTransform: "capitalize",
  },
  stateBox: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 160,
    gap: 10,
  },
  stateText: {
    color: "#5f5146",
    textAlign: "center",
  },
  loadMoreButton: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 14,
    backgroundColor: "#22150f",
  },
  loadMoreText: {
    color: "#ffffff",
  },
  cardGrid: {
    gap: 12,
  },
  card: {
    borderRadius: 24,
    backgroundColor: "#ffffff",
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.14)",
    gap: 12,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  cardMeta: {
    color: "#7d6e62",
    marginTop: 4,
  },
  featureBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#def3df",
  },
  featureBadgeText: {
    fontSize: 12,
    color: "#2f6b3f",
  },
  cardBody: {
    color: "#5f5146",
  },
  cardFooter: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(120, 85, 50, 0.16)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    color: "#7d6e62",
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#22150f",
  },
});
