import { ActivityIndicator, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

type StatusPanelProps = {
  title: string;
  message?: string;
  loading?: boolean;
};

export function StatusPanel({ title, message, loading = false }: StatusPanelProps) {
  return (
    <View style={styles.container}>
      {loading ? <ActivityIndicator /> : null}
      <ThemedText type="defaultSemiBold">{title}</ThemedText>
      {message ? <ThemedText style={styles.message}>{message}</ThemedText> : null}
    </View>
  );
}

const styles = {
  container: {
    minHeight: 140,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
  message: {
    color: "#5f5146",
    textAlign: "center" as const,
  },
};
