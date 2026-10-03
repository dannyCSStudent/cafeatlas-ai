import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createGiftRequest } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

const boxes = [
  { name: "Holiday Pair", price: "$58", detail: "Two coffees with a seasonal note card and festive packaging.", highlights: ["2 coffees", "Gift wrap", "Personal note"] },
  { name: "Office Tasting Set", price: "$132", detail: "A four-bag tasting box for teams, client gifts, and shared sampling.", highlights: ["4 coffees", "Bulk pricing", "One address"] },
  { name: "Reserve Gift Box", price: "$96", detail: "A premium box for limited lots and a detailed origin story.", highlights: ["Limited lots", "Origin cards", "Handwritten insert"] },
];

export default function GiftsScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [selectedBox, setSelectedBox] = useState(boxes[0].name);
  const [quantity, setQuantity] = useState("1");
  const [country, setCountry] = useState("US");
  const [note, setNote] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  async function submitRequest() {
    try { const account = await hydrateMobileSession(); if (!account) throw new Error("Sign in before requesting a gift box."); await createGiftRequest({ box_name: selectedBox, quantity: Math.max(1, Number(quantity) || 1), delivery_country: country.trim().toUpperCase(), note: note.trim() }, account.session.access_token); setMessage("Gift request submitted."); setNote(""); } catch (error) { setMessage(error instanceof Error ? error.message : "Could not submit gift request."); }
  }
  return <ScrollView contentContainerStyle={styles.container}>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Gift boxes</ThemedText><ThemedText type="title" style={styles.heroTitle}>Give a better coffee story.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Holiday boxes, corporate gifts, personalized notes, and bulk coffee gifting from the CafeAtlas catalog.</ThemedText><View style={styles.actions}><Pressable onPress={() => router.push("/account")} style={[styles.primaryButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Request a gift</ThemedText></Pressable><Pressable onPress={() => router.push("/club")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Coffee Club</ThemedText></Pressable></View></ThemedView>
    <View style={styles.list}>{boxes.map((box, index) => <ThemedView key={box.name} style={[styles.card, { borderColor: index === 1 ? theme.accent : theme.border, backgroundColor: theme.surfaceStrong }]}><View style={styles.row}><View style={styles.copy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Gift box</ThemedText><ThemedText type="subtitle">{box.name}</ThemedText></View><ThemedText type="defaultSemiBold">{box.price}</ThemedText></View><ThemedText style={[styles.body, { color: theme.mutedText }]}>{box.detail}</ThemedText><View style={styles.chips}>{box.highlights.map((highlight) => <View key={highlight} style={[styles.chip, { backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{highlight}</ThemedText></View>)}</View><Pressable onPress={() => router.push("/account")} style={[styles.cardButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Request this box</ThemedText></Pressable></ThemedView>)}</View>
    <ThemedView style={[styles.info, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText type="subtitle">Request a gift box</ThemedText><View style={styles.chips}>{boxes.map((box) => <Pressable key={box.name} onPress={() => setSelectedBox(box.name)} style={[styles.chip, { borderColor: selectedBox === box.name ? theme.accent : theme.border, backgroundColor: selectedBox === box.name ? theme.accent : theme.surface }]}><ThemedText style={selectedBox === box.name ? { color: theme.accentForeground } : undefined}>{box.name}</ThemedText></Pressable>)}</View><TextInput value={quantity} onChangeText={setQuantity} keyboardType="number-pad" placeholder="Quantity" placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><TextInput value={country} onChangeText={setCountry} autoCapitalize="characters" maxLength={2} placeholder="Country code" placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><TextInput value={note} onChangeText={setNote} multiline placeholder="Personal note or business request" placeholderTextColor={theme.mutedText} style={[styles.input, styles.noteInput, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surface }]} /><Pressable onPress={() => void submitRequest()} style={[styles.cardButton, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Submit request</ThemedText></Pressable>{message ? <ThemedText style={[styles.meta, { color: theme.mutedText }]}>{message}</ThemedText> : null}</ThemedView>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, heroTitle: { fontSize: 31, lineHeight: 36 }, body: { lineHeight: 22 }, actions: { flexDirection: "row", gap: 10 }, primaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center" }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, list: { gap: 14 }, card: { borderRadius: 26, padding: 18, gap: 13, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, copy: { flex: 1, gap: 6 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7, borderWidth: StyleSheet.hairlineWidth }, meta: { fontSize: 12 }, cardButton: { borderRadius: 17, paddingVertical: 12, alignItems: "center" }, info: { borderRadius: 26, padding: 18, gap: 12, borderWidth: StyleSheet.hairlineWidth }, input: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 12, paddingVertical: 11, fontSize: 15 }, noteInput: { minHeight: 90, textAlignVertical: "top" }, step: { borderRadius: 17, padding: 13, gap: 5, backgroundColor: "rgba(128, 77, 39, 0.08)" },
});
