import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

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
  rank?: string;
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
  rank,
  style,
}: LearnArticleCardProps) {
  return (
    <Pressable onPress={onPress} style={[styles.card, { borderColor, backgroundColor }, style]}>
      {rank ? (
        <View style={styles.markRow}>
          <View style={[styles.mark, { borderColor, backgroundColor: metaBackgroundColor }]}>
            <ThemedText type="defaultSemiBold" style={[styles.markText, { color: metaTextColor }]}>
              {rank}
            </ThemedText>
          </View>
          <View style={[styles.markRule, { backgroundColor: borderColor }]} />
        </View>
      ) : null}
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
    borderRadius: 18,
    padding: 12,
    gap: 5,
    borderWidth: StyleSheet.hairlineWidth,
  },
  kicker: {
    fontSize: 11,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  body: {
    lineHeight: 19,
  },
  markRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  mark: {
    width: 34,
    height: 34,
    borderRadius: 999,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: "center",
    justifyContent: "center",
  },
  markText: {
    fontSize: 11,
  },
  markRule: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  meta: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 0,
  },
});
