import { useState } from "react";
import { Alert, View } from "react-native";
import { Redirect, useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { useStore } from "@/lib/store";
import { getSupabase } from "@/lib/supabase";
import { useColors } from "@/lib/theme";
import { Btn, Card, Field, LoadingScreen, Muted, Title } from "@/components/ui";

export default function Login() {
  const c = useColors();
  const router = useRouter();
  const { session, loading, configured } = useStore();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  if (loading) return <LoadingScreen />;
  if (session) return <Redirect href="/dashboard" />;

  async function submit() {
    const supabase = getSupabase();
    if (!supabase) return;
    setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { name: name || email.split("@")[0] } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
      router.replace("/dashboard");
    } catch (err) {
      Alert.alert("Authentication failed", err instanceof Error ? err.message : "Try again");
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
      <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 20 }}>
        <View style={{ alignItems: "center", gap: 6 }}>
          <Title>PocketPilot</Title>
          <Muted>Your M-Pesa money, watched live.</Muted>
        </View>

        {!configured ? (
          <Card>
            <Muted>
              Supabase is not configured. Set EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY in
              apps/mobile/.env and restart.
            </Muted>
          </Card>
        ) : (
          <Card style={{ gap: 14 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Btn label="Sign in" variant={mode === "signin" ? "primary" : "outline"} onPress={() => setMode("signin")} />
              </View>
              <View style={{ flex: 1 }}>
                <Btn label="Sign up" variant={mode === "signup" ? "primary" : "outline"} onPress={() => setMode("signup")} />
              </View>
            </View>

            {mode === "signup" && <Field label="Name" value={name} onChangeText={setName} placeholder="Brian" />}
            <Field
              label="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              placeholder="you@example.com"
            />
            <Field label="Password" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />
            <Btn label={busy ? "Please wait…" : mode === "signin" ? "Sign in" : "Create account"} onPress={submit} disabled={busy} />
          </Card>
        )}
      </View>
    </SafeAreaView>
  );
}
