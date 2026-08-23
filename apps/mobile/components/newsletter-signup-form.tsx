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
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    const normalized = email.trim().toLowerCase();

    if (!EMAIL_PATTERN.test(normalized)) {
      setError("Enter a valid email address.");
      setStatus(null);
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await subscribeToNewsletter(normalized);
      setStatus(response.subscribed ? "You're on the list." : "You're already subscribed.");
      setEmail("");
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to subscribe.");
      setStatus(null);
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

      {status ? <ThemedText style={[styles.feedback, { color: theme.mutedText }]}>{status}</ThemedText> : null}
      {error ? <ThemedText style={[styles.feedback, { color: theme.danger }]}>{error}</ThemedText> : null}
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
});
