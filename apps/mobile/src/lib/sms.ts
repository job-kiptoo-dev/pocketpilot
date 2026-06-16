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
