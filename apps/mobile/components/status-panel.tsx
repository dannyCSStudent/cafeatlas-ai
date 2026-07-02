import { ActivityIndicator, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StatusPanelProps = {
  title: string;
  message?: string;
  loading?: boolean;
};

export function StatusPanel({ title, message, loading = false }: StatusPanelProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.surfaceStrong,
          borderColor: theme.border,
        },
      ]}
    >
      {loading ? <ActivityIndicator color={theme.accent} /> : null}
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      {message ? <ThemedText style={[styles.message, { color: theme.mutedText }]}>{message}</ThemedText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 140,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 24,
    padding: 18,
  },
  message: {
    textAlign: "center" as const,
  },
});
