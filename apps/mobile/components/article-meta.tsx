import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { ThemedText } from "@/components/themed-text";

type ArticleMetaProps = {
  readTime?: string;
  updated?: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  containerStyle?: StyleProp<ViewStyle>;
};

export const LEARN_ARTICLE_META = {
  readTime: "2 min",
  updated: "Jul 31, 2026",
} as const;

export function ArticleMeta({
  readTime = LEARN_ARTICLE_META.readTime,
  updated = LEARN_ARTICLE_META.updated,
  borderColor,
  backgroundColor,
  textColor,
  containerStyle,
}: ArticleMetaProps) {
  return (
    <View style={[styles.container, containerStyle]}>
      <View style={[styles.pill, { borderColor, backgroundColor }]}>
        <ThemedText style={[styles.text, { color: textColor }]}>{readTime}</ThemedText>
      </View>
      <View style={[styles.pill, { borderColor, backgroundColor }]}>
        <ThemedText style={[styles.text, { color: textColor }]}>{updated}</ThemedText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pill: {
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  text: {
    fontSize: 11,
  },
});
