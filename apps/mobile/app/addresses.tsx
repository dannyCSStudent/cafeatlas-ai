import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { createAddress, deleteAddress, fetchAddresses, type AddressRead } from "@/lib/cafeatlas-api";
import { hydrateMobileSession } from "@/lib/supabase-auth";

type AddressForm = { label: string; recipient_name: string; address_line1: string; address_line2: string; city: string; region: string; postal_code: string; country_code: string };
const emptyForm: AddressForm = { label: "Home", recipient_name: "", address_line1: "", address_line2: "", city: "", region: "", postal_code: "", country_code: "US" };
const fields: [keyof AddressForm, string, boolean][] = [["label", "Label", true], ["recipient_name", "Full name", true], ["address_line1", "Address", true], ["address_line2", "Apartment or unit (optional)", false], ["city", "City", true], ["region", "State", true], ["postal_code", "ZIP code", true]];

export default function AddressesScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [items, setItems] = useState<AddressRead[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        const account = await hydrateMobileSession();
        if (!account) throw new Error("Sign in from the Account tab to manage addresses.");
        const nextItems = await fetchAddresses(account.session.access_token);
        if (active) setItems(nextItems);
      } catch (nextError) { if (active) setError(nextError instanceof Error ? nextError.message : "Could not load addresses."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save() {
    if (fields.some(([name, , required]) => required && !form[name].trim())) { setError("Complete all required address fields."); return; }
    setSaving(true); setError(null);
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before saving an address.");
      const created = await createAddress(form, account.session.access_token);
      setItems((current) => [...current, created]);
      setForm(emptyForm);
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not save address."); }
    finally { setSaving(false); }
  }

  async function remove(item: AddressRead) {
    try {
      const account = await hydrateMobileSession();
      if (!account) throw new Error("Sign in before removing an address.");
      await deleteAddress(item.id, account.session.access_token);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
    } catch (nextError) { setError(nextError instanceof Error ? nextError.message : "Could not remove address."); }
  }

  return <ScrollView contentContainerStyle={styles.container}>
    <View style={styles.actions}><Pressable onPress={() => router.back()} style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="defaultSemiBold">Back</ThemedText></Pressable><Pressable onPress={() => router.push("/orders")} style={[styles.button, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="defaultSemiBold">Orders</ThemedText></Pressable></View>
    <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}><ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Address book</ThemedText><ThemedText type="title">Saved shipping profiles.</ThemedText><ThemedText style={{ color: theme.mutedText }}>Keep checkout details ready across your orders.</ThemedText></ThemedView>
    {error ? <StatusPanel title="Address update" message={error} /> : null}
    {!loading && items.length ? <View style={styles.list}>{items.map((item) => <ThemedView key={item.id} style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="subtitle">{item.label}</ThemedText><ThemedText style={{ color: theme.mutedText }}>{item.recipient_name}{"\n"}{item.address_line1}{item.address_line2 ? `\n${item.address_line2}` : ""}{"\n"}{item.city}, {item.region} {item.postal_code}{"\n"}{item.country_code}</ThemedText><Pressable onPress={() => void remove(item)}><ThemedText style={{ color: theme.danger }}>Remove</ThemedText></Pressable></ThemedView>)}</View> : null}
    {loading ? <StatusPanel title="Loading addresses..." loading /> : <ThemedView style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}><ThemedText type="subtitle">Add an address</ThemedText>{fields.map(([name, label, required]) => <TextInput key={name} value={form[name]} onChangeText={(value) => setForm((current) => ({ ...current, [name]: value }))} placeholder={`${label}${required ? "" : " (optional)"}`} placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} />)}<Pressable disabled={saving} onPress={() => void save()} style={[styles.submit, { backgroundColor: saving ? theme.border : theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{saving ? "Saving..." : "Save address"}</ThemedText></Pressable></ThemedView>}
  </ScrollView>;
}

const styles = StyleSheet.create({ container: { padding: 16, gap: 16 }, actions: { flexDirection: "row", gap: 10 }, button: { borderRadius: 999, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 16, paddingVertical: 11 }, hero: { borderRadius: 28, borderWidth: StyleSheet.hairlineWidth, padding: 20, gap: 10 }, kicker: { fontSize: 12, letterSpacing: 1.4, textTransform: "uppercase" }, list: { gap: 12 }, card: { borderRadius: 22, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 12 }, input: { borderRadius: 14, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 12 }, submit: { borderRadius: 16, paddingVertical: 14, alignItems: "center" } });
