import { useState } from "react";
import { Alert, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { SPEND_CATEGORIES, currentBalance, toCents, type Category, type Direction } from "@pocketpilot/core";
import { useStore } from "@/lib/store";
import { buildSampleMpesaSms, smsListenerAvailable } from "@/lib/sms";
import { useColors } from "@/lib/theme";
import { Btn, Card, Field, Muted, Title } from "@/components/ui";

const EXAMPLE =
  "Confirmed. Ksh135.00 paid to KIPCHIMCHIM ENTERPRISES. on 5/6/26 at 1:30 PM. New M-PESA balance is Ksh7,512.39.";

export default function AddScreen() {
  const c = useColors();
  const { addTransaction, addFromSms, data } = useStore();

  const [sms, setSms] = useState("");
  const [amount, setAmount] = useState("");
  const [merchant, setMerchant] = useState("");
  const [direction, setDirection] = useState<Direction>("out");
  const [category, setCategory] = useState<Category>("Food");

  function importSms() {
    if (addFromSms(sms)) {
      setSms("");
      Alert.alert("Imported", "Transaction added from SMS.");
    } else {
      Alert.alert("Couldn't read that", "Paste a full M-Pesa confirmation message.");
    }
  }

  // Simulate an incoming M-Pesa SMS through the exact path the native
  // listener uses: parseMpesa() -> addTransaction() -> realtime update.
  function simulateIncoming() {
    const msg = buildSampleMpesaSms(currentBalance(data));
    const ok = addFromSms(msg.body);
    Alert.alert(
      ok ? "📩 Incoming M-Pesa SMS detected" : "Parse failed",
      ok ? `Auto-ingested:\n\n${msg.body}` : msg.body,
    );
  }

  function addManual() {
    const value = Number(amount);
    if (!value || value <= 0) return Alert.alert("Enter a valid amount");
    addTransaction({
      amount: toCents(value),
      direction,
      category: direction === "in" ? "Income" : category,
      merchant: merchant.trim() || (direction === "in" ? "Income" : "Unknown"),
      date: new Date().toISOString(),
      source: "manual",
    });
    setAmount("");
    setMerchant("");
    Alert.alert("Added", "Transaction recorded.");
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <Title>Add transaction</Title>

        <Card style={{ gap: 10, borderStyle: "dashed" }}>
          <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>📩 Test the auto-listener</Text>
          <Muted size={12}>
            Simulates an incoming M-Pesa SMS through the same parse → ingest → realtime path the Android
            listener uses. Watch the Dashboard balance & status update live.
          </Muted>
          <Btn label="Simulate incoming SMS" onPress={simulateIncoming} />
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>Paste M-Pesa SMS</Text>
          <Muted size={12}>
            {smsListenerAvailable
              ? "Auto-detection is active on this device."
              : "Auto-detection needs an Android dev build — paste messages here for now."}
          </Muted>
          <Field label="Message" value={sms} onChangeText={setSms} placeholder={EXAMPLE} multiline numberOfLines={4} style={{ minHeight: 90 }} />
          <Btn label="Import from SMS" onPress={importSms} />
        </Card>

        <Card style={{ gap: 12 }}>
          <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>Manual entry</Text>
          <View style={{ flexDirection: "row", gap: 8 }}>
            <View style={{ flex: 1 }}>
              <Btn label="Money out" variant={direction === "out" ? "primary" : "outline"} onPress={() => setDirection("out")} />
            </View>
            <View style={{ flex: 1 }}>
              <Btn label="Money in" variant={direction === "in" ? "primary" : "outline"} onPress={() => setDirection("in")} />
            </View>
          </View>
          <Field label="Amount (KSh)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="160" />
          <Field label={direction === "in" ? "Source" : "Merchant"} value={merchant} onChangeText={setMerchant} placeholder="Mama Oliech, Sacco…" />
          {direction === "out" && (
            <View>
              <Muted size={13}>Category</Muted>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 6 }}>
                {SPEND_CATEGORIES.map((cat) => (
                  <View key={cat}>
                    <Btn label={cat} variant={category === cat ? "primary" : "outline"} onPress={() => setCategory(cat)} />
                  </View>
                ))}
              </View>
            </View>
          )}
          <Btn label="Save transaction" onPress={addManual} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
