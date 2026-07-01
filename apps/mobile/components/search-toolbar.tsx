import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { ThemedText } from "@/components/themed-text";

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
  return (
    <View style={styles.row}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#9b8f87"
        autoCapitalize="none"
        autoCorrect={false}
        returnKeyType="search"
        onSubmitEditing={onSubmit}
        style={styles.input}
      />
      <Pressable onPress={onSubmit} style={styles.button}>
        <ThemedText type="defaultSemiBold" style={styles.buttonText}>
          {submitLabel}
        </ThemedText>
      </Pressable>
      {onClear ? (
        <Pressable onPress={onClear} style={styles.clearButton}>
          <ThemedText type="defaultSemiBold" style={styles.clearButtonText}>
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
    borderColor: "rgba(120, 85, 50, 0.18)",
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  button: {
    borderRadius: 18,
    backgroundColor: "#22140a",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  buttonText: {
    color: "#fff",
  },
  clearButton: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(120, 85, 50, 0.2)",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  clearButtonText: {
    color: "#22140a",
  },
});
