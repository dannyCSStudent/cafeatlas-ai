import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { Colors } from "@/constants/theme";
import { SearchToolbar } from "@/components/search-toolbar";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type CatalogFilterBarProps = {
  searchDraft: string;
  onSearchDraftChange: (value: string) => void;
  onSearchSubmit: () => void;
  onSearchClear?: () => void;
  onReset: () => void;
  featured: boolean | null;
  onToggleFeatured: () => void;
  stateOptions: readonly string[];
  currentState: string | null;
  onToggleState: (value: string) => void;
  producerChips: readonly [string, string][];
  currentProducerSlug: string | null;
  onToggleProducerSlug: (value: string) => void;
  sortOptions: readonly string[];
  currentSort: string;
  onChangeSort: (value: string) => void;
};

export function CatalogFilterBar({
  searchDraft,
  onSearchDraftChange,
  onSearchSubmit,
  onSearchClear,
  onReset,
  featured,
  onToggleFeatured,
  stateOptions,
  currentState,
  onToggleState,
  producerChips,
  currentProducerSlug,
  onToggleProducerSlug,
  sortOptions,
  currentSort,
  onChangeSort,
}: CatalogFilterBarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Catalog</ThemedText>
        <Pressable
          onPress={onReset}
          style={[
            styles.clearButton,
            {
              borderColor: theme.border,
              backgroundColor: theme.surfaceStrong,
            },
          ]}
        >
          <ThemedText type="defaultSemiBold" style={[styles.clearButtonText, { color: theme.accent }]}>
            Reset
          </ThemedText>
        </Pressable>
      </View>

      <SearchToolbar
        value={searchDraft}
        onChangeText={onSearchDraftChange}
        placeholder="Search coffees"
        onSubmit={onSearchSubmit}
        onClear={onSearchClear}
      />

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        <Pressable
          onPress={onToggleFeatured}
          style={[
            styles.chip,
            {
              borderColor: theme.border,
              backgroundColor: theme.surfaceStrong,
            },
            featured === true && {
              backgroundColor: theme.accent,
              borderColor: theme.accent,
            },
          ]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.chipText,
              featured === true
                ? { color: theme.accentForeground }
                : { color: theme.mutedText },
            ]}
          >
            Featured only
          </ThemedText>
        </Pressable>

        {stateOptions.map((state) => (
          <Pressable
            key={state}
            onPress={() => onToggleState(state)}
            style={[
              styles.chip,
              {
                borderColor: theme.border,
                backgroundColor: theme.surfaceStrong,
              },
              currentState === state && {
                backgroundColor: theme.accent,
                borderColor: theme.accent,
              },
            ]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.chipText,
                currentState === state ? { color: theme.accentForeground } : { color: theme.mutedText },
              ]}
            >
              {state}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.group}>
        <ThemedText style={styles.groupLabel}>Producers</ThemedText>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
          {producerChips.map(([slug, label]) => (
            <Pressable
              key={slug}
              onPress={() => onToggleProducerSlug(slug)}
              style={[
                styles.sortChip,
                {
                  borderColor: theme.border,
                  backgroundColor: theme.surfaceStrong,
                },
                currentProducerSlug === slug && {
                  backgroundColor: theme.accent,
                  borderColor: theme.accent,
                },
              ]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.sortChipText,
                  currentProducerSlug === slug
                    ? { color: theme.accentForeground }
                    : { color: theme.mutedText },
                ]}
              >
                {label}
              </ThemedText>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {sortOptions.map((option) => (
          <Pressable
            key={option}
            onPress={() => onChangeSort(option)}
            style={[
              styles.sortChip,
              {
                borderColor: theme.border,
                backgroundColor: theme.surfaceStrong,
              },
              currentSort === option && {
                backgroundColor: theme.accent,
                borderColor: theme.accent,
              },
            ]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.sortChipText,
                currentSort === option ? { color: theme.accentForeground } : { color: theme.mutedText },
              ]}
            >
              {option.replace("_", " ")}
            </ThemedText>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  clearButton: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearButtonText: {},
  row: {
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipText: {
    fontSize: 12,
  },
  group: {
    gap: 10,
  },
  groupLabel: {
    color: "#5f5146",
  },
  sortChip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortChipText: {
    fontSize: 12,
  },
});
