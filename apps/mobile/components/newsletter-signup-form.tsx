"use client";

import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { subscribeToNewsletter } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Colors } from "@/constants/theme";
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function NewsletterSignupForm() {
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [email, setEmail] = useState("");
  const [feedback, setFeedback] = useState<{
    tone: "success" | "info" | "error";
    message: string;
  } | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      setFeedback({ tone: "error", message: "Enter a valid email address." });
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    try {
      const response = await subscribeToNewsletter(normalized);
      setFeedback(
        response.subscribed
          ? { tone: "success", message: "You're on the list." }
          : { tone: "info", message: "You're already subscribed." }
      );
      setEmail("");
    } catch (nextError) {
      setFeedback({
        tone: "error",
        message: nextError instanceof Error ? nextError.message : "Failed to subscribe.",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ThemedView style={[styles.card, { borderColor: theme.border, backgroundColor: theme.surface }]}>
      <View style={styles.copy}>
        <ThemedText style={[styles.kicker, { color: theme.mutedText }]}>Newsletter signup</ThemedText>
        <ThemedText type="subtitle">Get new stories in your inbox</ThemedText>
        <ThemedText style={[styles.body, { color: theme.mutedText }]}>
          Seasonal notes, origin stories, and new coffee releases, delivered sparingly.
        </ThemedText>
      </View>

      <View style={styles.form}>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="you@example.com"
          placeholderTextColor={theme.mutedText}
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          textContentType="emailAddress"
          style={[styles.input, { borderColor: theme.border, backgroundColor: theme.surfaceStrong, color: theme.text }]}
        />
        <Pressable
          onPress={() => void handleSubmit()}
          disabled={submitting}
          style={[styles.button, { backgroundColor: theme.accent }]}
        >
          <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
            {submitting ? "Subscribing..." : "Subscribe"}
          </ThemedText>
        </Pressable>
      </View>

      {feedback ? (
        <View
          style={[
            styles.feedbackCard,
            {
              borderColor:
                feedback.tone === "success"
                  ? theme.successForeground
                  : feedback.tone === "info"
                    ? theme.border
                    : theme.danger,
              backgroundColor:
                feedback.tone === "success"
                  ? theme.success
                  : feedback.tone === "info"
                    ? theme.surfaceMuted
                    : theme.danger,
            },
          ]}
        >
          <ThemedText
            style={[
              styles.feedback,
              {
                color:
                  feedback.tone === "success"
                    ? theme.successForeground
                    : feedback.tone === "info"
                      ? theme.mutedText
                      : theme.dangerForeground,
              },
            ]}
          >
            {feedback.message}
          </ThemedText>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 12,
  },
  copy: {
    gap: 6,
  },
  kicker: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  body: {
    lineHeight: 20,
  },
  form: {
    gap: 10,
  },
  input: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
  },
  button: {
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: "center",
  },
  feedback: {
    lineHeight: 20,
  },
  feedbackCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
});
