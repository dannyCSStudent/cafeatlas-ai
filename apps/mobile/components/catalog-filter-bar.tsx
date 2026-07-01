import { Pressable, ScrollView, StyleSheet, View } from "react-native";

import { SearchToolbar } from "@/components/search-toolbar";
import { ThemedText } from "@/components/themed-text";

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
  return (
    <View style={styles.wrapper}>
      <View style={styles.headerRow}>
        <ThemedText type="subtitle">Catalog</ThemedText>
        <Pressable onPress={onReset} style={styles.clearButton}>
          <ThemedText type="defaultSemiBold" style={styles.clearButtonText}>
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
          style={[styles.chip, featured === true && styles.chipActive]}
        >
          <ThemedText type="defaultSemiBold" style={featured === true ? styles.chipTextActive : styles.chipText}>
            Featured only
          </ThemedText>
        </Pressable>

        {stateOptions.map((state) => (
          <Pressable
            key={state}
            onPress={() => onToggleState(state)}
            style={[styles.chip, currentState === state && styles.chipActive]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={currentState === state ? styles.chipTextActive : styles.chipText}
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
              style={[styles.sortChip, currentProducerSlug === slug && styles.sortChipActive]}
            >
              <ThemedText
                type="defaultSemiBold"
                style={currentProducerSlug === slug ? styles.sortChipTextActive : styles.sortChipText}
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
            style={[styles.sortChip, currentSort === option && styles.sortChipActive]}
          >
            <ThemedText
              type="defaultSemiBold"
              style={currentSort === option ? styles.sortChipTextActive : styles.sortChipText}
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
    borderColor: "rgba(120, 85, 50, 0.2)",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  clearButtonText: {
    color: "#22140a",
  },
  row: {
    gap: 10,
  },
  chip: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  chipActive: {
    backgroundColor: "#22140a",
  },
  chipText: {
    color: "#4b3c2f",
    fontSize: 12,
  },
  chipTextActive: {
    color: "#fff",
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
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  sortChipActive: {
    backgroundColor: "#22140a",
  },
  sortChipText: {
    color: "#4b3c2f",
    fontSize: 12,
  },
  sortChipTextActive: {
    color: "#fff",
    fontSize: 12,
  },
});
