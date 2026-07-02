import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { StatusPanel } from "@/components/status-panel";
import { useColorScheme } from "@/hooks/use-color-scheme";

type DetailStat = {
  label: string;
  value: string;
};

type DetailTheme = (typeof Colors)[keyof typeof Colors];

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
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

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

      <ThemedView
        style={[
          styles.hero,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceMuted,
          },
        ]}
      >
        <ThemedText type="title" style={styles.heroTitle}>
          {title}
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>{description}</ThemedText>

        <View style={styles.statRow}>
          <StatCard theme={theme} {...topStats[0]} />
          <StatCard theme={theme} {...topStats[1]} />
        </View>
        <View style={styles.statRow}>
          <StatCard theme={theme} {...bottomStats[0]} />
          <StatCard theme={theme} {...bottomStats[1]} />
        </View>
      </ThemedView>

      <ThemedView
        style={[
          styles.panel,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceStrong,
          },
        ]}
      >
        {children}
      </ThemedView>
    </View>
  );
}

function StatCard({ label, value, theme }: DetailStat & { theme: DetailTheme }) {
  return (
    <View
      style={[
        styles.statCard,
        {
          borderColor: theme.border,
          backgroundColor: theme.surfaceStrong,
        },
      ]}
    >
      <ThemedText style={[styles.label, { color: theme.mutedText }]}>{label}</ThemedText>
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
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroBody: {},
  statRow: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 18,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  label: {
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
  },
});
