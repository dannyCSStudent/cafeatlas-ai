import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchCoffeeCatalog, fetchReviews, type CoffeeRead, type ReviewRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

type ReviewCard = { coffee: CoffeeRead; review: ReviewRead };

export default function CommunityScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [reviews, setReviews] = useState<ReviewCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void fetchCoffeeCatalog({ page: 1, pageSize: 12, sort: "featured" })
      .then(async (catalog) => {
        const groups = await Promise.all(catalog.items.map(async (coffee) => {
          try { return (await fetchReviews(coffee.id)).map((review) => ({ coffee, review })); } catch { return []; }
        }));
        setReviews(groups.flat().sort((left, right) => right.review.created_at.localeCompare(left.review.created_at)));
      })
      .catch((nextError) => setError(nextError instanceof Error ? nextError.message : "Could not load community reviews."))
      .finally(() => setLoading(false));
  }, []);

  return <ScrollView contentContainerStyle={styles.container}>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Community</ThemedText><ThemedText type="title" style={styles.heroTitle}>Read what people are tasting.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Browse real reviews from the CafeAtlas catalog, then open a coffee to add your own experience.</ThemedText><View style={styles.actions}><Pressable onPress={() => router.push("/")} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Open catalog</ThemedText></Pressable><Pressable onPress={() => router.push("/account")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Account</ThemedText></Pressable></View></ThemedView>
    {loading ? <StatusPanel title="Loading community reviews..." loading /> : error ? <StatusPanel title="Could not load community." message={error} /> : <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><View style={styles.row}><View><ThemedText type="subtitle">Latest reviews</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{reviews.length} published review{reviews.length === 1 ? "" : "s"}</ThemedText></View></View>{reviews.length ? <View style={styles.list}>{reviews.map(({ coffee, review }) => <Pressable key={review.id} onPress={() => router.push(`/coffees/${coffee.slug}`)} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}><View style={styles.row}><View style={styles.copy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>{coffee.origin_state}</ThemedText><ThemedText type="defaultSemiBold">{review.title}</ThemedText><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{coffee.name} · {coffee.producer_name}</ThemedText></View><ThemedText type="subtitle">{review.rating}/5</ThemedText></View><ThemedText style={[styles.body, { color: theme.mutedText }]}>{review.body}</ThemedText></Pressable>)}</View> : <ThemedText style={[styles.body, { color: theme.mutedText }]}>No published reviews yet. Open a coffee detail page to be the first.</ThemedText>}</ThemedView>}
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center" }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, panel: { borderRadius: 28, padding: 16, gap: 14, borderWidth: StyleSheet.hairlineWidth }, list: { gap: 10 }, card: { borderRadius: 20, padding: 15, gap: 9, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }, copy: { flex: 1, gap: 5 }, meta: { fontSize: 13, lineHeight: 19 },
});
