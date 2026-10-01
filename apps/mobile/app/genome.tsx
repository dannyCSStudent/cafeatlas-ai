import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

const dimensions = [
  ["Sweetness", ["sweet", "caramel", "honey", "panela", "toffee"]],
  ["Acidity", ["bright", "citrus", "clean", "crisp", "acid"]],
  ["Chocolate", ["chocolate", "cocoa", "cacao", "mocha"]],
  ["Caramel", ["caramel", "toffee", "brown sugar", "honey"]],
  ["Floral", ["floral", "jasmine", "rose", "aromatic"]],
  ["Fruity", ["fruit", "fruity", "berry", "plum", "peach"]],
  ["Nutty", ["nutty", "almond", "hazelnut", "walnut"]],
  ["Smoky", ["smoky", "tobacco", "roasted", "bold"]],
  ["Body", ["body", "full", "round", "rich", "heavy"]],
  ["Finish", ["finish", "long", "clean", "lingering"]],
  ["Roast", ["roast", "light", "medium", "dark"]],
] as const;

type Genome = Record<string, number>;
const genomeLabels = dimensions.map(([label]) => label);

function buildGenome(coffee: CoffeeRead): Genome {
  const text = [coffee.name, coffee.origin_state, coffee.process, coffee.roast_level, coffee.tasting_notes, coffee.description].join(" ").toLowerCase();
  return Object.fromEntries(dimensions.map(([label, keywords]) => {
    const matches = keywords.filter((keyword) => text.includes(keyword)).length;
    return [label, Math.min(96, 28 + matches * 17 + (coffee.is_featured ? 4 : 0))];
  }));
}

function averageGenome(coffees: CoffeeRead[]) {
  const genomes = coffees.map(buildGenome);
  return Object.fromEntries(dimensions.map(([label]) => [label, genomes.length ? Math.round(genomes.reduce((sum, genome) => sum + genome[label], 0) / genomes.length) : 0]));
}

export default function GenomeScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoffeeCatalog({ page: 1, pageSize: 100, sort: "featured" })
      .then((result) => {
        setCoffees(result.items);
        setSelectedSlug(result.items[0]?.slug ?? "");
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load the flavor genome."))
      .finally(() => setLoading(false));
  }, []);

  const selectedCoffee = coffees.find((coffee) => coffee.slug === selectedSlug) ?? coffees[0] ?? null;
  const selectedGenome = selectedCoffee ? buildGenome(selectedCoffee) : null;
  const averages = useMemo(() => averageGenome(coffees), [coffees]);
  const leader = genomeLabels.reduce((best, label) => averages[label] > averages[best] ? label : best, genomeLabels[0] ?? "n/a");

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Flavor genome</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>Read the catalog as a flavor map.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Compare sweetness, acidity, body, roast, and seven more signals across the live catalog.</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/sommelier")} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Ask sommelier</ThemedText></Pressable>
          <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Catalog</ThemedText></Pressable>
        </View>
      </ThemedView>

      {loading ? <StatusPanel title="Reading flavor signals..." loading /> : error ? <StatusPanel title="Could not load genome." message={error} /> : <>
        <ThemedView style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <Stat label="Entries" value={String(coffees.length)} theme={theme} />
          <Stat label="Average" value={selectedGenome ? String(Math.round(Object.values(selectedGenome).reduce((sum, value) => sum + value, 0) / dimensions.length)) : "0"} theme={theme} />
          <Stat label="Leader" value={leader} theme={theme} />
        </ThemedView>

        <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Coffee vectors</ThemedText>
          <View style={styles.coffeeList}>{coffees.slice(0, 12).map((coffee, index) => {
            const genome = buildGenome(coffee);
            const score = Math.round(Object.values(genome).reduce((sum, value) => sum + value, 0) / dimensions.length);
            const active = coffee.slug === selectedCoffee?.slug;
            return <Pressable key={coffee.slug} onPress={() => setSelectedSlug(coffee.slug)} style={[styles.coffeeCard, { borderColor: active ? theme.accent : theme.border, backgroundColor: theme.surface }]}><View style={styles.row}><View style={styles.cardCopy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Gene {index + 1}</ThemedText><ThemedText type="defaultSemiBold">{coffee.name}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.origin_state} · {coffee.producer_name}</ThemedText></View><ThemedText type="subtitle">{score}</ThemedText></View></Pressable>;
          })}</View>
        </ThemedView>

        {selectedCoffee && selectedGenome ? <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
          <View style={styles.row}><View style={styles.cardCopy}><ThemedText type="subtitle">{selectedCoffee.name}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{selectedCoffee.origin_state} · {selectedCoffee.producer_name}</ThemedText></View><Pressable onPress={() => router.push(`/coffees/${selectedCoffee.slug}`)}><ThemedText type="defaultSemiBold" style={{ color: theme.accent }}>Open</ThemedText></Pressable></View>
          <View style={styles.dimensionList}>{dimensions.map(([label]) => <View key={label} style={styles.dimension}><View style={styles.row}><ThemedText type="defaultSemiBold">{label}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{selectedGenome[label]} vs {averages[label]}</ThemedText></View><View style={[styles.track, { backgroundColor: theme.surface }]}><View style={[styles.fill, { width: `${selectedGenome[label]}%`, backgroundColor: theme.accent }]} /></View></View>)}</View>
        </ThemedView> : null}
      </>}
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) {
  return <View style={styles.stat}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="subtitle">{value}</ThemedText></View>;
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, summary: { borderRadius: 24, padding: 16, borderWidth: StyleSheet.hairlineWidth, flexDirection: "row", gap: 10 }, stat: { flex: 1, gap: 6 }, panel: { borderRadius: 28, padding: 16, gap: 14, borderWidth: StyleSheet.hairlineWidth }, coffeeList: { gap: 10 }, coffeeCard: { borderRadius: 19, padding: 14, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }, cardCopy: { flex: 1, gap: 5 }, meta: { fontSize: 13, lineHeight: 19 }, dimensionList: { gap: 13 }, dimension: { gap: 7 }, track: { height: 9, borderRadius: 999, overflow: "hidden" }, fill: { height: "100%", borderRadius: 999 },
});
