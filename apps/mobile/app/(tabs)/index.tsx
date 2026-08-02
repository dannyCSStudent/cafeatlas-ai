import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { CatalogFilterBar } from "@/components/catalog-filter-bar";
import { StatusPanel } from "@/components/status-panel";
import { useColorScheme } from "@/hooks/use-color-scheme";
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

function buildMonogram(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function splitNotes(value?: string | null) {
  return value
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean)
    .slice(0, 4) ?? [];
}

export default function CoffeeCatalogScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
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
  const editorialCoffee = useMemo(
    () => coffees.find((coffee) => coffee.is_featured) ?? coffees[0] ?? null,
    [coffees]
  );
  const editorialNotes = useMemo(() => splitNotes(editorialCoffee?.tasting_notes), [editorialCoffee?.tasting_notes]);

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
      <ThemedView
        style={[
          styles.hero,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          },
        ]}
      >
        <View style={[styles.badge, { backgroundColor: theme.accent }]}>
          <ThemedText type="defaultSemiBold" style={[styles.badgeText, { color: theme.accentForeground }]}>
            {cafeAtlasBrand.monogram}
          </ThemedText>
        </View>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{cafeAtlasBrand.name}</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>
          Specialty coffee on mobile.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>
          Browse the live catalog, then move into coffee, producer, and farm detail pages when you want more
          context.
        </ThemedText>

        <View style={styles.heroStats}>
          <Stat theme={theme} label="Coffees" value={String(total)} />
          <Stat theme={theme} label="Page" value={`${page}/${Math.max(totalPages, 1)}`} />
          <Stat theme={theme} label="Sort" value={String(sort).replace("_", " ")} />
        </View>

        <View style={styles.actions}>
          <Pressable
            style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}
            onPress={() => router.push("/?sort=featured&featured=true")}
          >
            <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
              Featured
            </ThemedText>
          </Pressable>
          <Pressable
            style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            onPress={() => router.push("/learn")}
          >
            <ThemedText type="defaultSemiBold">Learn hub</ThemedText>
          </Pressable>
        </View>
        <Pressable
          onPress={() => router.push("/about")}
          style={[styles.aboutLink, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
        >
          <ThemedText style={[styles.aboutLinkText, { color: theme.mutedText }]}>About the project</ThemedText>
        </Pressable>
      </ThemedView>

      <ThemedView
        style={[
          styles.editorialPanel,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceStrong,
          },
        ]}
      >
        <View style={styles.editorialHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText style={[styles.editorialKicker, { color: theme.mutedText }]}>Field notes</ThemedText>
            <ThemedText type="subtitle" style={styles.editorialTitle}>
              A live coffee story from the catalog
            </ThemedText>
          </View>
          <Pressable
            onPress={() => router.push("/")}
            style={[styles.editorialButton, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}
          >
            <ThemedText type="defaultSemiBold">Open catalog</ThemedText>
          </Pressable>
        </View>

        {editorialCoffee ? (
          <View style={[styles.editorialCard, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <View style={[styles.editorialImageWrap, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              {editorialCoffee.image_url ? (
                <Image source={{ uri: editorialCoffee.image_url }} style={styles.editorialImage} resizeMode="cover" />
              ) : (
                <View style={[styles.editorialFallback, { backgroundColor: theme.surfaceMuted }]}>
                  <View style={[styles.cardMonogram, { backgroundColor: theme.accent }]}>
                    <ThemedText type="defaultSemiBold" style={[styles.cardMonogramText, { color: theme.accentForeground }]}>
                      {buildMonogram(editorialCoffee.name)}
                    </ThemedText>
                  </View>
                </View>
              )}
            </View>

            <View style={styles.editorialCopy}>
              <ThemedText style={[styles.cardLabel, { color: theme.mutedText }]}>
                {editorialCoffee.origin_state}
              </ThemedText>
              <ThemedText type="subtitle">{editorialCoffee.name}</ThemedText>
              <ThemedText style={[styles.editorialBody, { color: theme.mutedText }]}>
                {editorialCoffee.description || "A coffee with no description yet."}
              </ThemedText>
              <View style={styles.cardChips}>
                {editorialCoffee.process ? (
                  <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      {editorialCoffee.process}
                    </ThemedText>
                  </View>
                ) : null}
                {editorialCoffee.varietal ? (
                  <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      {editorialCoffee.varietal}
                    </ThemedText>
                  </View>
                ) : null}
                {editorialCoffee.producer?.name ? (
                  <View style={[styles.cardChip, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                    <ThemedText style={[styles.cardChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      {editorialCoffee.producer.name}
                    </ThemedText>
                  </View>
                ) : null}
              </View>
            </View>

            <View style={[styles.editorialFooter, { borderTopColor: theme.border }]}>
              <ThemedText style={[styles.cardLabel, { color: theme.mutedText }]}>Tasting notes</ThemedText>
              <View style={styles.editorialNotes}>
                {editorialNotes.length > 0 ? (
                  editorialNotes.map((note) => (
                    <View key={note} style={[styles.noteChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                      <ThemedText style={[styles.noteChipText, { color: theme.mutedText }]} numberOfLines={1}>
                        {note}
                      </ThemedText>
                    </View>
                  ))
                ) : (
                  <View style={[styles.noteChip, { backgroundColor: theme.surfaceMuted, borderColor: theme.border }]}>
                    <ThemedText style={[styles.noteChipText, { color: theme.mutedText }]} numberOfLines={1}>
                      Not yet described
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>
          </View>
      ) : (
          <StatusPanel
            title="No editorial coffee is available yet."
            message="Seed data will populate this section once coffees exist in the database."
          />
        )}
      </ThemedView>

      <View style={styles.startGrid}>
        <Pressable
          onPress={() => router.push("/?sort=featured&featured=true")}
          style={[styles.startCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
        >
          <View style={styles.startMarkRow}>
            <View style={[styles.startMark, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText type="defaultSemiBold" style={{ color: theme.mutedText }}>
                01
              </ThemedText>
            </View>
            <View style={[styles.startDivider, { backgroundColor: theme.border }]} />
          </View>
          <ThemedText style={[styles.startKicker, { color: theme.mutedText }]}>Featured lots</ThemedText>
          <ThemedText type="subtitle" style={styles.startTitle}>
            Featured coffees
          </ThemedText>
          <ThemedText style={[styles.startBody, { color: theme.mutedText }]}>
            See the lots the backend is spotlighting right now.
          </ThemedText>
        </Pressable>

        <Pressable
          onPress={() => router.push("/producers")}
          style={[styles.startCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
        >
          <View style={styles.startMarkRow}>
            <View style={[styles.startMark, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText type="defaultSemiBold" style={{ color: theme.mutedText }}>
                02
              </ThemedText>
            </View>
            <View style={[styles.startDivider, { backgroundColor: theme.border }]} />
          </View>
          <ThemedText style={[styles.startKicker, { color: theme.mutedText }]}>Origin map</ThemedText>
          <ThemedText type="subtitle" style={styles.startTitle}>
            Origin stories
          </ThemedText>
            <ThemedText style={[styles.startBody, { color: theme.mutedText }]}>
              Step into the producers and farms behind the catalog.
            </ThemedText>
          </Pressable>

        <Pressable
          onPress={() => router.push(editorialCoffee ? `/coffees/${editorialCoffee.slug}` : "/")}
          style={[styles.startCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
        >
          <View style={styles.startMarkRow}>
            <View style={[styles.startMark, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText type="defaultSemiBold" style={{ color: theme.mutedText }}>
                03
              </ThemedText>
            </View>
            <View style={[styles.startDivider, { backgroundColor: theme.border }]} />
          </View>
          <ThemedText style={[styles.startKicker, { color: theme.mutedText }]}>Cup profile</ThemedText>
          <ThemedText type="subtitle" style={styles.startTitle}>
            Process notes
          </ThemedText>
          <ThemedText style={[styles.startBody, { color: theme.mutedText }]}>
            Open a live coffee detail page for process, varietal, and tasting notes.
          </ThemedText>
        </Pressable>
      </View>

          <View style={[styles.guideCallout, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={{ flex: 1, gap: 4 }}>
              <ThemedText style={[styles.guideKicker, { color: theme.mutedText }]}>Guide</ThemedText>
              <ThemedText type="subtitle">Need a quick primer before you browse?</ThemedText>
              <ThemedText style={[styles.guideBody, { color: theme.mutedText }]}>
                Open the hub, reading guide, taste guide, read acidity, sourcing note, or seasonal notes for a
                simple tour of origin, process, varietal, and tasting notes.
              </ThemedText>
            </View>
            <View style={styles.guideActions}>
              <Pressable
                onPress={() => router.push("/learn")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Hub</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/how-to-read-a-coffee-profile")}
                style={[styles.guideButton, { backgroundColor: theme.accent }]}
              >
                <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
                  Reading
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/how-to-taste-a-coffee")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Taste</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/how-to-read-acidity")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Acidity</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/how-to-compare-coffee-profiles")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Compare</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/how-sourcing-works")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Sourcing</ThemedText>
              </Pressable>
              <Pressable
                onPress={() => router.push("/learn/seasonal-notes")}
                style={[styles.guideButton, { backgroundColor: theme.surfaceMuted }]}
              >
                <ThemedText type="defaultSemiBold">Seasonal</ThemedText>
              </Pressable>
            </View>
          </View>

      <ThemedView
        style={[
          styles.panel,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceStrong,
          },
        ]}
      >
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
              <Pressable
                key={coffee.id}
                onPress={() => router.push(`/coffees/${coffee.slug}`)}
                style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
              >
                <View style={[styles.cardMedia, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                  {coffee.image_url ? (
                    <Image source={{ uri: coffee.image_url }} style={styles.cardImage} resizeMode="cover" />
                  ) : (
                    <View style={[styles.cardFallback, { backgroundColor: theme.surfaceMuted }]}>
                      <View style={[styles.cardMonogram, { backgroundColor: theme.accent }]}>
                        <ThemedText type="defaultSemiBold" style={[styles.cardMonogramText, { color: theme.accentForeground }]}>
                          {buildMonogram(coffee.name)}
                        </ThemedText>
                      </View>
                    </View>
                  )}
                </View>
                <View style={styles.cardHeader}>
                  <View style={{ flex: 1 }}>
                    <ThemedText type="subtitle">{coffee.name}</ThemedText>
                    <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{coffee.origin_state}</ThemedText>
                  </View>
                  {coffee.is_featured ? (
                    <View style={[styles.featureBadge, { backgroundColor: theme.success }]}>
                      <ThemedText
                        type="defaultSemiBold"
                        style={[styles.featureBadgeText, { color: theme.successForeground }]}
                      >
                        Featured
                      </ThemedText>
                    </View>
                  ) : null}
                </View>

                <ThemedText numberOfLines={3} style={[styles.cardBody, { color: theme.mutedText }]}>
                  {coffee.description || "A coffee with no description yet."}
                </ThemedText>

                <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
                  <View>
                    <ThemedText style={[styles.cardLabel, { color: theme.mutedText }]}>Price</ThemedText>
                    <ThemedText type="defaultSemiBold">{formatPrice(coffee.price_cents)}</ThemedText>
                  </View>
                  <View style={[styles.cardPill, { backgroundColor: theme.accent }]}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
                      Open
                    </ThemedText>
                  </View>
                </View>
              </Pressable>
            ))}
          </View>
        )}

        {!loading && !error && hasNext ? (
          <Pressable
            onPress={() => updateRoute({ page: routeParams.page + 1 })}
            style={[styles.loadMoreButton, { backgroundColor: theme.accent }]}
          >
            {loadingMore ? (
              <ActivityIndicator color={theme.accentForeground} />
            ) : (
              <ThemedText
                type="defaultSemiBold"
                style={[styles.loadMoreText, { color: theme.accentForeground }]}
              >
                Load more
              </ThemedText>
            )}
          </Pressable>
        ) : null}
      </ThemedView>
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) {
  return (
    <View style={[styles.statCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
      <ThemedText style={[styles.cardLabel, { color: theme.mutedText }]}>{label}</ThemedText>
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
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  badgeText: {
    fontSize: 12,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  kicker: {
    color: "#6f6157",
    fontSize: 12,
    letterSpacing: 1.8,
    textTransform: "uppercase",
  },
  heroTitle: {
    fontSize: 34,
    lineHeight: 38,
  },
  heroBody: {},
  heroStats: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 20,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  statValue: {
    fontSize: 24,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  aboutLink: {
    alignSelf: "center",
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  aboutLinkText: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editorialPanel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  startGrid: {
    gap: 12,
  },
  startCard: {
    borderRadius: 24,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  startKicker: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  startTitle: {
    marginTop: 2,
  },
  startBody: {
    lineHeight: 20,
  },
  startMarkRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  startMark: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  startDivider: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  guideCallout: {
    borderRadius: 24,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  guideActions: {
    gap: 8,
  },
  guideKicker: {
    fontSize: 11,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  guideBody: {
    lineHeight: 20,
  },
  guideButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  editorialHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  editorialKicker: {
    fontSize: 12,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  editorialTitle: {
    marginTop: 4,
  },
  editorialButton: {
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderWidth: StyleSheet.hairlineWidth,
  },
  editorialCard: {
    borderRadius: 24,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  editorialImageWrap: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    aspectRatio: 1.45,
  },
  editorialImage: {
    width: "100%",
    height: "100%",
  },
  editorialFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  editorialCopy: {
    gap: 8,
  },
  editorialBody: {
    lineHeight: 20,
  },
  editorialFooter: {
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  editorialNotes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  noteChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  noteChipText: {
    fontSize: 11,
  },
  loadMoreButton: {
    marginTop: 4,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 14,
  },
  loadMoreText: {},
  cardGrid: {
    gap: 12,
  },
  card: {
    borderRadius: 24,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  cardMedia: {
    overflow: "hidden",
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    aspectRatio: 1.65,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardFallback: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMonogram: {
    width: 62,
    height: 62,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  cardMonogramText: {
    fontSize: 20,
  },
  cardHeader: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
  },
  cardMeta: {
    marginTop: 4,
  },
  featureBadge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  featureBadgeText: {
    fontSize: 12,
  },
  cardBody: {
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
  cardFooter: {
    marginTop: 4,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  cardPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
});
