import { useColorScheme } from "react-native";
import type { SurvivalStatus } from "@pocketpilot/core";

export interface Palette {
  bg: string;
  card: string;
  text: string;
  muted: string;
  border: string;
  primary: string;
  primaryText: string;
  tint: string;
}

const dark: Palette = {
  bg: "#0a0a0a",
  card: "#171717",
  text: "#fafafa",
  muted: "#a1a1aa",
  border: "#262626",
  primary: "#34d399",
  primaryText: "#04231a",
  tint: "#10241d",
};

const light: Palette = {
  bg: "#f7f8fa",
  card: "#ffffff",
  text: "#0a0a0a",
  muted: "#6b7280",
  border: "#e5e7eb",
  primary: "#059669",
  primaryText: "#ffffff",
  tint: "#ecfdf5",
};

export function useColors(): Palette {
  return useColorScheme() === "light" ? light : dark;
}

export const STATUS_COLORS: Record<SurvivalStatus, string> = {
  Safe: "#10b981",
  Comfortable: "#22c55e",
  Warning: "#f59e0b",
  Critical: "#ef4444",
};

export const STATUS_EMOJI: Record<SurvivalStatus, string> = {
  Safe: "🟢",
  Comfortable: "🟩",
  Warning: "🟠",
  Critical: "🔴",
};
