import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StatusPanel } from "@/components/status-panel";

type DetailStat = {
  label: string;
  value: string;
};

type DetailScreenShellProps = {
  loading: boolean;
  error: string | null;
  loadingTitle: string;
  errorTitle: string;
  errorMessage?: string;
  actions: ReactNode;
  title: string;
  description: string;
  topStats: [DetailStat, DetailStat];
  bottomStats: [DetailStat, DetailStat];
  children: ReactNode;
};

export function DetailScreenShell({
  loading,
  error,
  loadingTitle,
  errorTitle,
  errorMessage,
  actions,
  title,
  description,
  topStats,
  bottomStats,
  children,
}: DetailScreenShellProps) {
  if (loading) {
    return (
      <StatusPanel
        title={loadingTitle}
        loading
      />
    );
  }

  if (error) {
    return <StatusPanel title={errorTitle} message={errorMessage ?? error} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.actions}>{actions}</View>

      <ThemedView style={styles.hero}>
        <ThemedText type="title" style={styles.heroTitle}>
          {title}
        </ThemedText>
        <ThemedText style={styles.heroBody}>{description}</ThemedText>

        <View style={styles.statRow}>
          <StatCard {...topStats[0]} />
          <StatCard {...topStats[1]} />
        </View>
        <View style={styles.statRow}>
          <StatCard {...bottomStats[0]} />
          <StatCard {...bottomStats[1]} />
        </View>
      </ThemedView>

      <ThemedView style={styles.panel}>{children}</ThemedView>
    </View>
  );
}

function StatCard({ label, value }: DetailStat) {
  return (
    <View style={styles.statCard}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <ThemedText type="defaultSemiBold" style={styles.statValue}>
        {value}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fff8f1",
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroBody: {
    color: "#5f5146",
  },
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#ffffff",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.14)",
  },
  label: {
    color: "#7d6e62",
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 12,
  },
  statValue: {
    marginTop: 8,
  },
  panel: {
    borderRadius: 28,
    padding: 20,
    gap: 8,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fffdf9",
  },
});
