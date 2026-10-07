import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useCart } from "@/lib/cart";
import { fetchMarketplaceProducts, formatPrice, type MarketplaceProductRead } from "@/lib/cafeatlas-api";

export default function MarketplaceScreen() {
  const theme = Colors[useColorScheme() ?? "light"];
  const { addMarketplaceItem, items } = useCart();
  const [products, setProducts] = useState<MarketplaceProductRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchMarketplaceProducts().then((nextProducts) => {
      if (active) setProducts(nextProducts);
    }).catch((nextError) => {
      if (active) setError(nextError instanceof Error ? nextError.message : "Could not load marketplace products.");
    }).finally(() => {
      if (active) setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) return <StatusPanel title="Loading marketplace..." loading />;
  if (error) return <StatusPanel title="Could not load marketplace." message={error} />;

  return <ScrollView contentContainerStyle={styles.container}><ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Marketplace</ThemedText><ThemedText type="title">More flavors around the cup.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Cacao, vanilla, honey, regional foods, and artisan goods from the CafeAtlas network.</ThemedText></ThemedView>{products.length === 0 ? <StatusPanel title="The marketplace is opening soon." message="Products added by the team will appear here." /> : <View style={styles.grid}>{products.map((product) => { const quantity = items.find((item) => item.kind === "marketplace" && item.marketplaceProductId === product.id)?.quantity ?? 0; return <ThemedView key={product.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>{product.image_url ? <Image source={{ uri: product.image_url }} style={styles.image} /> : <View style={[styles.imageFallback, { backgroundColor: theme.surfaceMuted }]}><ThemedText style={{ color: theme.mutedText }}>{product.category}</ThemedText></View>}<ThemedText type="subtitle">{product.name}</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>{product.description ?? "A new CafeAtlas marketplace product."}</ThemedText><View style={styles.cardFooter}><ThemedText type="defaultSemiBold">{formatPrice(product.price_cents)}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{product.inventory_units} available</ThemedText></View><Pressable disabled={product.inventory_units < 1} onPress={() => addMarketplaceItem(product)} style={[styles.button, { backgroundColor: product.inventory_units < 1 ? theme.border : theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: product.inventory_units < 1 ? theme.mutedText : theme.accentForeground }}>{quantity ? `Add another (${quantity})` : product.inventory_units < 1 ? "Out of stock" : "Add to cart"}</ThemedText></Pressable></ThemedView>; })}</View>}</ScrollView>;
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  body: { lineHeight: 21 },
  grid: { gap: 14 },
  card: { borderRadius: 24, padding: 16, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  image: { width: "100%", height: 150, borderRadius: 16 },
  imageFallback: { width: "100%", height: 150, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  cardFooter: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  meta: { fontSize: 12 },
  button: { borderRadius: 14, paddingVertical: 13, alignItems: "center" },
});
