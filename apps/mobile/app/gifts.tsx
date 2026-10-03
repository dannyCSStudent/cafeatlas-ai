import { Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";

const boxes = [
  { name: "Holiday Pair", price: "$58", detail: "Two coffees with a seasonal note card and festive packaging.", highlights: ["2 coffees", "Gift wrap", "Personal note"] },
  { name: "Office Tasting Set", price: "$132", detail: "A four-bag tasting box for teams, client gifts, and shared sampling.", highlights: ["4 coffees", "Bulk pricing", "One address"] },
  { name: "Reserve Gift Box", price: "$96", detail: "A premium box for limited lots and a detailed origin story.", highlights: ["Limited lots", "Origin cards", "Handwritten insert"] },
];

export default function GiftsScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  return <ScrollView contentContainerStyle={styles.container}>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Gift boxes</ThemedText><ThemedText type="title" style={styles.heroTitle}>Give a better coffee story.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Holiday boxes, corporate gifts, personalized notes, and bulk coffee gifting from the CafeAtlas catalog.</ThemedText><View style={styles.actions}><Pressable onPress={() => router.push("/account")} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Request a gift</ThemedText></Pressable><Pressable onPress={() => router.push("/club")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Coffee Club</ThemedText></Pressable></View></ThemedView>
    <View style={styles.list}>{boxes.map((box, index) => <ThemedView key={box.name} style={[styles.card, { borderColor: index === 1 ? theme.accent : theme.border, backgroundColor: theme.surfaceStrong }]}><View style={styles.row}><View style={styles.copy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Gift box</ThemedText><ThemedText type="subtitle">{box.name}</ThemedText></View><ThemedText type="defaultSemiBold">{box.price}</ThemedText></View><ThemedText style={[styles.body, { color: theme.mutedText }]}>{box.detail}</ThemedText><View style={styles.chips}>{box.highlights.map((highlight) => <View key={highlight} style={[styles.chip, { backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{highlight}</ThemedText></View>)}</View><Pressable onPress={() => router.push("/account")} style={[styles.cardButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Request this box</ThemedText></Pressable></ThemedView>)}</View>
    <ThemedView style={[styles.info, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText type="subtitle">How gifting works</ThemedText>{["Choose a box or start from a budget.", "Add a personal note or brand message.", "Confirm the delivery destination and window.", "Request a quote for larger campaigns."].map((step, index) => <View key={step} style={styles.step}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Step {index + 1}</ThemedText><ThemedText style={styles.body}>{step}</ThemedText></View>)}</ThemedView>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center" }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, list: { gap: 14 }, card: { borderRadius: 26, padding: 18, gap: 13, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, copy: { flex: 1, gap: 6 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, meta: { fontSize: 12 }, cardButton: { borderRadius: 17, paddingVertical: 12, alignItems: "center" }, info: { borderRadius: 26, padding: 18, gap: 12, borderWidth: StyleSheet.hairlineWidth }, step: { borderRadius: 17, padding: 13, gap: 5, backgroundColor: "rgba(128, 77, 39, 0.08)" },
});
