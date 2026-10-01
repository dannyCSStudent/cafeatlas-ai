import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchWishlistItems, setWishlistItem, type WishlistItemRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

export default function WishlistScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [items, setItems] = useState<WishlistItemRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const account = await hydrateMobileSession();
        if (!account) throw new Error("Sign in from the Account tab to view your wishlist.");
        const nextItems = await fetchWishlistItems(account.session.access_token);
        if (active) setItems(nextItems);
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Could not load wishlist.");
      } finally {
        if (active) setLoading(false);
      }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function remove(item: WishlistItemRead) {
    setRemovingId(item.coffee_id);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before editing your wishlist.");
      await setWishlistItem(item.coffee_id, false, account.session.access_token);
      setItems((current) => current.filter((entry) => entry.coffee_id !== item.coffee_id));
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not update wishlist.");
    } finally {
      setRemovingId(null);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.actions}>
        <Pressable onPress={() => router.back()} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="defaultSemiBold">Back</ThemedText></Pressable>
        <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="defaultSemiBold">Catalog</ThemedText></Pressable>
      </View>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Saved coffees</ThemedText>
        <ThemedText type="title">Your wishlist.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Keep origin stories and coffees you want to revisit close at hand.</ThemedText>
      </ThemedView>
      {loading ? <StatusPanel title="Loading wishlist..." loading /> : error ? <StatusPanel title="Could not load wishlist." message={error} /> : items.length === 0 ? <StatusPanel title="Your wishlist is empty." message="Save a coffee from its detail page to see it here." /> : (
        <View style={styles.list}>
          {items.map((item) => (
            <ThemedView key={item.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <Pressable onPress={() => item.coffee_slug ? router.push(`/coffees/${item.coffee_slug}`) : undefined}>
                <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{item.origin_state ?? "Mexican coffee"}</ThemedText>
                <ThemedText type="subtitle">{item.coffee_name ?? `Coffee #${item.coffee_id}`}</ThemedText>
              </Pressable>
              <Pressable disabled={removingId === item.coffee_id} onPress={() => void remove(item)} style={[styles.removeButton, { borderColor: theme.border }]}><ThemedText style={{ color: theme.mutedText }}>{removingId === item.coffee_id ? "Removing..." : "Remove"}</ThemedText></Pressable>
            </ThemedView>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  actions: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  secondaryButton: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 11 },
  hero: { borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 10 },
  kicker: { fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" },
  body: { lineHeight: 22 },
  list: { gap: 12 },
  card: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 14 },
  removeButton: { alignSelf: "flex-start", borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 8 },
});
