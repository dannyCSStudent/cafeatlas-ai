import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, RefreshControl, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchEvents, type EventSessionRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

function formatEventTime(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EventsScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [events, setEvents] = useState<EventSessionRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvents = useCallback(async (refresh = false) => {
    if (refresh) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      setEvents(await fetchEvents());
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load events.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents();
  }, [loadEvents]);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void loadEvents(true)} />}
    >
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>CafeAtlas live sessions</ThemedText>
        <ThemedText type="title" style={styles.heroTitle}>Coffee, in conversation.</ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>Join tastings, virtual tours, and producer livestreams connected to the catalog.</ThemedText>
        <View style={styles.actions}>
          <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <ThemedText type="defaultSemiBold">Catalog</ThemedText>
          </Pressable>
          <Pressable onPress={() => router.push("/about")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
            <ThemedText type="defaultSemiBold">About</ThemedText>
          </Pressable>
        </View>
      </ThemedView>

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator />
            <ThemedText style={[styles.stateText, { color: theme.mutedText }]}>Loading events...</ThemedText>
          </View>
        ) : error ? (
          <StatusPanel title="Could not load events." message={error} />
        ) : events.length === 0 ? (
          <StatusPanel title="No upcoming events yet." message="Check back soon for the next CafeAtlas session." />
        ) : (
          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <ThemedText type="subtitle">Upcoming sessions</ThemedText>
              <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{events.length} sessions</ThemedText>
            </View>
            {events.map((event) => (
              <Pressable
                key={event.id}
                onPress={() => router.push(`/events/${event.slug}`)}
                style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}
              >
                <View style={styles.cardHeader}>
                  <ThemedText style={[styles.category, { color: theme.mutedText }]}>{event.category}</ThemedText>
                  <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{event.duration_minutes} min</ThemedText>
                </View>
                <ThemedText type="subtitle">{event.title}</ThemedText>
                <ThemedText style={[styles.cardBody, { color: theme.mutedText }]} numberOfLines={3}>{event.summary}</ThemedText>
                <View style={styles.cardFooter}>
                  <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{formatEventTime(event.starts_at)}</ThemedText>
                  <ThemedText type="defaultSemiBold">{event.rsvp_count} RSVPs</ThemedText>
                </View>
              </Pressable>
            ))}
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  heroTitle: { fontSize: 32, lineHeight: 36 },
  heroBody: { lineHeight: 22 },
  actions: { flexDirection: "row", gap: 10, marginTop: 4 },
  secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  panel: { borderRadius: 28, padding: 16, borderWidth: StyleSheet.hairlineWidth },
  stateBox: { minHeight: 180, alignItems: "center", justifyContent: "center", gap: 10 },
  stateText: { textAlign: "center" },
  list: { gap: 12 },
  sectionHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  card: { borderRadius: 22, padding: 16, borderWidth: StyleSheet.hairlineWidth, gap: 9 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8 },
  category: { textTransform: "uppercase", letterSpacing: 1, fontSize: 11 },
  meta: { fontSize: 12 },
  cardBody: { lineHeight: 21 },
  cardFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 4 },
});
