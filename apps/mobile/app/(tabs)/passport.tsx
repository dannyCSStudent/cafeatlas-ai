import * as SecureStore from "expo-secure-store";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchStates, type StateRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

const STORAGE_KEY = "cafeatlas-passport-collected-states";

function parseCollected(value: string | null) {
  if (!value) return new Set<string>();
  try {
    const parsed = JSON.parse(value) as unknown;
    return new Set(Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []);
  } catch {
    return new Set<string>();
  }
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export default function PassportScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [states, setStates] = useState<StateRead[]>([]);
  const [collected, setCollected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPassport = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const [stateData, stored] = await Promise.all([
        fetchStates(),
        SecureStore.getItemAsync(STORAGE_KEY),
      ]);
      setStates(stateData);
      setCollected(parseCollected(stored));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load passport.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadPassport();
  }, [loadPassport]);

  const collectedCount = useMemo(
    () => states.filter((state) => collected.has(state.slug)).length,
    [collected, states]
  );
  const progress = states.length ? collectedCount / states.length : 0;

  async function toggleState(slug: string) {
    const next = new Set(collected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setCollected(next);
    await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify([...next]));
  }

  async function resetPassport() {
    const next = new Set<string>();
    setCollected(next);
    await SecureStore.setItemAsync(STORAGE_KEY, "[]");
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadPassport(true)} />}
    >
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Coffee passport</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>Collect the origin trail.</ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>Mark producing states as you explore the catalog. Your stamps are stored locally on this device.</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/")} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
            <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Open catalog</ThemedText>
          </Pressable>
          <Pressable onPress={() => void resetPassport()} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <ThemedText type="defaultSemiBold">Reset</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={[styles.progressCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <View style={styles.statsRow}>
          <Stat label="Collected" value={String(collectedCount)} theme={theme} />
          <Stat label="States" value={String(states.length)} theme={theme} />
          <Stat label="Progress" value={formatPercent(progress)} theme={theme} />
        </View>
        <View style={[styles.progressTrack, { backgroundColor: theme.surfaceMuted }]}>
          <View style={[styles.progressFill, { width: `${Math.max(progress * 100, states.length ? 4 : 0)}%`, backgroundColor: theme.accent }]} />
        </View>
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator />
            <ThemedText style={[styles.stateText, { color: theme.mutedText }]}>Loading passport...</ThemedText>
          </View>
        ) : error ? (
          <StatusPanel title="Could not load passport." message={error} />
        ) : (
          <View style={styles.list}>
            <ThemedText type="subtitle">Origin stamps</ThemedText>
            {states.map((state, index) => {
              const isCollected = collected.has(state.slug);
              return (
                <View key={state.slug} style={[styles.card, { borderColor: isCollected ? theme.accent : theme.border, backgroundColor: theme.surface }]}>
                  <Pressable onPress={() => void toggleState(state.slug)} style={styles.cardMain}>
                    <View style={styles.cardHeader}>
                      <View>
                        <ThemedText style={[styles.stamp, { color: theme.mutedText }]}>Stamp {index + 1}</ThemedText>
                        <ThemedText type="subtitle">{state.name}</ThemedText>
                      </View>
                      <View style={[styles.statusPill, { backgroundColor: isCollected ? theme.accent : theme.surfaceMuted }]}>
                        <ThemedText style={[styles.statusText, { color: isCollected ? theme.accentForeground : theme.mutedText }]}>{isCollected ? "Collected" : "Open"}</ThemedText>
                      </View>
                    </View>
                    <ThemedText style={[styles.cardBody, { color: theme.mutedText }]}>{state.coffee_count} coffees and {state.farm_count} farms linked.</ThemedText>
                  </Pressable>
                  <View style={styles.cardActions}>
                    <Pressable onPress={() => router.push(`/?state=${encodeURIComponent(state.name)}`)} style={[styles.smallButton, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                      <ThemedText type="defaultSemiBold">Discover</ThemedText>
                    </Pressable>
                    <Pressable onPress={() => void toggleState(state.slug)} style={[styles.smallButton, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                      <ThemedText type="defaultSemiBold">{isCollected ? "Remove" : "Add stamp"}</ThemedText>
                    </Pressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ThemedView>

      <ThemedView style={[styles.badges, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText type="subtitle">Badges</ThemedText>
        <Badge title="First stamp" detail="Collect your first producing state." unlocked={collectedCount >= 1} theme={theme} />
        <Badge title="Regional run" detail="Collect three states." unlocked={collectedCount >= 3} theme={theme} />
        <Badge title="Origin collector" detail="Collect every available state." unlocked={states.length > 0 && collectedCount === states.length} theme={theme} />
      </ThemedView>
    </ScrollView>
  );
}

function Stat({ label, value, theme }: { label: string; value: string; theme: (typeof Colors)[keyof typeof Colors] }) {
  return (
    <View style={styles.stat}>
      <ThemedText style={[styles.stamp, { color: theme.mutedText }]}>{label}</ThemedText>
      <ThemedText type="subtitle">{value}</ThemedText>
    </View>
  );
}

function Badge({ title, detail, unlocked, theme }: { title: string; detail: string; unlocked: boolean; theme: (typeof Colors)[keyof typeof Colors] }) {
  return (
    <View style={[styles.badge, { borderColor: unlocked ? theme.accent : theme.border, backgroundColor: theme.surface }]}>
      <View style={styles.badgeHeader}>
        <ThemedText type="defaultSemiBold">{title}</ThemedText>
        <ThemedText style={[styles.stamp, { color: theme.mutedText }]}>{unlocked ? "Unlocked" : "Locked"}</ThemedText>
      </View>
      <ThemedText style={[styles.cardBody, { color: theme.mutedText }]}>{detail}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  heroTitle: { fontSize: 32, lineHeight: 36 },
  heroBody: { lineHeight: 22 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  progressCard: { borderRadius: 24, padding: 16, gap: 16, borderWidth: StyleSheet.hairlineWidth },
  statsRow: { flexDirection: "row", gap: 10 },
  stat: { flex: 1, gap: 6 },
  progressTrack: { height: 10, borderRadius: 999, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999 },
  panel: { borderRadius: 28, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  stateBox: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 10 },
  stateText: { textAlign: "center" },
  list: { gap: 12 },
  card: { borderRadius: 22, padding: 16, borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  cardMain: { gap: 9 },
  cardHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 8 },
  stamp: { textTransform: "uppercase", letterSpacing: 1, fontSize: 11 },
  statusPill: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6 },
  statusText: { textTransform: "uppercase", letterSpacing: 1, fontSize: 10, fontWeight: "600" },
  cardBody: { lineHeight: 20 },
  cardActions: { flexDirection: "row", gap: 8 },
  smallButton: { flex: 1, borderRadius: 16, paddingVertical: 10, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  badges: { borderRadius: 28, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  badge: { borderRadius: 20, padding: 14, gap: 7, borderWidth: StyleSheet.hairlineWidth },
  badgeHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
});
