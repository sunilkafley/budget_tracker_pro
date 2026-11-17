import React from "react";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radii, spacing } from "../theme";

export function Card({ children }: { children: React.ReactNode }) {
  return <View style={ui.card}>{children}</View>;
}

export function ActionButton({ title, onPress, variant = "primary", disabled = false, label }: {
  title: string; onPress: () => void; variant?: "primary" | "quiet" | "danger"; disabled?: boolean; label?: string;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label ?? title} accessibilityState={{ disabled }} disabled={disabled} onPress={onPress}
      style={({ pressed }) => [ui.button, variant !== "primary" && ui.quietButton, (pressed || disabled) && ui.dim]}>
      <Text style={[ui.buttonText, variant === "quiet" && ui.quietText, variant === "danger" && ui.dangerText]}>{title}</Text>
    </Pressable>
  );
}

export function SectionHeading({ title, action, onPress }: { title: string; action?: string; onPress?: () => void }) {
  return <View style={ui.sectionHeading}><Text accessibilityRole="header" style={ui.sectionTitle}>{title}</Text>
    {action && onPress && <Pressable accessibilityRole="button" onPress={onPress} style={ui.sectionAction}><Text style={ui.sectionActionText}>{action}</Text></Pressable>}</View>;
}

export function LoadState({ loading, error, empty, onRetry }: {
  loading: boolean; error?: string; empty?: string; onRetry: () => void;
}) {
  return <Card>{loading ? <><ActivityIndicator accessibilityLabel="Loading" /><Text style={ui.body}>Loading your latest data...</Text></> : error ?
    <View accessibilityLiveRegion="polite"><Text style={ui.error}>{error}</Text><ActionButton title="Try again" onPress={onRetry} variant="quiet" /></View> :
    <Text style={ui.body}>{empty}</Text>}</Card>;
}

export const ui = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: radii.card, padding: spacing.medium, borderWidth: 1, borderColor: colors.border, marginBottom: 12 },
  button: { minHeight: 48, paddingHorizontal: 16, paddingVertical: 12, justifyContent: "center", alignItems: "center", borderRadius: radii.control, backgroundColor: colors.primary },
  quietButton: { backgroundColor: colors.background },
  buttonText: { color: colors.surface, fontSize: 14, fontWeight: "600", textAlign: "center" },
  quietText: { color: colors.primaryDark }, dangerText: { color: colors.danger }, dim: { opacity: 0.6 },
  sectionHeading: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 8, marginTop: 16, marginBottom: 6, flexWrap: "wrap" },
  sectionTitle: { color: colors.text, fontSize: 16, fontWeight: "700", flexShrink: 1 },
  sectionAction: { minHeight: 44, justifyContent: "center", paddingLeft: 8 },
  sectionActionText: { color: colors.primary, fontSize: 13 },
  body: { color: colors.muted, fontSize: 14, lineHeight: 21 },
  error: { color: colors.danger, fontSize: 14, lineHeight: 21, marginBottom: 8 },
});
