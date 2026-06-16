import "react-native-url-polyfill/auto";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { createSupabaseClient, type TypedSupabaseClient } from "@pocketpilot/supabase";

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url && anonKey);

let client: TypedSupabaseClient | null = null;

/**
 * Lazily create the Supabase client. Created on first use (in the browser /
 * native runtime) rather than at import time, so it never runs during Expo
 * Router's Node route-scan (where `window` is undefined). On web it uses the
 * default localStorage; on native it persists the session in AsyncStorage.
 */
export function getSupabase(): TypedSupabaseClient | null {
  if (!supabaseConfigured) return null;
  if (client) return client;
  client = createSupabaseClient(url as string, anonKey as string, {
    auth: {
      storage: Platform.OS === "web" ? undefined : AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  });
  return client;
}
