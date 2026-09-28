import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Image, Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";

import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { createEventRsvp, fetchEventBySlug, type EventSessionRead } from "@/lib/cafeatlas-api";
import { useColorScheme } from "@/hooks/use-color-scheme";

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function formatEventDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

export default function EventDetailScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [event, setEvent] = useState<EventSessionRead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let active = true;

    async function loadEvent() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchEventBySlug(slug);
        if (active) setEvent(result);
      } catch (nextError) {
        if (active) setError(nextError instanceof Error ? nextError.message : "Failed to load event.");
      } finally {
        if (active) setLoading(false);
      }
    }

    if (slug) void loadEvent();
    return () => {
      active = false;
    };
  }, [slug]);

  async function handleRsvp() {
    const normalizedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedName) {
      setFeedback({ tone: "error", message: "Enter your name." });
      return;
    }
    if (!EMAIL_PATTERN.test(normalizedEmail)) {
      setFeedback({ tone: "error", message: "Enter a valid email address." });
      return;
    }
    if (!event) return;

    setSubmitting(true);
    setFeedback(null);
    try {
      await createEventRsvp(event.slug, {
        attendee_name: normalizedName,
        attendee_email: normalizedEmail,
        note: note.trim() || null,
      });
      setEvent((current) => current ? { ...current, rsvp_count: current.rsvp_count + 1 } : current);
      setFeedback({ tone: "success", message: "Your RSVP is saved. Watch your inbox for event details." });
    } catch (nextError) {
      setFeedback({ tone: "error", message: nextError instanceof Error ? nextError.message : "Unable to save your RSVP." });
    } finally {
      setSubmitting(false);
    }
  }

  const imageUrl = event?.image_url ?? event?.coffee?.image_url ?? event?.farm?.image_url ?? event?.producer?.image_url;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailScreenShell
        loading={loading}
        error={error}
        loadingTitle="Loading event..."
        errorTitle="Could not load event."
        errorMessage={error ?? "Event not found."}
        actions={
          <>
            <Pressable onPress={() => router.push("/(tabs)/events")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Events</ThemedText>
            </Pressable>
            <Pressable onPress={() => router.push("/")} style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
              <ThemedText type="defaultSemiBold">Catalog</ThemedText>
            </Pressable>
          </>
        }
        media={event ? (
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              {imageUrl ? <Image source={{ uri: imageUrl }} style={styles.mediaImage} resizeMode="cover" /> : <ThemedText type="defaultSemiBold">{event.title}</ThemedText>}
            </View>
            <View style={styles.mediaMeta}>
              <ThemedText style={[styles.label, { color: theme.mutedText }]}>Hosted by</ThemedText>
              <ThemedText type="defaultSemiBold">{event.host_name}</ThemedText>
            </View>
          </View>
        ) : null}
        title={event?.title ?? ""}
        description={event?.summary ?? ""}
        topStats={[
          { label: "When", value: event ? formatEventDate(event.starts_at) : "n/a" },
          { label: "Duration", value: event ? `${event.duration_minutes} min` : "n/a" },
        ]}
        bottomStats={[
          { label: "Type", value: event?.category ?? "n/a" },
          { label: "RSVPs", value: event ? String(event.rsvp_count) : "n/a" },
        ]}
      >
        {event ? (
          <View style={styles.content}>
            <ThemedText type="subtitle">Reserve a seat</ThemedText>
            <ThemedText style={[styles.body, { color: theme.mutedText }]}>RSVP without an account. Your email is only used for this event’s details.</ThemedText>

            <View style={[styles.formCard, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText style={[styles.label, { color: theme.mutedText }]}>Name</ThemedText>
              <TextInput value={name} onChangeText={setName} autoComplete="name" placeholder="Your name" placeholderTextColor={theme.mutedText} style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.surface }]} />
              <ThemedText style={[styles.label, { color: theme.mutedText }]}>Email</ThemedText>
              <TextInput value={email} onChangeText={setEmail} autoCapitalize="none" autoComplete="email" keyboardType="email-address" placeholder="you@example.com" placeholderTextColor={theme.mutedText} style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.surface }]} />
              <ThemedText style={[styles.label, { color: theme.mutedText }]}>Note (optional)</ThemedText>
              <TextInput value={note} onChangeText={setNote} multiline numberOfLines={3} placeholder="Anything for the host?" placeholderTextColor={theme.mutedText} style={[styles.textInput, styles.noteInput, { borderColor: theme.border, backgroundColor: theme.surface }]} />
              <Pressable onPress={() => void handleRsvp()} disabled={submitting} style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>{submitting ? "Saving RSVP..." : "Reserve my seat"}</ThemedText>
              </Pressable>
              {feedback ? <StatusPanel title={feedback.message} /> : null}
            </View>

            <View style={[styles.contextCard, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <ThemedText type="subtitle">Origin context</ThemedText>
              <ThemedText style={[styles.body, { color: theme.mutedText }]}>{event.description ?? event.summary}</ThemedText>
              {event.coffee ? <Pressable onPress={() => router.push(`/coffees/${event.coffee?.slug}`)}><ThemedText type="defaultSemiBold">Coffee: {event.coffee.name}</ThemedText></Pressable> : null}
              {event.farm ? <Pressable onPress={() => router.push(`/farms/${event.farm?.slug}`)}><ThemedText type="defaultSemiBold">Farm: {event.farm.name}</ThemedText></Pressable> : null}
              {event.producer ? <Pressable onPress={() => router.push(`/producers/${event.producer?.slug}`)}><ThemedText type="defaultSemiBold">Producer: {event.producer.name}</ThemedText></Pressable> : null}
            </View>
          </View>
        ) : null}
      </DetailScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  secondaryButton: { flex: 1, borderRadius: 18, paddingVertical: 12, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  primaryButton: { borderRadius: 18, paddingVertical: 13, alignItems: "center", borderWidth: StyleSheet.hairlineWidth },
  mediaCard: { borderRadius: 24, overflow: "hidden", borderWidth: StyleSheet.hairlineWidth, gap: 12 },
  mediaFrame: { aspectRatio: 1.35, alignItems: "center", justifyContent: "center", overflow: "hidden" },
  mediaImage: { width: "100%", height: "100%" },
  mediaMeta: { paddingHorizontal: 16, paddingBottom: 16, gap: 6 },
  label: { textTransform: "uppercase", letterSpacing: 1, fontSize: 11 },
  content: { gap: 12 },
  body: { lineHeight: 21 },
  formCard: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 9 },
  textInput: { borderRadius: 18, borderWidth: StyleSheet.hairlineWidth, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  noteInput: { minHeight: 82, textAlignVertical: "top" },
  contextCard: { borderRadius: 24, borderWidth: StyleSheet.hairlineWidth, padding: 16, gap: 10 },
});
