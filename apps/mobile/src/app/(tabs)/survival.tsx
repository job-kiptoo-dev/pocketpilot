import { ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { computeSurvival, formatKes } from "@pocketpilot/core";
import { useStore } from "@/lib/store";
import { STATUS_COLORS, STATUS_EMOJI, useColors } from "@/lib/theme";
import { Card, Muted, Title } from "@/components/ui";

export default function SurvivalScreen() {
  const c = useColors();
  const { data, now } = useStore();
  const s = computeSurvival(data, now);
  const color = STATUS_COLORS[s.status];
  // Meter fill: 2x runway = full.
  const fill = Math.max(0.04, Math.min(1, s.daysMoneyLasts / s.daysToPayday / 2));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <Title>Survival Mode 🛡️</Title>
        <Muted>Are you safe until payday?</Muted>

        <Card style={{ backgroundColor: color + "1A", borderColor: color + "55" }}>
          <Muted>Your status</Muted>
          <Text style={{ color, fontSize: 34, fontWeight: "800" }}>
            {STATUS_EMOJI[s.status]} {s.status}
          </Text>
          <View style={{ height: 12, borderRadius: 999, backgroundColor: c.border, marginTop: 14, overflow: "hidden" }}>
            <View style={{ width: `${fill * 100}%`, height: "100%", backgroundColor: color, borderRadius: 999 }} />
          </View>
          <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 6 }}>
            <Muted size={11}>Runs out</Muted>
            <Muted size={11}>Payday</Muted>
          </View>
        </Card>

        <View style={{ flexDirection: "row", gap: 10 }}>
          <Metric label="Days to payday" value={`${s.daysToPayday}`} />
          <Metric label="Confidence" value={`${s.confidence}%`} />
        </View>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Metric label="Balance at payday" value={formatKes(s.expectedBalanceAtPayday, { compact: true, decimals: false })} />
          <Metric label="Safe / day" value={formatKes(s.safeDailyAllowance, { compact: true, decimals: false })} />
        </View>

        <Card style={{ gap: 10 }}>
          <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>💡 Recommendations</Text>
          {s.recommendations.map((r, i) => (
            <View key={i} style={{ flexDirection: "row", gap: 8 }}>
              <Text style={{ color: c.primary }}>•</Text>
              <Text style={{ color: c.text, flex: 1 }}>{r}</Text>
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <Card style={{ flex: 1, padding: 14 }}>
      <Muted size={12}>{label}</Muted>
      <Text style={{ color: c.text, fontSize: 18, fontWeight: "800", marginTop: 2 }}>{value}</Text>
    </Card>
  );
}
