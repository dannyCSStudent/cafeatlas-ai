import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";

type SearchToolbarProps = {
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  clearLabel?: string;
  submitLabel?: string;
  onClear?: () => void;
};

export function SearchToolbar({
  value,
  placeholder,
  onChangeText,
  onSubmit,
  clearLabel = "Clear",
  submitLabel = "Search",
  onClear,
}: SearchToolbarProps) {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];

  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={theme.mutedText}
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        style={[
          styles.input,
          {
            borderColor: theme.border,
            backgroundColor: theme.surfaceStrong,
            color: theme.text,
          },
        ]}
      />
      <Pressable onPress={onSubmit} style={[styles.button, { backgroundColor: theme.accent }]}>
        <ThemedText
          type="defaultSemiBold"
          style={[styles.buttonText, { color: theme.accentForeground }]}
        >
          {submitLabel}
        </ThemedText>
      </Pressable>
      {onClear ? (
        <Pressable
          onPress={onClear}
          style={[
            styles.clearButton,
            {
              borderColor: theme.border,
              backgroundColor: theme.surfaceStrong,
            },
          ]}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[styles.clearButtonText, { color: theme.accent }]}
          >
            {clearLabel}
          </ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
  },
  input: {
    flex: 1,
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 18,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  clearButton: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: {},
  clearButtonText: {},
});
