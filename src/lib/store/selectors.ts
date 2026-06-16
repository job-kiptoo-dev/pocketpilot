"use client";

import { useMemo } from "react";
import { useStore } from "./store";
import { computeHealth } from "@/lib/finance/health";
import { computeForecast } from "@/lib/finance/forecast";
import { computeSurvival } from "@/lib/finance/survival";
import { computeAllGoals } from "@/lib/finance/savings";
import { simulatePurchase } from "@/lib/finance/simulator";

export function useHealth() {
  const { data, now } = useStore();
  return useMemo(() => computeHealth(data, now), [data, now]);
}

export function useForecast() {
  const { data, now } = useStore();
  return useMemo(() => computeForecast(data, now), [data, now]);
}

export function useSurvival() {
  const { data, now } = useStore();
  return useMemo(() => computeSurvival(data, now), [data, now]);
}

export function useGoals() {
  const { data, now } = useStore();
  return useMemo(() => computeAllGoals(data.goals, now), [data, now]);
}

export function useSimulation(amountCents: number, label?: string) {
  const { data, now } = useStore();
  return useMemo(
    () => (amountCents > 0 ? simulatePurchase(data, amountCents, now, label) : null),
    [data, now, amountCents, label],
  );
}
