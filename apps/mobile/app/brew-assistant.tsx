import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchCoffeeCatalog, type CoffeeRead } from "@/lib/cafeatlas-api";

type AppTheme = (typeof Colors)[keyof typeof Colors];

const methods = ["Pour-over", "French press", "AeroPress", "Espresso"] as const;
type Method = (typeof methods)[number];

function recipeFor(coffee: CoffeeRead, method: Method) {
  const roast = (coffee.roast_level ?? "medium").toLowerCase();
  const isLight = roast.includes("light");
  const isDark = roast.includes("dark");
  const water = method === "Espresso" ? 36 : method === "French press" ? 300 : 270;
  const dose = method === "Espresso" ? 18 : method === "French press" ? 20 : 18;
  const temperature = isLight ? 96 : isDark ? 91 : 94;
  const grind = method === "Espresso" ? "Fine, adjusted until the shot runs evenly" : method === "French press" ? "Coarse" : method === "AeroPress" ? "Medium-fine" : "Medium-fine";
  const time = method === "Espresso" ? "26-32 seconds" : method === "French press" ? "4 minutes" : method === "AeroPress" ? "2 minutes" : "2:45-3:15";
  const note = coffee.process?.toLowerCase().includes("natural") ? "Keep the agitation gentle so the fruit stays clear." : coffee.process?.toLowerCase().includes("washed") ? "Use a steady pour to preserve the coffee's clean structure." : "Taste halfway through and adjust the pour to keep the cup balanced.";
  return { dose, water, temperature, grind, time, note };
}

export default function BrewAssistantScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const [coffees, setCoffees] = useState<CoffeeRead[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [method, setMethod] = useState<Method>("Pour-over");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchCoffeeCatalog({ page: 1, pageSize: 100, sort: "featured" }).then((page) => {
      setCoffees(page.items);
      setSelectedId(page.items[0]?.id ?? null);
    }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load coffees.")).finally(() => setLoading(false));
  }, []);

  const coffee = useMemo(() => coffees.find((item) => item.id === selectedId) ?? coffees[0], [coffees, selectedId]);
  const recipe = coffee ? recipeFor(coffee, method) : null;

  if (loading) return <StatusPanel title="Preparing the brew assistant..." loading />;
  if (error) return <StatusPanel title="Could not load the brew assistant." message={error} />;
  if (!coffee || !recipe) return <StatusPanel title="No coffees are available yet." message="Add a coffee to the catalog to generate a recipe." />;

  return <ScrollView contentContainerStyle={styles.container}><ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>AI brew assistant</ThemedText><ThemedText type="title">Turn a coffee into a recipe.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>The assistant combines the live coffee profile, roast, and process with your chosen brew method.</ThemedText></ThemedView><ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="subtitle">Choose a coffee</ThemedText><View style={styles.options}>{coffees.slice(0, 12).map((item) => <Pressable key={item.id} onPress={() => setSelectedId(item.id)} style={[styles.option, { borderColor: item.id === coffee.id ? theme.accent : theme.border, backgroundColor: item.id === coffee.id ? theme.accent : theme.surface }]}><ThemedText type="defaultSemiBold" style={item.id === coffee.id ? { color: theme.accentForeground } : undefined}>{item.name}</ThemedText></Pressable>)}</View><ThemedText type="subtitle">Choose a method</ThemedText><View style={styles.options}>{methods.map((item) => <Pressable key={item} onPress={() => setMethod(item)} style={[styles.option, { borderColor: item === method ? theme.accent : theme.border, backgroundColor: item === method ? theme.accent : theme.surface }]}><ThemedText type="defaultSemiBold" style={item === method ? { color: theme.accentForeground } : undefined}>{item}</ThemedText></Pressable>)}</View></ThemedView><ThemedView style={[styles.recipe, { borderColor: theme.accent, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{coffee.name} · {method}</ThemedText><ThemedText type="title">A balanced starting recipe.</ThemedText><View style={styles.grid}><Metric label="Coffee" value={`${recipe.dose} g`} theme={theme} /><Metric label="Water" value={`${recipe.water} g`} theme={theme} /><Metric label="Temperature" value={`${recipe.temperature}°C`} theme={theme} /><Metric label="Grind" value={recipe.grind} theme={theme} /><Metric label="Time" value={recipe.time} theme={theme} /></View><ThemedText style={[styles.body, { color: theme.mutedText }]}>{recipe.note}</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Start here, taste the cup, then change one variable at a time: grind first, followed by water temperature.</ThemedText></ThemedView></ScrollView>;
}

function Metric({ label, value, theme }: { label: string; value: string; theme: AppTheme }) {
  return <View style={[styles.metric, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="defaultSemiBold">{value}</ThemedText></View>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.2, fontSize: 11 }, body: { lineHeight: 21 }, panel: { borderRadius: 24, padding: 16, gap: 16, borderWidth: StyleSheet.hairlineWidth }, options: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, option: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: StyleSheet.hairlineWidth }, recipe: { borderRadius: 24, padding: 20, gap: 14, borderWidth: 1 }, grid: { gap: 8 }, metric: { borderRadius: 14, padding: 12, gap: 5, borderWidth: StyleSheet.hairlineWidth }, });
