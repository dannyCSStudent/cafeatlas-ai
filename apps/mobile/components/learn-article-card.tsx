import { Pressable, StyleSheet, type StyleProp, type ViewStyle } from "react-native";

import { ArticleMeta } from "@/components/article-meta";
import { ThemedText } from "@/components/themed-text";
import type { LearnArticle } from "@repo/ui/learn";

type LearnArticleCardProps = {
  article: LearnArticle;
  onPress: () => void;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  metaBackgroundColor: string;
  metaTextColor: string;
  style?: StyleProp<ViewStyle>;
};

export function LearnArticleCard({
  article,
  onPress,
  borderColor,
  backgroundColor,
  textColor,
  metaBackgroundColor,
  metaTextColor,
  style,
}: LearnArticleCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { borderColor, backgroundColor }, style]}>
      <ThemedText style={[styles.kicker, { color: textColor }]}>{article.tag}</ThemedText>
      <ThemedText type="subtitle">{article.title}</ThemedText>
      <ThemedText style={[styles.body, { color: textColor }]}>{article.body}</ThemedText>
      <ArticleMeta
        readTime={article.readTime}
        updated={article.updated}
        containerStyle={styles.meta}
        borderColor={borderColor}
        backgroundColor={metaBackgroundColor}
        textColor={metaTextColor}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    padding: 14,
    gap: 6,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  body: {
    lineHeight: 20,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 2,
  },
});
