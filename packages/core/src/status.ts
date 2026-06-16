import type { SurvivalStatus } from "./finance/survival";

export interface StatusMeta {
  label: SurvivalStatus;
  emoji: string;
  /** CSS color token. */
  color: string;
  /** Tailwind text class. */
  text: string;
  /** Tailwind background tint class. */
  tint: string;
  blurb: string;
}

export const STATUS_META: Record<SurvivalStatus, StatusMeta> = {
  Safe: {
    label: "Safe",
    emoji: "🟢",
    color: "var(--safe)",
    text: "text-[color:var(--safe)]",
    tint: "bg-[color:var(--safe)]/10",
    blurb: "You're comfortably on track to reach payday.",
  },
  Comfortable: {
    label: "Comfortable",
    emoji: "🟩",
    color: "var(--comfortable)",
    text: "text-[color:var(--comfortable)]",
    tint: "bg-[color:var(--comfortable)]/10",
    blurb: "You'll make it, with a little room to spare.",
  },
  Warning: {
    label: "Warning",
    emoji: "🟠",
    color: "var(--warning)",
    text: "text-[color:var(--warning)]",
    tint: "bg-[color:var(--warning)]/10",
    blurb: "Tighten spending — it's getting close.",
  },
  Critical: {
    label: "Critical",
    emoji: "🔴",
    color: "var(--critical)",
    text: "text-[color:var(--critical)]",
    tint: "bg-[color:var(--critical)]/10",
    blurb: "At this rate you'll run out before payday.",
  },
};

/** Position 0..1 of a status on the meter (Critical -> Safe). */
export const STATUS_ORDER: SurvivalStatus[] = ["Critical", "Warning", "Comfortable", "Safe"];
