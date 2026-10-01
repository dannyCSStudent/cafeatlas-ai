import { useCallback, useEffect, useMemo, useState } from "react";
import { Pressable, RefreshControl, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";
import { getPersistentItem, setPersistentItem } from "@/lib/persistent-storage";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STORAGE_KEY = "cafeatlas-journal-entries";

type JournalEntry = {
  rating: number | null;
  favorite: boolean;
  notes: string;
  updatedAt: string;
};

type JournalStore = Record<string, JournalEntry>;

const emptyEntry = (): JournalEntry => ({ rating: null, favorite: false, notes: "", updatedAt: new Date(0).toISOString() });

function parseJournal(value: string | null): JournalStore {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>).flatMap(([slug, raw]) => {
        if (!raw || typeof raw !== "object" || Array.isArray(raw)) return [];
        const entry = raw as Partial<JournalEntry>;
        const rating = typeof entry.rating === "number" && Number.isFinite(entry.rating) ? Math.min(5, Math.max(1, Math.round(entry.rating))) : null;
        return [[slug, { rating, favorite: Boolean(entry.favorite), notes: typeof entry.notes === "string" ? entry.notes : "", updatedAt: typeof entry.updatedAt === "string" ? entry.updatedAt : new Date(0).toISOString() }]];
      }),
    );
  } catch {
    return {};
  }
}

export default function JournalScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [journal, setJournal] = useState<JournalStore>({});
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadJournal = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const [catalog, stored] = await Promise.all([
        fetchCoffeeCatalog({ page: 1, pageSize: 12, sort: "newest" }),
        getPersistentItem(STORAGE_KEY),
      ]);
      setCoffees(catalog.items);
      setJournal(parseJournal(stored));
      setSelectedSlug((current) => current || catalog.items[0]?.slug || "");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load journal.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { void loadJournal(); }, [loadJournal]);

  const selectedCoffee = coffees.find((coffee) => coffee.slug === selectedSlug) ?? null;
  const activeEntry = selectedCoffee ? journal[selectedCoffee.slug] ?? emptyEntry() : emptyEntry();
  const entries = useMemo(() => Object.values(journal), [journal]);
  const favoriteCount = entries.filter((entry) => entry.favorite).length;
  const ratedCount = entries.filter((entry) => entry.rating !== null).length;

  async function updateActive(updates: Partial<JournalEntry>) {
    if (!selectedCoffee) return;
    const next: JournalStore = {
      ...journal,
      [selectedCoffee.slug]: { ...activeEntry, ...updates, updatedAt: new Date().toISOString() },
    };
    setJournal(next);
    await setPersistentItem(STORAGE_KEY, JSON.stringify(next));
  }

  async function clearJournal() {
    setJournal({});
    await setPersistentItem(STORAGE_KEY, "{}");
  }

  return (
    <ScrollView contentContainerStyle={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadJournal(true)} />}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Coffee journal</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>Keep track of every cup.</ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>Rate coffees, save private tasting notes, and mark favorites on this device.</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/")} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Open catalog</ThemedText></Pressable>
          <Pressable onPress={() => void clearJournal()} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Clear</ThemedText></Pressable>
        </View>
      </ThemedView>

      <ThemedView style={[styles.statsCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <Stat label="Entries" value={String(entries.length)} theme={theme} />
        <Stat label="Favorites" value={String(favoriteCount)} theme={theme} />
        <Stat label="Rated" value={String(ratedCount)} theme={theme} />
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        {loading ? <StatusPanel title="Loading journal..." loading /> : error ? <StatusPanel title="Could not load journal." message={error} /> : (
          <View style={styles.list}>
            <ThemedText type="subtitle">Choose a coffee</ThemedText>
            {coffees.map((coffee) => {
              const entry = journal[coffee.slug];
              const selected = coffee.slug === selectedSlug;
              return <Pressable key={coffee.slug} onPress={() => setSelectedSlug(coffee.slug)} style={[styles.coffeeCard, { borderColor: selected ? theme.accent : theme.border, backgroundColor: theme.surface }]}>
                <View style={styles.cardHeader}><View style={styles.cardCopy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{coffee.origin_state}</ThemedText><ThemedText type="defaultSemiBold">{coffee.name}</ThemedText></View><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{entry ? "Journaled" : "Open"}</ThemedText></View>
                <ThemedText style={[styles.cardBody, { color: theme.mutedText }]}>{coffee.producer_name} · {coffee.process ?? "Process n/a"}{entry?.rating ? ` · ${entry.rating}/5` : ""}</ThemedText>
              </Pressable>;
            })}
          </View>
        )}
      </ThemedView>

      {selectedCoffee ? <ThemedView style={[styles.editor, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText type="subtitle">{selectedCoffee.name}</ThemedText>
        <ThemedText style={[styles.cardBody, { color: theme.mutedText }]}>Private notes for {selectedCoffee.origin_state} · {selectedCoffee.producer_name}</ThemedText>
        <View style={styles.ratingRow}>{[1, 2, 3, 4, 5].map((rating) => <Pressable key={rating} onPress={() => void updateActive({ rating })} style={[styles.ratingButton, { borderColor: activeEntry.rating === rating ? theme.accent : theme.border, backgroundColor: activeEntry.rating === rating ? theme.accent : theme.surface }]}><ThemedText style={{ color: activeEntry.rating === rating ? theme.accentForeground : theme.text }}>{rating}</ThemedText></Pressable>)}</View>
        <Pressable onPress={() => void updateActive({ favorite: !activeEntry.favorite })} style={[styles.favoriteButton, { borderColor: activeEntry.favorite ? theme.accent : theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">{activeEntry.favorite ? "Marked as favorite" : "Mark as favorite"}</ThemedText></Pressable>
        <TextInput value={activeEntry.notes} onChangeText={(notes) => void updateActive({ notes })} multiline placeholder="What did you taste?" placeholderTextColor={theme.mutedText} style={[styles.notes, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} />
      </ThemedView> : null}
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) {
  return <View style={styles.stat}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="subtitle">{value}</ThemedText></View>;
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.2, fontSize: 11 },
  heroTitle: { fontSize: 31, lineHeight: 36 },
  heroBody: { lineHeight: 22 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  statsCard: { borderRadius: 24, padding: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10 },
  stat: { flex: 1, gap: 6 },
  panel: { borderRadius: 28, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  list: { gap: 12 },
  coffeeCard: { borderRadius: 20, padding: 15, gap: 8, borderWidth: StyleSheet.hairlineWidth },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 8 },
  cardCopy: { flex: 1, gap: 6 },
  cardBody: { lineHeight: 20 },
  editor: { borderRadius: 28, padding: 18, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  ratingRow: { flexDirection: "row", gap: 8 },
  ratingButton: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  favoriteButton: { borderRadius: 18, paddingVertical: 13, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  notes: { minHeight: 130, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14, textAlignVertical: "top", fontSize: 16 },
});
