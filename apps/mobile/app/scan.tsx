import { CameraView, useCameraPermissions, type BarcodeScanningResult } from "expo-camera";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { fetchCoffeeBySlug, type CoffeeRead } from "@/lib/cafeatlas-api";

function getCatalogSlug(value: string) {
  try {
    const url = new URL(value);
    const match = url.pathname.match(/\/coffees\/([^/]+)/);
    return match?.[1] ?? value;
  } catch {
    return value.trim().replace(/^\//, "");
  }
}

export default function ScanScreen() {
  const router = useRouter();
  const theme = Colors[useColorScheme() ?? "light"];
  const [permission, requestPermission] = useCameraPermissions();
  const [manualValue, setManualValue] = useState("");
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [coffee, setCoffee] = useState<CoffeeRead | null>(null);

  async function resolveValue(value: string) {
    const slug = getCatalogSlug(value);
    if (!slug) return;
    setScanned(true);
    setLoading(true);
    setError(null);
    try {
      setCoffee(await fetchCoffeeBySlug(slug));
    } catch {
      setCoffee(null);
      setError(`No catalog coffee matches “${slug}”. Scanned barcodes need to contain a CafeAtlas coffee slug or detail URL until barcode IDs are added to the product model.`);
    } finally {
      setLoading(false);
    }
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (!scanned) void resolveValue(result.data);
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView style={[styles.hero, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Barcode scanner</ThemedText>
        <ThemedText type="title">Find a coffee from the label.</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>Scan a CafeAtlas coffee label or paste a catalog slug while barcode IDs are being added to the product schema.</ThemedText>
      </ThemedView>

      {!permission ? <StatusPanel title="Checking camera permission..." loading /> : !permission.granted ? (
        <ThemedView style={[styles.permission, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
          <ThemedText type="subtitle">Camera access is needed</ThemedText>
          <ThemedText style={[styles.body, { color: theme.mutedText }]}>Allow camera access to scan a label, or use the manual lookup below.</ThemedText>
          <Pressable onPress={() => void requestPermission()} style={[styles.button, { backgroundColor: theme.accent }]}><ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Allow camera</ThemedText></Pressable>
        </ThemedView>
      ) : (
        <View style={[styles.cameraFrame, { borderColor: theme.border }]}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ["ean13", "ean8", "qr", "code128"] }}
            onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          />
          <View style={styles.scanGuide}><View style={[styles.scanLine, { backgroundColor: theme.accent }]} /></View>
          <ThemedText style={styles.cameraHint}>Point at a label or QR code</ThemedText>
        </View>
      )}

      <ThemedView style={[styles.panel, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
        <ThemedText type="subtitle">Manual lookup</ThemedText>
        <TextInput value={manualValue} onChangeText={setManualValue} placeholder="veracruz-heritage or a coffee URL" placeholderTextColor={theme.mutedText} style={[styles.input, { color: theme.text, borderColor: theme.border, backgroundColor: theme.surfaceMuted }]} autoCapitalize="none" />
        <Pressable disabled={!manualValue.trim() || loading} onPress={() => void resolveValue(manualValue)} style={[styles.button, { backgroundColor: manualValue.trim() && !loading ? theme.accent : theme.border }]}>
          {loading ? <ActivityIndicator color={theme.accentForeground} /> : <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>Look up coffee</ThemedText>}
        </Pressable>
        {error ? <ThemedText style={{ color: theme.danger }}>{error}</ThemedText> : null}
        {coffee ? <Pressable onPress={() => router.push(`/coffees/${coffee.slug}`)} style={[styles.result, { borderColor: theme.accent, backgroundColor: theme.surfaceMuted }]}><ThemedText type="defaultSemiBold">{coffee.name}</ThemedText><ThemedText style={[styles.body, { color: theme.mutedText }]}>{coffee.origin_state} · Open coffee detail</ThemedText></Pressable> : null}
        {scanned ? <Pressable onPress={() => { setScanned(false); setError(null); setCoffee(null); }}><ThemedText style={{ color: theme.accent }}>Scan another</ThemedText></Pressable> : null}
      </ThemedView>
      <ThemedText onPress={() => router.back()} style={[styles.back, { color: theme.accent }]}>Back</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 16 },
  hero: { borderRadius: 28, padding: 20, gap: 10, borderWidth: StyleSheet.hairlineWidth },
  kicker: { textTransform: "uppercase", letterSpacing: 1.4, fontSize: 12 },
  body: { lineHeight: 21 },
  permission: { borderRadius: 24, padding: 18, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  cameraFrame: { height: 320, overflow: "hidden", borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, backgroundColor: "#111" },
  scanGuide: { position: "absolute", left: "15%", right: "15%", top: "25%", height: "45%", borderWidth: 2, borderColor: "rgba(255,255,255,0.8)", borderRadius: 16 },
  scanLine: { position: "absolute", left: 8, right: 8, top: "50%", height: 2 },
  cameraHint: { position: "absolute", bottom: 16, left: 0, right: 0, textAlign: "center", color: "white" },
  panel: { borderRadius: 24, padding: 16, gap: 12, borderWidth: StyleSheet.hairlineWidth },
  input: { borderRadius: 16, paddingHorizontal: 14, paddingVertical: 14, borderWidth: StyleSheet.hairlineWidth },
  button: { borderRadius: 16, paddingVertical: 14, alignItems: "center" },
  result: { borderRadius: 16, padding: 14, gap: 4, borderWidth: StyleSheet.hairlineWidth },
  back: { textAlign: "center", fontWeight: "600" },
});
