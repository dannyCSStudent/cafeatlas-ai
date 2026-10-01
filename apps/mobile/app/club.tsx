import { useState } from "react";
import { Linking, Pressable, ScrollView, StyleSheet, View } from "react-native";
import { useRouter } from "expo-router";

import { Colors } from "@/constants/theme";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { createSubscriptionCheckout, type SubscriptionPlan } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";
import { useColorScheme } from "@/hooks/use-color-scheme";

const plans: { id: SubscriptionPlan; name: string; price: string; detail: string; perks: string[] }[] = [
  { id: "seasonal", name: "Seasonal Box", price: "$29 / month", detail: "Two rotating bags from the current catalog.", perks: ["2 coffees", "Roaster notes", "Seasonal rotation"] },
  { id: "origin", name: "Origin Club", price: "$49 / month", detail: "Three coffees with deeper farm and producer context.", perks: ["3 coffees", "Origin cards", "Priority access"] },
  { id: "reserve", name: "Reserve Club", price: "$79 / month", detail: "Limited lots with expanded provenance and rewards.", perks: ["4 coffees", "Limited lots", "Member rewards"] },
];

export default function ClubScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [loadingPlan, setLoadingPlan] = useState<SubscriptionPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choosePlan(plan: SubscriptionPlan) {
    setLoadingPlan(plan);
    setError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before choosing a Club plan.");
      const baseUrl = process.env.EXPO_PUBLIC_CAFEATLAS_CHECKOUT_URL ?? "http://localhost:8081";
      const result = await createSubscriptionCheckout(plan, `${baseUrl}/club?checkout=success`, `${baseUrl}/club?checkout=cancelled`, account.session.access_token);
      await Linking.openURL(result.checkout_url);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Could not start Club checkout.");
    } finally {
      setLoadingPlan(null);
    }
  }

  return <ScrollView contentContainerStyle={styles.container}>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Monthly subscription</ThemedText><ThemedText type="title" style={styles.heroTitle}>Coffee club.</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>Choose a recurring box and continue to Stripe Checkout. Subscriptions are billed in Stripe test mode until you switch to live prices.</ThemedText><View style={styles.actions}><Pressable onPress={() => router.push("/account")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Account</ThemedText></Pressable><Pressable onPress={() => router.push("/recommendations")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}><ThemedText type="defaultSemiBold">Recommendations</ThemedText></Pressable></View></ThemedView>
    {error ? <StatusPanel title="Could not start Club checkout." message={error} /> : null}
    <View style={styles.list}>{plans.map((plan, index) => <ThemedView key={plan.id} style={[styles.card, { borderColor: index === 1 ? theme.accent : theme.border, backgroundColor: theme.surfaceStrong }]}><View style={styles.row}><View style={styles.copy}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Monthly</ThemedText><ThemedText type="subtitle">{plan.name}</ThemedText></View><ThemedText type="defaultSemiBold">{plan.price}</ThemedText></View><ThemedText style={[styles.body, { color: theme.mutedText }]}>{plan.detail}</ThemedText><View style={styles.chips}>{plan.perks.map((perk) => <View key={perk} style={[styles.chip, { backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.meta, { color: theme.mutedText }]}>{perk}</ThemedText></View>)}</View><Pressable disabled={loadingPlan !== null} onPress={() => void choosePlan(plan.id)} style={[styles.primaryButton, { backgroundColor: loadingPlan === plan.id ? theme.border : theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{loadingPlan === plan.id ? "Opening Stripe..." : "Choose plan"}</ThemedText></Pressable></ThemedView>)}</View>
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, hero: { borderRadius: 28, padding: 20, gap: 12, borderWidth: StyleSheet.hairlineWidth }, kicker: { textTransform: "uppercase", letterSpacing: 1.1, fontSize: 11 }, heroTitle: { fontSize: 34 }, body: { lineHeight: 22 }, actions: { flexDirection: "row", gap: 10 }, secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth }, list: { gap: 14 }, card: { borderRadius: 26, padding: 18, gap: 13, borderWidth: StyleSheet.hairlineWidth }, row: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 10 }, copy: { flex: 1, gap: 6 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 7 }, meta: { fontSize: 12 }, primaryButton: { borderRadius: 18, paddingVertical: 13, alignItems: "center" },
});
