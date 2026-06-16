import type { ReactNode } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
  type ViewProps,
} from "react-native";
import { useColors, type Palette } from "@/lib/theme";

export function Card({ children, style }: { children: ReactNode; style?: ViewProps["style"] }) {
  const c = useColors();
  return (
    <View style={[{ backgroundColor: c.card, borderColor: c.border }, styles.card, style]}>{children}</View>
  );
}

export function Btn({
  label,
  onPress,
  variant = "primary",
  disabled,
}: {
  label: string;
  onPress: () => void;
  variant?: "primary" | "outline";
  disabled?: boolean;
}) {
  const c = useColors();
  const isPrimary = variant === "primary";
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btn,
        {
          backgroundColor: isPrimary ? c.primary : "transparent",
          borderColor: isPrimary ? c.primary : c.border,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
      ]}
    >
      <Text style={[styles.btnText, { color: isPrimary ? c.primaryText : c.text }]}>{label}</Text>
    </Pressable>
  );
}

export function Field({ label, style, ...props }: { label: string } & TextInputProps) {
  const c = useColors();
  return (
    <View style={{ gap: 6 }}>
      <Text style={{ color: c.muted, fontSize: 13, fontWeight: "600" }}>{label}</Text>
      <TextInput
        placeholderTextColor={c.muted}
        style={[styles.input, { color: c.text, borderColor: c.border, backgroundColor: c.bg }, style]}
        {...props}
      />
    </View>
  );
}

export function Pill({ text, color }: { text: string; color: string }) {
  return (
    <View style={[styles.pill, { backgroundColor: color + "22" }]}>
      <Text style={{ color, fontWeight: "700", fontSize: 12 }}>{text}</Text>
    </View>
  );
}

export function Muted({ children, size = 13 }: { children: ReactNode; size?: number }) {
  const c = useColors();
  return <Text style={{ color: c.muted, fontSize: size }}>{children}</Text>;
}

export function Title({ children }: { children: ReactNode }) {
  const c = useColors();
  return <Text style={{ color: c.text, fontSize: 24, fontWeight: "800" }}>{children}</Text>;
}

export function LoadingScreen() {
  const c = useColors();
  return (
    <View style={[styles.center, { backgroundColor: c.bg }]}>
      <ActivityIndicator color={c.primary} size="large" />
    </View>
  );
}

export function makeStyles(c: Palette) {
  return c;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 20, padding: 18 },
  btn: { borderWidth: 1, borderRadius: 14, paddingVertical: 13, alignItems: "center", justifyContent: "center" },
  btnText: { fontWeight: "700", fontSize: 15 },
  input: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, fontSize: 16 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: "flex-start" },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
});
