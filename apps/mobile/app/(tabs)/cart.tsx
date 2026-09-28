import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCart } from "@/lib/cart";
import { createOrderDraft, formatPrice, prepareCheckout, type CheckoutPrepareRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

export default function CartScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { items, itemCount, subtotalCents, hydrated, updateQuantity, removeItem, clear } = useCart();
  const [quote, setQuote] = useState<CheckoutPrepareRead | null>(null);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [preparing, setPreparing] = useState(false);
  const [draftOrderId, setDraftOrderId] = useState<number | null>(null);

  async function reviewCheckout() {
    setPreparing(true);
    setQuoteError(null);
    setDraftOrderId(null);
    try {
      const nextQuote = await prepareCheckout(items.map((item) => ({ coffee_id: item.coffeeId, quantity: item.quantity })));
      setQuote(nextQuote);
    } catch (nextError) {
      setQuote(null);
      setQuoteError(nextError instanceof Error ? nextError.message : "Could not prepare checkout.");
    } finally {
      setPreparing(false);
    }
  }

  async function saveOrderDraft() {
    setPreparing(true);
    setQuoteError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) {
        throw new Error("Sign in from the Account tab before creating an order draft.");
      }
      const order = await createOrderDraft(
        items.map((item) => ({ coffee_id: item.coffeeId, quantity: item.quantity })),
        account.session.access_token,
      );
      setDraftOrderId(order.id);
    } catch (nextError) {
      setQuoteError(nextError instanceof Error ? nextError.message : "Could not create order draft.");
    } finally {
      setPreparing(false);
    }
  }

  if (!hydrated) {
    return <StatusPanel title="Loading cart..." loading />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Shopping cart</ThemedText>
        <ThemedText type="title">Build your next cup.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Your cart is saved on this device while checkout is being connected.</ThemedText>
      </ThemedView>

      {items.length === 0 ? (
        <StatusPanel title="Your cart is empty." message="Open a coffee detail page to add a lot to your cart." />
      ) : (
        <>
          <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={styles.headerRow}>
              <ThemedText type="subtitle">{itemCount} item{itemCount === 1 ? "" : "s"}</ThemedText>
              <Pressable onPress={clear}><ThemedText style={{ color: theme.danger }}>Clear</ThemedText></Pressable>
            </View>
            <View style={styles.list}>
              {items.map((item) => (
                <View key={item.coffeeId} style={[styles.item, { borderColor: theme.border, backgroundColor: theme.surface }]}>
                  <Pressable onPress={() => router.push(`/coffees/${item.slug}`)} style={styles.itemMain}>
                    {item.imageUrl ? <Image source={{ uri: item.imageUrl }} style={styles.image} /> : <View style={[styles.imageFallback, { backgroundColor: theme.surfaceMuted }]} />}
                    <View style={styles.itemCopy}>
                      <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
                      <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{item.originState}</ThemedText>
                      <ThemedText type="defaultSemiBold">{formatPrice(item.priceCents)}</ThemedText>
                    </View>
                  </Pressable>
                  <View style={styles.controls}>
                    <Pressable onPress={() => updateQuantity(item.coffeeId, item.quantity - 1)} style={[styles.quantityButton, { borderColor: theme.border }]}><ThemedText>-</ThemedText></Pressable>
                    <ThemedText type="defaultSemiBold">{item.quantity}</ThemedText>
                    <Pressable onPress={() => updateQuantity(item.coffeeId, item.quantity + 1)} style={[styles.quantityButton, { borderColor: theme.border }]}><ThemedText>+</ThemedText></Pressable>
                    <Pressable onPress={() => removeItem(item.coffeeId)}><ThemedText style={{ color: theme.danger }}>Remove</ThemedText></Pressable>
                  </View>
                </View>
              ))}
            </View>
          </ThemedView>

          <ThemedView style={[styles.summary, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
            <View style={styles.headerRow}><ThemedText>Subtotal</ThemedText><ThemedText type="subtitle">{formatPrice(subtotalCents)}</ThemedText></View>
            <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Shipping, taxes, inventory confirmation, and payment will be calculated during checkout.</ThemedText>
            {quoteError ? <ThemedText style={{ color: theme.danger }}>{quoteError}</ThemedText> : null}
            <Pressable
              disabled={preparing}
              onPress={() => void reviewCheckout()}
              style={[styles.checkoutButton, { backgroundColor: preparing ? theme.border : theme.accent }]}
            >
              {preparing ? <ActivityIndicator color={theme.mutedText} /> : <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Review live total</ThemedText>}
            </Pressable>
            {quote ? (
              <View style={[styles.quote, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
                <View style={styles.headerRow}><ThemedText type="defaultSemiBold">Live total</ThemedText><ThemedText type="subtitle">{formatPrice(quote.total_cents)}</ThemedText></View>
                <ThemedText style={[styles.meta, { color: theme.mutedText }]}>Inventory is currently available. Shipping, tax, and payment are added in the next checkout step.</ThemedText>
                {draftOrderId ? (
                  <ThemedText type="defaultSemiBold" style={{ color: theme.successForeground }}>Order draft #{draftOrderId} saved.</ThemedText>
                ) : (
                  <Pressable disabled={preparing} onPress={() => void saveOrderDraft()} style={[styles.checkoutButton, { backgroundColor: theme.accent }]}>
                    <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Save order draft</ThemedText>
                  </Pressable>
                )}
              </View>
            ) : null}
          </ThemedView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  body: { lineHeight: 21 },
  panel: { borderRadius: 24, padding: 16, gap: 16, borderWidth: StyleSheet.hairlineWidth },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  list: { gap: 12 },
  item: { borderRadius: 18, padding: 12, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  itemMain: { flexDirection: "row", gap: 12, alignItems: "center" },
  image: { width: 64, height: 64, borderRadius: 14 },
  imageFallback: { width: 64, height: 64, borderRadius: 14 },
  itemCopy: { flex: 1, gap: 4 },
  meta: { fontSize: 13 },
  controls: { flexDirection: "row", alignItems: "center", gap: 12 },
  quantityButton: { width: 32, height: 32, borderRadius: 10, alignItems: "center", justifyContent: "center", borderWidth: StyleSheet.hairlineWidth },
  summary: { borderRadius: 24, padding: 18, gap: 14, borderWidth: StyleSheet.hairlineWidth },
  checkoutButton: { borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  quote: { borderRadius: 16, padding: 14, gap: 8, borderWidth: StyleSheet.hairlineWidth },
});
