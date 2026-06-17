import { Platform } from "react-native";

/**
 * M-Pesa SMS auto-ingestion.
 *
 * Reading incoming SMS is **Android-only** and requires a custom dev build
 * (Expo Go cannot grant RECEIVE_SMS). To enable it:
 *   1. `pnpm --filter @pocketpilot/mobile add react-native-android-sms-listener`
 *   2. Add the RECEIVE_SMS / READ_SMS permissions via a config plugin (or
 *      android.permissions in app.json) and build with EAS / `expo run:android`.
 *
 * Until then this module reports `available = false` and the app falls back to
 * the manual + paste-SMS flows, which work everywhere (including iOS).
 */

export interface SmsMessage {
  body: string;
  sender?: string;
}

type Listener = (msg: SmsMessage) => void;

// Only Safaricom M-PESA confirmations should be ingested.
const MPESA_SENDER = /MPESA|M-PESA|SAFARICOM/i;
const MPESA_BODY = /M-?PESA|Confirmed\.\s*Ksh/i;

export function isMpesaSms(msg: SmsMessage): boolean {
  return MPESA_SENDER.test(msg.sender ?? "") || MPESA_BODY.test(msg.body);
}

/** Try to load the native SMS listener (present only in a custom dev build). */
function loadNativeListener(): { addListener: (cb: (m: { body: string; originatingAddress?: string }) => void) => { remove: () => void } } | null {
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    return require("react-native-android-sms-listener");
  } catch {
    return null;
  }
}

export const smsListenerAvailable = Platform.OS === "android" && loadNativeListener() !== null;

const SAMPLE_PAYEES: { merchant: string; kes: number }[] = [
  { merchant: "MAMA OLIECH LUNCH", kes: 180 },
  { merchant: "EMBASSAVA SACCO", kes: 100 },
  { merchant: "NAIVAS SUPERMARKET", kes: 1340 },
  { merchant: "KPLC PREPAID", kes: 500 },
  { merchant: "JAVA HOUSE", kes: 760 },
  { merchant: "SHELL KILIMANI", kes: 2000 },
];

function randomCode(): string {
  const a = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const n = "0123456789";
  const pick = (s: string, k: number) =>
    Array.from({ length: k }, () => s[Math.floor(Math.random() * s.length)]).join("");
  return pick(a, 3) + pick(a + n, 7);
}

/**
 * Build a realistic M-Pesa "paid to" SMS whose new balance is derived from the
 * caller's current balance — used to simulate an incoming message in dev,
 * exercising the exact same parse → ingest path as the native listener.
 */
export function buildSampleMpesaSms(currentBalanceCents: number): SmsMessage {
  const payee = SAMPLE_PAYEES[Math.floor(Math.random() * SAMPLE_PAYEES.length)];
  const amountCents = payee.kes * 100;
  const newBalanceCents = Math.max(0, currentBalanceCents - amountCents);
  const now = new Date();
  const date = `${now.getDate()}/${now.getMonth() + 1}/${String(now.getFullYear()).slice(2)}`;
  const hours = now.getHours() % 12 || 12;
  const ampm = now.getHours() < 12 ? "AM" : "PM";
  const time = `${hours}:${String(now.getMinutes()).padStart(2, "0")} ${ampm}`;
  const fmt = (c: number) => (c / 100).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const body = `${randomCode()} Confirmed. Ksh${fmt(amountCents)} paid to ${payee.merchant}. on ${date} at ${time}. New M-PESA balance is Ksh${fmt(newBalanceCents)}. Transaction cost, Ksh0.00.`;
  return { body, sender: "MPESA" };
}

/**
 * Start listening for incoming M-Pesa SMS. Returns an unsubscribe function.
 * No-ops (returns a noop unsubscribe) when unavailable.
 */
export function startSmsListener(onMpesa: Listener): () => void {
  if (Platform.OS !== "android") return () => {};
  const native = loadNativeListener();
  if (!native) return () => {};

  const subscription = native.addListener((m) => {
    const msg: SmsMessage = { body: m.body, sender: m.originatingAddress };
    if (isMpesaSms(msg)) onMpesa(msg);
  });
  return () => subscription.remove();
}
