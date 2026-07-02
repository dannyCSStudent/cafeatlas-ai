import { Link } from "expo-router";
import { useEffect, useState, type ReactNode } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { fetchFarms, fetchProducers, type FarmRead, type ProducerRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [producers, setProducers] = useState<ProducerRead[]>([]);
  const [farms, setFarms] = useState<FarmRead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadOrigins() {
      setLoading(true);
      setError(null);

      try {
        const [producerData, farmData] = await Promise.all([fetchProducers(), fetchFarms()]);
        if (!active) return;
        setProducers(producerData);
        setFarms(farmData);
      } catch (nextError) {
        if (!active) return;
        setError(nextError instanceof Error ? nextError.message : "Failed to load origins.");
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrigins();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ThemedView
        style={[
          styles.hero,
          { borderColor: theme.border, backgroundColor: theme.surfaceMuted },
        ]}
      >
        <ThemedText type="title" style={styles.heroTitle}>
          Origin atlas.
        </ThemedText>
        <ThemedText style={[styles.heroBody, { color: theme.mutedText }]}>
          Explore the producers and farms that power the coffee catalog.
        </ThemedText>
        <View style={styles.actions}>
          <Link href="/producers" asChild>
            <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <ThemedText type="defaultSemiBold">All producers</ThemedText>
            </Pressable>
          </Link>
          <Link href="/farms" asChild>
            <Pressable style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surface }]}>
              <ThemedText type="defaultSemiBold">All farms</ThemedText>
            </Pressable>
          </Link>
        </View>
      </ThemedView>

      <ThemedView
        style={[
          styles.panel,
          { borderColor: theme.border, backgroundColor: theme.surfaceStrong },
        ]}
      >
        {loading ? (
          <View style={styles.stateBox}>
            <ActivityIndicator />
            <ThemedText style={[styles.stateText, { color: theme.mutedText }]}>Loading origin profiles...</ThemedText>
          </View>
        ) : error ? (
          <View style={styles.stateBox}>
            <ThemedText type="defaultSemiBold">Could not load origin data.</ThemedText>
            <ThemedText style={[styles.stateText, { color: theme.mutedText }]}>{error}</ThemedText>
          </View>
        ) : (
          <View style={styles.splitGrid}>
            <Section
              title="Producers"
              subtitle={`${producers.length} records`}
            >
              {producers.map((producer) => (
                <Link key={producer.id} href={`/producers/${producer.slug}`} asChild>
                  <Pressable
                    style={[
                      styles.card,
                      { borderColor: theme.border, backgroundColor: theme.surface },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <ThemedText type="subtitle">{producer.name}</ThemedText>
                      <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{producer.farms.length} farms</ThemedText>
                    </View>
                    <ThemedText numberOfLines={2} style={[styles.cardBody, { color: theme.mutedText }]}>
                      {producer.description || "A producer profile without a description yet."}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </Section>

            <Section
              title="Farms"
              subtitle={`${farms.length} records`}
            >
              {farms.map((farm) => (
                <Link key={farm.id} href={`/farms/${farm.slug}`} asChild>
                  <Pressable
                    style={[
                      styles.card,
                      { borderColor: theme.border, backgroundColor: theme.surface },
                    ]}
                  >
                    <View style={styles.cardHeader}>
                      <ThemedText type="subtitle">{farm.name}</ThemedText>
                      <ThemedText style={[styles.cardMeta, { color: theme.mutedText }]}>{farm.state}</ThemedText>
                    </View>
                    <ThemedText numberOfLines={2} style={[styles.cardBody, { color: theme.mutedText }]}>
                      {farm.description || "A farm profile without a description yet."}
                    </ThemedText>
                  </Pressable>
                </Link>
              ))}
            </Section>
          </View>
        )}
      </ThemedView>
    </ScrollView>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <ThemedText type="subtitle">{title}</ThemedText>
        <ThemedText style={styles.cardMeta}>{subtitle}</ThemedText>
      </View>
      <View style={styles.sectionList}>
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 16,
  },
  hero: {
    borderRadius: 28,
    padding: 20,
    gap: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  heroTitle: {
    fontSize: 32,
    lineHeight: 36,
  },
  heroBody: {
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  panel: {
    borderRadius: 28,
    padding: 16,
    gap: 14,
    borderWidth: StyleSheet.hairlineWidth,
  },
  stateBox: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 160,
    gap: 10,
  },
  stateText: {
    textAlign: 'center',
  },
  splitGrid: {
    gap: 16,
  },
  section: {
    gap: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionList: {
    gap: 10,
  },
  card: {
    borderRadius: 22,
    padding: 14,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 8,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  cardMeta: {
    fontSize: 12,
  },
  cardBody: {
  },
});
