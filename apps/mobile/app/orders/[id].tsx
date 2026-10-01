import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Linking, Platform, Pressable, ScrollView, Share, StyleSheet, TextInput, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createReturnRequest, createStripeCheckoutSession, fetchOrders, fetchReturnRequests, formatPrice, updateOrderShipping, type OrderRead, type ReturnRequestRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

const fields = [
  ["recipient_name", "Full name"],
  ["address_line1", "Address"],
  ["address_line2", "Apartment or unit (optional)"],
  ["city", "City"],
  ["region", "State"],
  ["postal_code", "ZIP code"],
] as const;

export default function OrderDetailScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const { id } = useLocalSearchParams<{ id: string }>();
  const [order, setOrder] = useState<OrderRead | null>(null);
  const [values, setValues] = useState<Record<string, string>>({ country_code: "US" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [returnRequest, setReturnRequest] = useState<ReturnRequestRead | null>(null);
  const [returnReason, setReturnReason] = useState("");
  const [returnLoading, setReturnLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const account = await hydrateMobileSession();
        if (!account) throw new Error("Sign in from the Account tab to view this order.");
        const [orders, returnRequests] = await Promise.all([
          fetchOrders(account.session.access_token),
          fetchReturnRequests(account.session.access_token),
        ]);
        const nextOrder = orders.find((item) => item.id === Number(id));
        if (!nextOrder) throw new Error("Order not found.");
        setOrder(nextOrder);
        setReturnRequest(returnRequests.find((item) => item.order_id === nextOrder.id) ?? null);
        setValues({
          country_code: nextOrder.country_code ?? "US",
          recipient_name: nextOrder.recipient_name ?? "",
          address_line1: nextOrder.address_line1 ?? "",
          address_line2: nextOrder.address_line2 ?? "",
          city: nextOrder.city ?? "",
          region: nextOrder.region ?? "",
          postal_code: nextOrder.postal_code ?? "",
        });
      } catch (nextError) {
        setError(nextError instanceof Error ? nextError.message : "Could not load order.");
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, [id]);

  async function save() {
    if (!order) return;
    setSaving(true);
    setError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in from the Account tab before saving shipping details.");
      const updated = await updateOrderShipping(order.id, values as Parameters<typeof updateOrderShipping>[1], account.session.access_token);
      setOrder(updated);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not save shipping details.");
    } finally {
      setSaving(false);
    }
  }

  async function startCheckout() {
    if (!order) return;
    setCheckoutLoading(true);
    setError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before starting checkout.");
      const baseUrl = process.env.EXPO_PUBLIC_CAFEATLAS_CHECKOUT_URL ?? "http://localhost:8081";
      const session = await createStripeCheckoutSession(
        order.id,
        {
          success_url: `${baseUrl}/orders/${order.id}?checkout=success`,
          cancel_url: `${baseUrl}/orders/${order.id}?checkout=cancelled`,
        },
        account.session.access_token,
      );
      await Linking.openURL(session.checkout_url);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start checkout.");
    } finally {
      setCheckoutLoading(false);
    }
  }

  async function submitReturn() {
    if (!order || returnReason.trim().length < 10) return;
    setReturnLoading(true);
    setError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before requesting a return.");
      const request = await createReturnRequest(order.id, returnReason.trim(), account.session.access_token);
      setReturnRequest(request);
      setReturnReason("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not request a return.");
    } finally {
      setReturnLoading(false);
    }
  }

  async function shareReceipt() {
    if (!order) return;
    const lines = order.items.map((item) => `${item.quantity} x ${item.coffee_name}: ${formatPrice(item.line_total_cents)}`);
    const title = `CafeAtlas order #${order.id}`;
    const message = [`CafeAtlas AI order #${order.id}`, `Status: ${order.status}`, ...lines, `Total: ${formatPrice(order.total_cents)}`].join("\n");

    try {
      if (Platform.OS === "web") {
        const browserNavigator = navigator as Navigator & {
          share?: (data: { title: string; text: string }) => Promise<void>;
          clipboard?: { writeText: (text: string) => Promise<void> };
        };
        if (browserNavigator.share) {
          await browserNavigator.share({ title, text: message });
        } else if (browserNavigator.clipboard) {
          await browserNavigator.clipboard.writeText(message);
          Alert.alert("Receipt copied", "The receipt was copied to your clipboard.");
        } else {
          Alert.alert(title, message);
        }
        return;
      }

      await Share.share({ title, message });
    } catch (nextError) {
      if (nextError instanceof Error && nextError.name === "AbortError") return;
      Alert.alert("Could not share receipt", "Try again or use the web receipt from your account.");
    }
  }

  if (loading) return <StatusPanel title="Loading order..." loading />;
  if (error && !order) return <StatusPanel title="Could not load order." message={error} />;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Order #{order?.id}</ThemedText>
        <ThemedText type="title">Shipping details</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>US shipping is currently estimated at $6.99. Taxes and payment will be added later.</ThemedText>
      </ThemedView>
      <ThemedView style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <ThemedText type="subtitle">Deliver to</ThemedText>
        {fields.map(([name, label]) => (
          <TextInput key={name} value={values[name] ?? ""} onChangeText={(value) => setValues((current) => ({ ...current, [name]: value }))} placeholder={label} placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} />
        ))}
        {error ? <ThemedText style={{ color: theme.danger }}>{error}</ThemedText> : null}
        <Pressable disabled={saving} onPress={() => void save()} style={[styles.button, { backgroundColor: saving ? theme.border : theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{saving ? "Saving..." : "Save shipping details"}</ThemedText></Pressable>
      </ThemedView>
      <ThemedView style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <View style={styles.row}><ThemedText>Subtotal</ThemedText><ThemedText>{formatPrice(order?.subtotal_cents ?? 0)}</ThemedText></View>
        <View style={styles.row}><ThemedText>Shipping</ThemedText><ThemedText>{formatPrice(order?.shipping_cents ?? 0)}</ThemedText></View>
        <View style={styles.row}><ThemedText type="defaultSemiBold">Total</ThemedText><ThemedText type="subtitle">{formatPrice(order?.total_cents ?? 0)}</ThemedText></View>
        {order?.status === "draft" && order.shipping_cents > 0 ? (
          <Pressable disabled={checkoutLoading} onPress={() => void startCheckout()} style={[styles.button, { backgroundColor: checkoutLoading ? theme.border : theme.accent }]}>
            <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{checkoutLoading ? "Opening checkout..." : "Continue to Stripe"}</ThemedText>
          </Pressable>
        ) : null}
        <Pressable onPress={() => void shareReceipt()} style={[styles.secondaryButton, { borderColor: theme.border }]}>
          <ThemedText type="defaultSemiBold" style={{ color: theme.accent }}>Share receipt</ThemedText>
        </Pressable>
      </ThemedView>
      {order?.tracking_number ? (
        <ThemedView style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Tracking</ThemedText>
          <ThemedText style={{ color: theme.mutedText }}>{order.tracking_number}</ThemedText>
          {order.tracking_url ? <ThemedText onPress={() => void Linking.openURL(order.tracking_url ?? "")} style={{ color: theme.accent }}>Open tracking link</ThemedText> : null}
        </ThemedView>
      ) : null}
      {order?.status === "delivered" ? (
        <ThemedView style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Return request</ThemedText>
          {returnRequest ? (
            <ThemedText style={{ color: theme.mutedText }}>Your request is {returnRequest.status}.</ThemedText>
          ) : (
            <>
              <ThemedText style={[styles.body, { color: theme.mutedText }]}>Tell us what went wrong. A return request needs at least 10 characters.</ThemedText>
              <TextInput multiline value={returnReason} onChangeText={setReturnReason} placeholder="Describe the issue" placeholderTextColor={theme.mutedText} style={[styles.input, styles.multiline, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} />
              <Pressable disabled={returnLoading || returnReason.trim().length < 10} onPress={() => void submitReturn()} style={[styles.button, { backgroundColor: returnLoading || returnReason.trim().length < 10 ? theme.border : theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{returnLoading ? "Submitting..." : "Submit return request"}</ThemedText></Pressable>
            </>
          )}
        </ThemedView>
      ) : null}
      <ThemedText onPress={() => router.back()} style={[styles.back, { color: theme.accent }]}>Back to orders</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  body: { lineHeight: 21 },
  card: { borderRadius: 24, padding: 16, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  input: { borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, borderWidth: StyleSheet.hairlineWidth },
  multiline: { minHeight: 96, textAlignVertical: "top" },
  button: { borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  secondaryButton: { borderRadius: 16, paddingVertical: 14, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  summary: { borderRadius: 20, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  row: { flexDirection: "row", justifyContent: "space-between" },
  back: { textAlign: "center", fontWeight: "600" },
});
