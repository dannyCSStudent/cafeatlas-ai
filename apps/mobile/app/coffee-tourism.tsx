import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchFarms, fetchProducers, fetchStates, type FarmRead, type ProducerRead, type StateRead } from "@/lib/cafeatlas-api";

function tripNote(state: string) {
  const notes: Record<string, string> = {
    Chiapas: "Build a highland route around farm visits, floral cups, and slower mornings in the coffee belt.",
    Oaxaca: "Pair producer conversations with market food, cacao, and structured coffees from the mountain regions.",
    Veracruz: "Follow a greener route through farms, mills, and bright coffees shaped by the Gulf-side climate.",
  };
  return notes[state] ?? `Use ${state} as your anchor, then follow the farms and producers attached to the live catalog.`;
}

export default function CoffeeTourismScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const [states, setStates] = useState<StateRead[]>([]);
  const [producers, setProducers] = useState<ProducerRead[]>([]);
  const [farms, setFarms] = useState<FarmRead[]>([]);
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([fetchStates(), fetchProducers(), fetchFarms()]).then(([nextStates, nextProducers, nextFarms]) => {
      setStates(nextStates);
      setProducers(nextProducers);
      setFarms(nextFarms);
      setSelectedState(nextStates[0]?.name ?? null);
    }).catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load travel recommendations.")).finally(() => setLoading(false));
  }, []);

  const state = states.find((item) => item.name === selectedState) ?? states[0];
  const stateFarms = useMemo(() => farms.filter((farm) => farm.state === state?.name), [farms, state?.name]);
  const stateProducers = useMemo(() => producers.filter((producer) => producer.farms.some((farm) => farm.state === state?.name)), [producers, state?.name]);

  if (loading) return <StatusPanel title="Mapping coffee country..." loading />;
  if (error) return <StatusPanel title="Could not load coffee tourism." message={error} />;
  if (!state) return <StatusPanel title="No origin routes are available yet." message="Add states, producers, and farms to build travel recommendations." />;

  return <ScrollView contentContainerStyle={styles.container}><ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Coffee tourism</ThemedText><ThemedText type="title">Plan a trip through the origin graph.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Choose a region, then follow its farms and producers. Every recommendation is grounded in live CafeAtlas origin data.</ThemedText></ThemedView><ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="subtitle">Choose a region</ThemedText><View style={styles.options}>{states.map((item) => <Pressable key={item.id} onPress={() => setSelectedState(item.name)} style={[styles.option, { borderColor: item.name === state.name ? theme.accent : theme.border, backgroundColor: item.name === state.name ? theme.accent : theme.surface }]}><ThemedText type="defaultSemiBold" style={item.name === state.name ? { color: theme.accentForeground } : undefined}>{item.name}</ThemedText></Pressable>)}</View></ThemedView><ThemedView style={[styles.route, { borderColor: theme.accent, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Suggested route</ThemedText><ThemedText type="title">{state.name}</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>{tripNote(state.name)}</ThemedText><View style={styles.stats}><Stat label="Farms" value={String(stateFarms.length)} theme={theme} /><Stat label="Producers" value={String(stateProducers.length)} theme={theme} /><Stat label="Coffees" value={String(state.coffee_count)} theme={theme} /></View></ThemedView><ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="subtitle">Stops to consider</ThemedText>{stateFarms.slice(0, 6).map((farm) => <View key={farm.id} style={[styles.stop, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">{farm.name}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{farm.municipality ?? "Origin municipality"} · {farm.altitude_meters ? `${farm.altitude_meters} m elevation` : "Elevation to confirm"}</ThemedText></View>)}{stateFarms.length === 0 ? <ThemedText style={[styles.body, { color: theme.mutedText }]}>No farm stops are linked to this region yet.</ThemedText> : null}</ThemedView></ScrollView>;
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) {
  return <View style={[styles.stat, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{label}</ThemedText><ThemedText type="subtitle">{value}</ThemedText></View>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.2, fontSize: 11 }, body: { lineHeight: 21 }, panel: { borderRadius: 24, padding: 16, gap: 16, borderWidth: StyleSheet.hairlineWidth }, options: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, option: { borderRadius: 999, paddingHorizontal: 12, paddingVertical: 9, borderWidth: StyleSheet.hairlineWidth }, route: { borderRadius: 24, padding: 20, gap: 14, borderWidth: 1 }, stats: { flexDirection: "row", gap: 8 }, stat: { flex: 1, borderRadius: 14, padding: 11, gap: 4, borderWidth: StyleSheet.hairlineWidth }, stop: { borderRadius: 16, padding: 13, gap: 5, borderWidth: StyleSheet.hairlineWidth }, meta: { fontSize: 13 }, });
