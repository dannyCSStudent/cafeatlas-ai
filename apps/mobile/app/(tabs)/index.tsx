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
import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { StatusPanel } from "@/components/status-panel";
import {
  fetchCoffeeCatalog,
  formatPrice,
  type CoffeeCatalogParams,
  type CoffeeRead,
} from "@/lib/cafeatlas-api";

type SortOption = NonNullable<CoffeeCatalogParams["sort"]>;

const SORT_OPTIONS = [
  "newest",
  "price_asc",
  "price_desc",
  "featured",
] as const satisfies readonly SortOption[];

const STATE_OPTIONS = ["Chiapas", "Oaxaca", "Veracruz"] as const;
const DEFAULT_PAGE_SIZE = 8;

type CatalogSearchParams = {
  page?: string;
  sort?: string;
  featured?: string;
  state?: string;
  producer_slug?: string;
  q?: string;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function parseCatalogParams(params: CatalogSearchParams): {
  page: number;
  sort: SortOption;
  featured: boolean | null;
  state: string | null;
  producerSlug: string | null;
  q: string | null;
} {
  const page = Number.parseInt(firstParam(params.page) ?? "1", 10);
  const sort = firstParam(params.sort) ?? "newest";
  const featured = firstParam(params.featured);
  const state = firstParam(params.state)?.trim() || null;
  const producerSlug = firstParam(params.producer_slug)?.trim() || null;
  const q = firstParam(params.q)?.trim() || null;
  const normalizedSort = sort as SortOption;
  const resolvedSort: SortOption =
    normalizedSort === "newest" ||
    normalizedSort === "price_asc" ||
    normalizedSort === "price_desc" ||
    normalizedSort === "featured"
      ? normalizedSort
      : "newest";

  return {
    page: Number.isFinite(page) && page > 0 ? page : 1,
    sort: resolvedSort,
    featured: featured === "true" ? true : featured === "false" ? false : null,
    state,
    producerSlug,
    q,
  };
}

function buildCatalogQuery(params: {
  page: number;
  sort: NonNullable<CoffeeCatalogParams["sort"]>;
  featured: boolean | null;
  state: string | null;
  producerSlug: string | null;
  q: string | null;
}) {
  const query = new URLSearchParams();
  if (params.page > 1) query.set("page", String(params.page));
  if (params.sort !== "newest") query.set("sort", params.sort);
  if (typeof params.featured === "boolean") query.set("featured", String(params.featured));
  if (params.state) query.set("state", params.state);
  if (params.producerSlug) query.set("producer_slug", params.producerSlug);
  if (params.q) query.set("q", params.q);
  return query.toString();
}

export default function CoffeeCatalogScreen() {
  const router = useRouter();
  const searchParams = useLocalSearchParams<CatalogSearchParams>();
  const routeParams = parseCatalogParams(searchParams);
  const { page, sort, featured, state, producerSlug, q } = routeParams;
  const [searchDraft, setSearchDraft] = useState(q ?? "");
  const catalogFilters = useMemo(
    () => ({
      page,
      pageSize: DEFAULT_PAGE_SIZE,
      sort,
      q: q ?? undefined,
      state: state ?? undefined,
      producerSlug: producerSlug ?? undefined,
      featured,
    } satisfies CoffeeCatalogParams),
    [page, sort, q, featured, state, producerSlug]
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

  useEffect(() => {
    setSearchDraft(q ?? "");
  }, [q]);

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
        <CatalogFilterBar
          searchDraft={searchDraft}
          onSearchDraftChange={setSearchDraft}
          onSearchSubmit={() => updateRoute({ page: 1, q: searchDraft.trim() ? searchDraft.trim() : null })}
          onSearchClear={q ? () => updateRoute({ page: 1, q: null }) : undefined}
          onReset={() => updateRoute({ page: 1, sort: "newest", featured: null, state: null, producerSlug: null, q: null })}
          featured={featured}
          onToggleFeatured={() => updateRoute({ page: 1, featured: featured === true ? null : true })}
          stateOptions={STATE_OPTIONS}
          currentState={routeParams.state}
          onToggleState={(state) => updateRoute({ page: 1, state: routeParams.state === state ? null : state })}
          producerChips={currentProducerChips}
          currentProducerSlug={routeParams.producerSlug}
          onToggleProducerSlug={(slug) =>
            updateRoute({ page: 1, producerSlug: routeParams.producerSlug === slug ? null : slug })
          }
          sortOptions={SORT_OPTIONS}
          currentSort={routeParams.sort}
          onChangeSort={(option) => updateRoute({ page: 1, sort: option })}
        />

        {loading ? (
          <StatusPanel title="Loading coffees..." loading />
        ) : error ? (
          <StatusPanel title="Could not load coffees." message={error} />
        ) : coffees.length === 0 ? (
          <StatusPanel
            title="No coffees matched your filters."
            message="Try clearing a filter or broadening the search."
          />
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
