import { useCallback, useEffect, useState } from "react";
import { Pressable, ScrollView, StyleSheet, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { useIsFocused } from "@react-navigation/native";

import { cafeAtlasBrand } from "@repo/ui/brand";
import { Colors } from "@/constants/theme";
import { DetailScreenShell } from "@/components/detail-screen-shell";
import { StatusPanel } from "@/components/status-panel";
import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  getMobileSupabaseConfig,
  hydrateMobileSession,
  persistAuthSession,
  signInWithPassword,
  signOutMobileSession,
  signUpWithPassword,
  type MobileAuthSnapshot,
} from "@/lib/supabase-auth";

type FeedbackState =
  | {
      tone: "success" | "error" | "info";
      message: string;
    }
  | null;

export default function AccountScreen() {
  const router = useRouter();
  const isFocused = useIsFocused();
  const colorScheme = useColorScheme() ?? "light";
  const theme = Colors[colorScheme];
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [account, setAccount] = useState<MobileAuthSnapshot | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<FeedbackState>(null);
  const [submitting, setSubmitting] = useState<"signIn" | "signUp" | "signOut" | null>(null);

  const loadAccount = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const nextAccount = await hydrateMobileSession();
      setAccount(nextAccount);
    } catch (nextError) {
      setError(nextError instanceof Error ? nextError.message : "Failed to load the account screen.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isFocused) {
      return;
    }

    void loadAccount();
  }, [isFocused, loadAccount]);

  const handleAuth = useCallback(
    async (mode: "signIn" | "signUp") => {
      const normalizedEmail = email.trim().toLowerCase();
      const secret = password.trim();

      if (!normalizedEmail || !secret) {
        setFeedback({ tone: "error", message: "Enter both an email address and password." });
        return;
      }

      const config = getMobileSupabaseConfig();
      if (!config) {
        setFeedback({
          tone: "error",
          message: "Set the Supabase auth env vars before trying to sign in on mobile.",
        });
        return;
      }

      setSubmitting(mode);
      setFeedback(null);
      setError(null);

      try {
        if (mode === "signIn") {
          const session = await signInWithPassword(normalizedEmail, secret);
          await persistAuthSession(session);
          setAccount({ session, user: session.user });
          setEmail("");
          setPassword("");
          setFeedback({ tone: "success", message: "Signed in and stored the session locally." });
          return;
        }

        const response = await signUpWithPassword(normalizedEmail, secret);
        if (response.session) {
          await persistAuthSession(response.session);
          setAccount({ session: response.session, user: response.session.user });
          setEmail("");
          setPassword("");
          setFeedback({ tone: "success", message: "Account created and signed in." });
          return;
        }

        setFeedback({
          tone: "info",
          message: "Check your inbox for a confirmation email, then return here to sign in.",
        });
      } catch (nextError) {
        setFeedback({
          tone: "error",
          message: nextError instanceof Error ? nextError.message : "Auth request failed.",
        });
      } finally {
        setSubmitting(null);
      }
    },
    [email, password]
  );

  const handleSignOut = useCallback(async () => {
    setSubmitting("signOut");
    setFeedback(null);
    setError(null);

    try {
      await signOutMobileSession(account?.session.access_token);
      setAccount(null);
      setFeedback({ tone: "success", message: "Signed out on this device." });
    } catch (nextError) {
      setFeedback({
        tone: "error",
        message: nextError instanceof Error ? nextError.message : "Failed to sign out.",
      });
    } finally {
      setSubmitting(null);
    }
  }, [account?.session.access_token]);

  if (loading) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusPanel title="Loading account..." loading />
      </ScrollView>
    );
  }

  if (error) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusPanel
          title="Could not load account"
          message={error}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <DetailScreenShell
        loading={false}
        error={null}
        loadingTitle="Loading..."
        errorTitle="Could not load account."
        actions={
          <>
            <Pressable
              onPress={() => router.push("/")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Catalog</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/learn")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">Learn hub</ThemedText>
            </Pressable>
            <Pressable
              onPress={() => router.push("/about")}
              style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
            >
              <ThemedText type="defaultSemiBold">About</ThemedText>
            </Pressable>
            {account ? (
              <Pressable
                onPress={() => void handleSignOut()}
                style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
              >
                <ThemedText type="defaultSemiBold">
                  {submitting === "signOut" ? "Signing out..." : "Sign out"}
                </ThemedText>
              </Pressable>
            ) : null}
          </>
        }
        media={
          <View style={[styles.mediaCard, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}>
            <View style={[styles.mediaFrame, { backgroundColor: theme.surfaceMuted }]}>
              <View style={[styles.mediaGlow, { backgroundColor: theme.accent }]} />
              <View style={[styles.mediaBadge, { backgroundColor: theme.accent }]}>
                <ThemedText type="defaultSemiBold" style={[styles.mediaBadgeText, { color: theme.accentForeground }]}>
                  {cafeAtlasBrand.monogram}
                </ThemedText>
              </View>
            </View>
            <View style={styles.mediaCopy}>
              <ThemedText style={[styles.mediaLabel, { color: theme.mutedText }]}>Mobile auth</ThemedText>
              <ThemedText type="subtitle">{account ? "Session active" : "Sign in to continue"}</ThemedText>
              <ThemedText style={[styles.mediaBody, { color: theme.mutedText }]}>
                {account
                  ? "Your Supabase session is stored locally on this device."
                  : "This screen uses the same Supabase backend as the web app, with secure token storage on device."}
              </ThemedText>
            </View>
          </View>
        }
        title={account ? "Signed in" : "Supabase auth"}
        description={
          account
            ? "Use this screen to confirm the session is alive, inspect the account details, and sign out when you are done."
            : "Sign in with email and password, or create an account if you are starting fresh."
        }
        topStats={[
          { label: "Status", value: account ? "Active" : "Signed out" },
          { label: "Storage", value: "SecureStore" },
        ]}
        bottomStats={[
          { label: "Mode", value: account ? "Session ready" : "Email/password" },
          { label: "Surface", value: "Mobile + web" },
        ]}
      >
        <View style={styles.section}>
          {feedback ? (
            <StatusPanel title={feedback.message} message={feedback.tone === "info" ? "Review the session state above." : undefined} />
          ) : null}

          {account ? (
            <>
              <View style={[styles.detailCard, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                <ThemedText type="defaultSemiBold">Account details</ThemedText>
                <ThemedText style={[styles.detailLine, { color: theme.mutedText }]}>
                  Email: {account.user.email ?? "No email on record"}
                </ThemedText>
                <ThemedText style={[styles.detailLine, { color: theme.mutedText }]}>
                  User ID: {account.user.id}
                </ThemedText>
                <ThemedText style={[styles.detailLine, { color: theme.mutedText }]}>
                  Created: {new Date(account.user.created_at).toLocaleString()}
                </ThemedText>
              </View>

              <View style={[styles.detailCard, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
                <ThemedText type="defaultSemiBold">Signed-in actions</ThemedText>
                <View style={styles.inlineActions}>
                  <Pressable
                    onPress={() => router.push("/")}
                    style={[styles.primaryButton, { backgroundColor: theme.accent, borderColor: theme.accent }]}
                  >
                    <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
                      Open catalog
                    </ThemedText>
                  </Pressable>
                  <Pressable
                    onPress={() => void handleSignOut()}
                    style={[styles.secondaryButton, { borderColor: theme.border, backgroundColor: theme.surfaceStrong }]}
                  >
                    <ThemedText type="defaultSemiBold">
                      {submitting === "signOut" ? "Signing out..." : "Sign out"}
                    </ThemedText>
                  </Pressable>
                </View>
              </View>
            </>
          ) : (
            <View style={[styles.authCard, { borderColor: theme.border, backgroundColor: theme.surfaceMuted }]}>
              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: theme.mutedText }]}>Email</ThemedText>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  autoComplete="email"
                  keyboardType="email-address"
                  placeholder="you@example.com"
                  placeholderTextColor={theme.mutedText}
                  style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.surface }]}
                />
              </View>

              <View style={styles.fieldGroup}>
                <ThemedText style={[styles.fieldLabel, { color: theme.mutedText }]}>Password</ThemedText>
                <TextInput
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  secureTextEntry
                  placeholder="Your password"
                  placeholderTextColor={theme.mutedText}
                  style={[styles.textInput, { borderColor: theme.border, backgroundColor: theme.surface }]}
                />
              </View>

              <View style={styles.inlineActions}>
                <Pressable
                  onPress={() => void handleAuth("signIn")}
                  style={[
                    styles.primaryButton,
                    { backgroundColor: theme.accent, borderColor: theme.accent },
                  ]}
                  disabled={submitting !== null}
                >
                  <ThemedText type="defaultSemiBold" style={{ color: theme.accentForeground }}>
                    {submitting === "signIn" ? "Signing in..." : "Sign in"}
                  </ThemedText>
                </Pressable>
                <Pressable
                  onPress={() => void handleAuth("signUp")}
                  style={[
                    styles.secondaryButton,
                    { borderColor: theme.border, backgroundColor: theme.surfaceStrong },
                  ]}
                  disabled={submitting !== null}
                >
                  <ThemedText type="defaultSemiBold">
                    {submitting === "signUp" ? "Creating..." : "Create account"}
                  </ThemedText>
                </Pressable>
              </View>
            </View>
          )}
        </View>
      </DetailScreenShell>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
    borderWidth: StyleSheet.hairlineWidth,
  },
  mediaCard: {
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    gap: 12,
  },
  mediaFrame: {
    aspectRatio: 1.35,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  mediaGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 999,
    opacity: 0.2,
  },
  mediaBadge: {
    width: 92,
    height: 92,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
  },
  mediaBadgeText: {
    fontSize: 28,
  },
  mediaCopy: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  mediaLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  mediaBody: {
    lineHeight: 20,
  },
  section: {
    gap: 12,
  },
  detailCard: {
    borderRadius: 22,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 8,
  },
  detailLine: {
    lineHeight: 20,
  },
  authCard: {
    borderRadius: 24,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 16,
    gap: 14,
  },
  fieldGroup: {
    gap: 8,
  },
  fieldLabel: {
    textTransform: "uppercase",
    letterSpacing: 1,
    fontSize: 11,
  },
  textInput: {
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inlineActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
});
