import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";
import { getPersistentItem } from "@/lib/persistent-storage";
import { useColorScheme } from "@/hooks/use-color-scheme";

const JOURNAL_KEY = "cafeatlas-journal-entries";
const PASSPORT_KEY = "cafeatlas-passport-collected-states";

type JournalEntry = { rating?: number | null; favorite?: boolean; notes?: string };

function parseObject(value: string | null): Record<string, JournalEntry> {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value) as unknown;
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Record<string, JournalEntry> : {};
  } catch { return {}; }
}

function parseStates(value: string | null) {
  if (!value) return new Set<string>();
  try {
    const parsed = JSON.parse(value) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch { return new Set<string>(); }
}

function scoreCoffee(coffee: CoffeeRead, journal: Record<string, JournalEntry>, passport: Set<string>) {
  const text = [coffee.name, coffee.origin_state, coffee.process, coffee.roast_level, coffee.tasting_notes, coffee.description].join(" ").toLowerCase();
  let score = coffee.is_featured ? 2 : 0;
  const journalEntries = Object.entries(journal);
  const favoriteNotes = journalEntries.filter(([, entry]) => entry.favorite || (entry.rating ?? 0) >= 4).flatMap(([, entry]) => (entry.notes ?? "").toLowerCase().split(/\s+/));
  score += favoriteNotes.filter((word) => word.length > 3 && text.includes(word)).slice(0, 5).length * 2;
  if (passport.has(coffee.origin_state.toLowerCase())) score += 3;
  if (journal[coffee.slug]) score -= 2;
  return score;
}

export default function RecommendationsScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [journal, setJournal] = useState<Record<string, JournalEntry>>({});
  const [passport, setPassport] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetchCoffeeCatalog({ page: 1, pageSize: 100, sort: "featured" }),
      getPersistentItem(JOURNAL_KEY),
      getPersistentItem(PASSPORT_KEY),
    ]).then(([catalog, journalValue, passportValue]) => {
      setCoffees(catalog.items);
      setJournal(parseObject(journalValue));
      setPassport(parseStates(passportValue));
    }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load recommendations.")).finally(() => setLoading(false));
  }, []);

  const recommendations = useMemo(() => coffees.map((coffee) => ({ coffee, score: scoreCoffee(coffee, journal, passport) })).filter(({ coffee }) => !journal[coffee.slug]).sort((left, right) => right.score - left.score).slice(0, 8), [coffees, journal, passport]);
  const signalCount = Object.keys(journal).length + passport.size;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Recommendations</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>Your next cup, shaped by your trail.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Recommendations use your journal favorites, tasting notes, and passport states. Keep exploring to improve the signal.</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/journal")} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Open journal</ThemedText></Pressable>
          <Pressable onPress={() => router.push("/sommelier")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Ask sommelier</ThemedText></Pressable>
        </View>
      </ThemedView>

      <ThemedView style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <Stat label="Matches" value={String(recommendations.length)} theme={theme} />
        <Stat label="Signals" value={String(signalCount)} theme={theme} />
        <Stat label="Catalog" value={String(coffees.length)} theme={theme} />
      </ThemedView>

      {loading ? <StatusPanel title="Learning your preferences..." loading /> : error ? <StatusPanel title="Could not load recommendations." message={error} /> : <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <ThemedText type="subtitle">Suggested coffees</ThemedText>
        {recommendations.length ? <View style={styles.list}>{recommendations.map(({ coffee, score }, index) => <Pressable key={coffee.slug} onPress={() => router.push(`/coffees/${coffee.slug}`)} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}><View style={styles.row}><View style={styles.copy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Pick {index + 1}</ThemedText><ThemedText type="defaultSemiBold">{coffee.name}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.origin_state} · {coffee.producer_name}</ThemedText></View><ThemedText type="subtitle">{score}</ThemedText></View><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.tasting_notes || coffee.description || "Open the coffee to explore its profile."}</ThemedText></Pressable>)}</View> : <ThemedText style={[styles.body, { color: theme.mutedText }]}>Journal or favorite a coffee to create your first personalized signal.</ThemedText>}
      </ThemedView>}
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) { return <View style={styles.stat}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="subtitle">{value}</ThemedText></View>; }

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, summary: { borderRadius: 24, padding: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10 }, stat: { flex: 1, gap: 6 }, panel: { borderRadius: 28, padding: 16, gap: 14, borderWidth: StyleSheet.hairlineWidth }, list: { gap: 10 }, card: { borderRadius: 20, padding: 15, gap: 9, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }, copy: { flex: 1, gap: 5 }, meta: { fontSize: 13, lineHeight: 19 },
});
