import type { Category } from "./types";

export const CATEGORIES: Category[] = [
  "Food",
  "Transport",
  "Rent",
  "Entertainment",
  "Savings",
  "Airtime",
  "Data Bundles",
  "Income",
  "Miscellaneous",
];

// Spendable categories shown in the manual-add picker (excludes Income).
export const SPEND_CATEGORIES: Category[] = CATEGORIES.filter((c) => c !== "Income");

export interface CategoryMeta {
  emoji: string;
  /** Tailwind-friendly chart color token (var(--chart-N)). */
  color: string;
}

export const CATEGORY_META: Record<Category, CategoryMeta> = {
  Food: { emoji: "🍲", color: "var(--chart-1)" },
  Transport: { emoji: "🚌", color: "var(--chart-2)" },
  Rent: { emoji: "🏠", color: "var(--chart-4)" },
  Entertainment: { emoji: "🎬", color: "var(--chart-5)" },
  Savings: { emoji: "🐷", color: "var(--chart-1)" },
  Airtime: { emoji: "📞", color: "var(--chart-3)" },
  "Data Bundles": { emoji: "📶", color: "var(--chart-2)" },
  Income: { emoji: "💰", color: "var(--chart-1)" },
  Miscellaneous: { emoji: "🛍️", color: "var(--chart-3)" },
};

/** Stable color used for charts so the same category always gets the same hue. */
export function categoryColor(category: Category): string {
  return CATEGORY_META[category].color;
}
