import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchOrders, formatPrice, type OrderRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

export default function OrdersScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [orders, setOrders] = useState<OrderRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function loadOrders() {
      try {
        const account = await hydrateMobileSession();
        if (!account) throw new Error("Sign in from the Account tab to view orders.");
        const nextOrders = await fetchOrders(account.session.access_token);
        if (active) setOrders(nextOrders);
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Could not load orders.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void loadOrders();
    return () => { active = false; };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Order center</ThemedText>
        <ThemedText type="title">Your coffee orders.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Drafts are saved to your account before payment and shipping are added.</ThemedText>
      </ThemedView>
      {loading ? <StatusPanel title="Loading orders..." loading /> : error ? <StatusPanel title="Could not load orders." message={error} /> : orders.length === 0 ? <StatusPanel title="No orders yet." message="Add a coffee to your cart to create an order draft." /> : (
        <View style={styles.list}>
          {orders.map((order) => (
            <ThemedView key={order.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <View style={styles.headerRow}><ThemedText type="subtitle">Order #{order.id}</ThemedText><ThemedText style={{ color: theme.mutedText }}>{order.status}</ThemedText></View>
              <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{new Date(order.created_at).toLocaleString()}</ThemedText>
              {order.items.map((item) => <ThemedText key={`${order.id}-${item.coffee_id}`} style={[styles.meta, { color: theme.mutedText }]}>{item.quantity} x {item.coffee_name}</ThemedText>)}
              <View style={styles.headerRow}><ThemedText>Current total</ThemedText><ThemedText type="subtitle">{formatPrice(order.total_cents)}</ThemedText></View>
            </ThemedView>
          ))}
        </View>
      )}
      <ThemedText onPress={() => router.push("/")} style={[styles.back, { color: theme.accent }]}>Back to catalog</ThemedText>
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
  meta: { fontSize: 13 },
  back: { textAlign: "center", fontWeight: "600" },
});
