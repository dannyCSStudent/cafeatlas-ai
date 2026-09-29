import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchCoffeeCatalog, formatPrice, type CoffeeRead } from "@/lib/cafeatlas-api";

type Flavor = "bright" | "floral" | "fruity" | "chocolate" | "sweet" | "nutty";
type Roast = "light" | "balanced" | "dark";
type Process = "washed" | "honey" | "natural";

const flavorKeywords: Record<Flavor, string[]> = {
  bright: ["bright", "clean", "citrus", "crisp"],
  floral: ["floral", "jasmine", "rose", "aromatic"],
  fruity: ["fruit", "fruity", "berry", "stone", "plum", "peach"],
  chocolate: ["chocolate", "cocoa", "cacao", "mocha"],
  sweet: ["sweet", "caramel", "honey", "panela", "toffee"],
  nutty: ["nutty", "almond", "hazelnut", "walnut"],
};

const roastKeywords: Record<Roast, string[]> = {
  light: ["light", "bright", "floral", "delicate"],
  balanced: ["medium", "balanced", "sweet", "round"],
  dark: ["dark", "bold", "smoky", "deep"],
};

const processKeywords: Record<Process, string[]> = {
  washed: ["washed", "clean", "clarity"],
  honey: ["honey", "sweet", "caramel"],
  natural: ["natural", "fruit", "berry", "jam"],
};

function scoreCoffee(coffee: CoffeeRead, flavor: Flavor, roast: Roast, process: Process, prompt: string) {
  const text = [coffee.name, coffee.origin_state, coffee.process, coffee.roast_level, coffee.tasting_notes, coffee.description].join(" ").toLowerCase();
  const promptText = prompt.toLowerCase();
  const matches = (words: string[]) => words.some((word) => text.includes(word) || promptText.includes(word));
  let score = coffee.is_featured ? 2 : 0;
  if (matches(flavorKeywords[flavor])) score += 5;
  if (matches(roastKeywords[roast])) score += 3;
  if (matches(processKeywords[process])) score += 3;
  const promptMatches = promptText.split(/\s+/).filter((word) => word.length > 3 && text.includes(word));
  score += Math.min(promptMatches.length, 4);
  return score;
}

export default function SommelierScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [flavor, setFlavor] = useState<Flavor>("bright");
  const [roast, setRoast] = useState<Roast>("balanced");
  const [process, setProcess] = useState<Process>("washed");
  const [prompt, setPrompt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoffeeCatalog({ page: 1, pageSize: 100, sort: "featured" })
      .then((result) => setCoffees(result.items))
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load coffees."))
      .finally(() => setLoading(false));
  }, []);

  const recommendations = useMemo(
    () => [...coffees].map((coffee) => ({ coffee, score: scoreCoffee(coffee, flavor, roast, process, prompt) })).sort((a, b) => b.score - a.score).slice(0, 4),
    [coffees, flavor, roast, process, prompt]
  );

  function OptionRow<T extends string>({ label, options, value, onChange }: { label: string; options: readonly T[]; value: T; onChange: (value: T) => void }) {
    return <View style={styles.optionGroup}><ThemedText style={[styles.label, { color: theme.mutedText }]}>{label}</ThemedText><View style={styles.options}>{options.map((option) => <Pressable key={option} onPress={() => onChange(option)} style={[styles.option, { borderColor: value === option ? theme.accent : theme.border, backgroundColor: value === option ? theme.accent : theme.surface }]}><ThemedText type="defaultSemiBold" style={value === option ? { color: theme.accentForeground } : undefined}>{option}</ThemedText></Pressable>)}</View></View>;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Mobile sommelier</ThemedText>
        <ThemedText type="title">Find a cup that fits.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Describe the mood or flavor you want and refine the lens below. Recommendations use the live CafeAtlas catalog.</ThemedText>
      </ThemedView>
      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <TextInput value={prompt} onChangeText={setPrompt} placeholder="Try: sweet and chocolatey for pour-over" placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} />
        <OptionRow label="Flavor" options={["bright", "floral", "fruity", "chocolate", "sweet", "nutty"] as const} value={flavor} onChange={setFlavor} />
        <OptionRow label="Roast" options={["light", "balanced", "dark"] as const} value={roast} onChange={setRoast} />
        <OptionRow label="Process" options={["washed", "honey", "natural"] as const} value={process} onChange={setProcess} />
      </ThemedView>
      {loading ? <StatusPanel title="Reading the catalog..." loading /> : error ? <StatusPanel title="Could not load recommendations." message={error} /> : (
        <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Your starting points</ThemedText>
          {recommendations.map(({ coffee, score }, index) => <Pressable key={coffee.id} onPress={() => router.push(`/coffees/${coffee.slug}`)} style={[styles.result, { borderColor: theme.border, backgroundColor: theme.surface }]}><View style={styles.row}><ThemedText type="defaultSemiBold">{index + 1}. {coffee.name}</ThemedText><ThemedText type="defaultSemiBold">{formatPrice(coffee.price_cents)}</ThemedText></View><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.origin_state} · {coffee.process ?? "Process unknown"} · match score {score}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.tasting_notes || coffee.description || "Open the detail page to learn more."}</ThemedText></Pressable>)}
        </ThemedView>
      )}
      <ThemedText onPress={() => router.back()} style={[styles.back, { color: theme.accent }]}>Back</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  body: { lineHeight: 21 },
  panel: { borderRadius: 24, padding: 16, gap: 16, borderWidth: StyleSheet.hairlineWidth },
  input: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, borderWidth: StyleSheet.hairlineWidth },
  optionGroup: { gap: 8 },
  label: { textTransform: "uppercase", letterSpacing: 1.2, fontSize: 11 },
  options: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  option: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: StyleSheet.hairlineWidth },
  result: { borderRadius: 18, padding: 14, gap: 6, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  meta: { fontSize: 13, lineHeight: 19 },
  back: { textAlign: "center", fontWeight: "600" },
});
