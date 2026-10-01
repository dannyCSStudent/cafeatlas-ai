import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";
import { getPersistentItem, setPersistentItem } from "@/lib/persistent-storage";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STORAGE_KEY = "cafeatlas-flavor-memory";
const methods = ["pour-over", "french-press", "espresso", "aeropress", "cold-brew"] as const;
type MemoryKind = "brew" | "purchase";
type MemoryEntry = { id: string; coffeeSlug: string; kind: MemoryKind; brewMethod: string; note: string; createdAt: string };

function parseMemory(value: string | null): MemoryEntry[] {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value) as { entries?: unknown };
    if (!Array.isArray(parsed.entries)) return [];
    return parsed.entries.filter((entry): entry is MemoryEntry => Boolean(entry && typeof entry === "object" && typeof (entry as MemoryEntry).coffeeSlug === "string"));
  } catch { return []; }
}

export default function MemoryScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [entries, setEntries] = useState<MemoryEntry[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [kind, setKind] = useState<MemoryKind>("brew");
  const [method, setMethod] = useState<string>(methods[0]);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchCoffeeCatalog({ page: 1, pageSize: 100, sort: "featured" }), getPersistentItem(STORAGE_KEY)])
      .then(([catalog, stored]) => { setCoffees(catalog.items); setEntries(parseMemory(stored)); setSelectedSlug(catalog.items[0]?.slug ?? ""); })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load flavor memory."))
      .finally(() => setLoading(false));
  }, []);

  const selectedCoffee = coffees.find((coffee) => coffee.slug === selectedSlug) ?? coffees[0] ?? null;
  const recentEntries = useMemo(() => [...entries].reverse().slice(0, 8), [entries]);
  const brewCount = entries.filter((entry) => entry.kind === "brew").length;

  async function saveMemory() {
    if (!selectedCoffee) return;
    const nextEntry: MemoryEntry = { id: `${Date.now()}-${Math.random().toString(16).slice(2)}`, coffeeSlug: selectedCoffee.slug, kind, brewMethod: method, note: note.trim(), createdAt: new Date().toISOString() };
    const next = [...entries, nextEntry];
    setEntries(next);
    setNote("");
    await setPersistentItem(STORAGE_KEY, JSON.stringify({ entries: next }));
  }

  async function clearMemory() { setEntries([]); await setPersistentItem(STORAGE_KEY, JSON.stringify({ entries: [] })); }

  return <ScrollView contentContainerStyle={styles.container}>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
      <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Flavor memory</ThemedText>
      <ThemedText type="title" style={styles.heroTitle}>Remember how your taste evolves.</ThemedText>
      <ThemedText style={[styles.body, { color: theme.mutedText }]}>Log a purchase or brew session so future recommendations have more context.</ThemedText>
      <View style={styles.actions}><Pressable onPress={() => router.push("/recommendations")} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Recommendations</ThemedText></Pressable><Pressable onPress={() => void clearMemory()} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Clear</ThemedText></Pressable></View>
    </ThemedView>
    <ThemedView style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><Stat label="Events" value={String(entries.length)} theme={theme} /><Stat label="Brews" value={String(brewCount)} theme={theme} /><Stat label="Catalog" value={String(coffees.length)} theme={theme} /></ThemedView>
    {loading ? <StatusPanel title="Loading memory..." loading /> : error ? <StatusPanel title="Could not load memory." message={error} /> : <>
      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <ThemedText type="subtitle">Log a memory</ThemedText>
        <View style={styles.chips}>{coffees.slice(0, 8).map((coffee) => <Pressable key={coffee.slug} onPress={() => setSelectedSlug(coffee.slug)} style={[styles.chip, { borderColor: selectedSlug === coffee.slug ? theme.accent : theme.border, backgroundColor: selectedSlug === coffee.slug ? theme.accent : theme.surface }]}><ThemedText style={selectedSlug === coffee.slug ? { color: theme.accentForeground } : undefined}>{coffee.name}</ThemedText></Pressable>)}</View>
        <View style={styles.chips}>{(["brew", "purchase"] as const).map((value) => <Pressable key={value} onPress={() => setKind(value)} style={[styles.chip, { borderColor: kind === value ? theme.accent : theme.border, backgroundColor: kind === value ? theme.accent : theme.surface }]}><ThemedText style={kind === value ? { color: theme.accentForeground } : undefined}>{value}</ThemedText></Pressable>)}</View>
        <View style={styles.chips}>{methods.map((value) => <Pressable key={value} onPress={() => setMethod(value)} style={[styles.chip, { borderColor: method === value ? theme.accent : theme.border, backgroundColor: method === value ? theme.accent : theme.surface }]}><ThemedText style={method === value ? { color: theme.accentForeground } : undefined}>{value}</ThemedText></Pressable>)}</View>
        <TextInput value={note} onChangeText={setNote} multiline placeholder="What did you buy, brew, or taste?" placeholderTextColor={theme.mutedText} style={[styles.notes, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} />
        <Pressable onPress={() => void saveMemory()} style={[styles.saveButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Save memory</ThemedText></Pressable>
      </ThemedView>
      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText type="subtitle">Recent memory</ThemedText>{recentEntries.length ? recentEntries.map((entry) => <View key={entry.id} style={[styles.event, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">{coffees.find((coffee) => coffee.slug === entry.coffeeSlug)?.name ?? entry.coffeeSlug}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{entry.kind} · {entry.brewMethod}</ThemedText>{entry.note ? <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{entry.note}</ThemedText> : null}</View>) : <ThemedText style={[styles.body, { color: theme.mutedText }]}>No memories yet. Log your first cup above.</ThemedText>}</ThemedView>
    </>}
  </ScrollView>;
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) { return <View style={styles.stat}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="subtitle">{value}</ThemedText></View>; }

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, summary: { borderRadius: 24, padding: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10 }, stat: { flex: 1, gap: 6 }, panel: { borderRadius: 28, padding: 16, gap: 14, borderWidth: StyleSheet.hairlineWidth }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: StyleSheet.hairlineWidth }, notes: { minHeight: 110, borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, padding: 14, textAlignVertical: "top", fontSize: 16 }, saveButton: { borderRadius: 18, paddingVertical: 13, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, event: { borderRadius: 18, padding: 14, gap: 5, borderWidth: StyleSheet.hairlineWidth }, meta: { fontSize: 13, lineHeight: 19 },
});
