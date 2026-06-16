"use client";

import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect } from "react";
import { formatKes } from "@/lib/money";

interface Props {
  /** Value in cents. */
  cents: number;
  className?: string;
  compact?: boolean;
  decimals?: boolean;
  duration?: number;
}

/** Smoothly counts up to a KES amount. */
export function AnimatedKes({ cents, className, compact, decimals = true, duration = 0.8 }: Props) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => formatKes(Math.round(v), { compact, decimals }));

  useEffect(() => {
    const controls = animate(mv, cents, { duration, ease: "easeOut" });
    return controls.stop;
  }, [cents, mv, duration]);

  return <motion.span className={className}>{text}</motion.span>;
}

export function AnimatedInt({ value, className, suffix = "" }: { value: number; className?: string; suffix?: string }) {
  const mv = useMotionValue(0);
  const text = useTransform(mv, (v) => `${Math.round(v)}${suffix}`);
  useEffect(() => {
    const controls = animate(mv, value, { duration: 0.8, ease: "easeOut" });
    return controls.stop;
  }, [value, mv]);
  return <motion.span className={className}>{text}</motion.span>;
}
