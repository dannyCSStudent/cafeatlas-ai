import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchNotifications, markNotificationRead, type NotificationRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

export default function NotificationsScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [items, setItems] = useState<NotificationRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const account = await hydrateMobileSession();
        if (!account) throw new Error("Sign in from the Account tab to view notifications.");
        const nextItems = await fetchNotifications(account.session.access_token);
        if (active) setItems(nextItems);
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Could not load notifications.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function markRead(item: NotificationRead) {
    if (item.read_at) return;
    const account = await hydrateMobileSession();
    if (!account) return;
    const updated = await markNotificationRead(item.id, account.session.access_token);
    setItems((current) => current.map((entry) => entry.id === updated.id ? updated : entry));
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Notifications</ThemedText>
        <ThemedText type="title">Stay close to the order trail.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Payment and checkout updates from your CafeAtlas account.</ThemedText>
      </ThemedView>
      {loading ? <StatusPanel title="Loading notifications..." loading /> : error ? <StatusPanel title="Could not load notifications." message={error} /> : items.length === 0 ? <StatusPanel title="No notifications yet." message="Order updates will appear here after checkout." /> : (
        <View style={styles.list}>
          {items.map((item) => (
            <Pressable key={item.id} onPress={() => void markRead(item)}>
              <ThemedView style={[styles.card, { borderColor: item.read_at ? theme.border : theme.accent, backgroundColor: theme.surfaceStrong }]}>
                <View style={styles.headerRow}><ThemedText type="defaultSemiBold">{item.title}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{new Date(item.created_at).toLocaleString()}</ThemedText></View>
                <ThemedText style={[styles.body, { color: theme.mutedText }]}>{item.body}</ThemedText>
                {!item.read_at ? <ThemedText style={{ color: theme.accent }}>Tap to mark read</ThemedText> : null}
              </ThemedView>
            </Pressable>
          ))}
        </View>
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
  list: { gap: 12 },
  card: { borderRadius: 22, padding: 16, gap: 8, borderWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  meta: { fontSize: 12 },
  back: { textAlign: "center", fontWeight: "600" },
});
