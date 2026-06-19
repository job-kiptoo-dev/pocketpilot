import type { AppData } from "../types";
import { computeForecast } from "./forecast";
import { formatKes } from "../money";

/**
 * Month-end safety buffer — the cash you want left over when the month closes,
 * before the next payday tops you up. Defaults reflect the user's plan:
 * KSh 2,500 is the floor, KSh 5,000 is comfortable.
 */
export const BUFFER_MIN = 250_000; // KSh 2,500 in cents
export const BUFFER_PREFERRED = 500_000; // KSh 5,000 in cents

export type BufferLevel = "healthy" | "tight" | "below-minimum" | "negative";

export interface BufferTargets {
  min: number;
  preferred: number;
}

export interface BufferStatus {
  /** Projected balance on the last day of the month (cents, may be negative). */
  projectedEndBalance: number;
  min: number;
  preferred: number;
  level: BufferLevel;
  /** Shortfall against the preferred target (cents; 0 when met). */
  shortfallToPreferred: number;
  /** Shortfall against the minimum target (cents; 0 when met). */
  shortfallToMinimum: number;
  /** Daily cut from now to month end that would close the minimum shortfall (cents). */
  dailyCutToMinimum: number;
  message: string;
}

/**
 * Where the projected month-end balance lands relative to the safety buffer.
 * Pure — the UI decides how loudly to surface it.
 */
export function computeBuffer(
  data: AppData,
  now: Date = new Date(),
  targets: BufferTargets = { min: BUFFER_MIN, preferred: BUFFER_PREFERRED },
): BufferStatus {
  const forecast = computeForecast(data, now);
  const projected = forecast.projectedEndBalance;
  const { min, preferred } = targets;

  const shortfallToPreferred = Math.max(0, preferred - projected);
  const shortfallToMinimum = Math.max(0, min - projected);

  let level: BufferLevel;
  if (projected < 0) level = "negative";
  else if (projected < min) level = "below-minimum";
  else if (projected < preferred) level = "tight";
  else level = "healthy";

  const days = Math.max(1, forecast.daysRemaining);
  const dailyCutToMinimum = Math.ceil(shortfallToMinimum / days);

  return {
    projectedEndBalance: projected,
    min,
    preferred,
    level,
    shortfallToPreferred,
    shortfallToMinimum,
    dailyCutToMinimum,
    message: bufferMessage(level, { projected, min, preferred, shortfallToMinimum, dailyCutToMinimum }),
  };
}

function bufferMessage(
  level: BufferLevel,
  ctx: { projected: number; min: number; preferred: number; shortfallToMinimum: number; dailyCutToMinimum: number },
): string {
  const proj = formatKes(ctx.projected, { decimals: false });
  switch (level) {
    case "negative":
      return `You're on track to run out before month end (projected ${proj}). Cut about ${formatKes(ctx.dailyCutToMinimum, { decimals: false })}/day to rebuild a safety buffer.`;
    case "below-minimum":
      return `Projected month-end balance is ${proj}, below your ${formatKes(ctx.min, { decimals: false })} safety floor. Trim ~${formatKes(ctx.dailyCutToMinimum, { decimals: false })}/day to get back above it.`;
    case "tight":
      return `You'll end the month around ${proj} — covered, but under your ${formatKes(ctx.preferred, { decimals: false })} comfort buffer. A little restraint keeps you cushioned.`;
    case "healthy":
      return `Comfortable: you're projected to keep ${proj} as a buffer into next month. Nice work.`;
  }
}
