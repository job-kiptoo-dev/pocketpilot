import { Pressable, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { computeForecast, computeHealth, computeSurvival, formatKes } from "@pocketpilot/core";
import { useStore } from "@/lib/store";
import { STATUS_COLORS, STATUS_EMOJI, useColors } from "@/lib/theme";
import { Card, Muted, Pill, Title } from "@/components/ui";

export default function Dashboard() {
  const c = useColors();
  const { data, now, live, signOut } = useStore();
  const health = computeHealth(data, now);
  const survival = computeSurvival(data, now);
  const forecast = computeForecast(data, now);
  const statusColor = STATUS_COLORS[survival.status];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 32 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <View>
            <Muted>Welcome back</Muted>
            <Title>{data.profile.name || "there"} 👋</Title>
          </View>
          <View style={{ alignItems: "flex-end", gap: 6 }}>
            <Pill text={live ? "● Live" : "○ Offline"} color={live ? STATUS_COLORS.Safe : c.muted} />
            <Pressable onPress={signOut}>
              <Text style={{ color: c.muted, fontSize: 12 }}>Sign out</Text>
            </Pressable>
          </View>
        </View>

        {/* Balance */}
        <Card style={{ backgroundColor: c.primary, borderColor: c.primary }}>
          <Text style={{ color: c.primaryText, opacity: 0.9, fontWeight: "600" }}>Current M-Pesa Balance</Text>
          <Text style={{ color: c.primaryText, fontSize: 36, fontWeight: "800", marginTop: 2 }}>
            {formatKes(health.balance)}
          </Text>
          <Text style={{ color: c.primaryText, opacity: 0.9, marginTop: 6 }}>
            {STATUS_EMOJI[survival.status]} {survival.status} · {formatKes(health.burnRate, { decimals: false })}/day burn
          </Text>
        </Card>

        {/* Survival status */}
        <Card style={{ backgroundColor: statusColor + "1A", borderColor: statusColor + "55" }}>
          <Muted>Survival Mode</Muted>
          <Text style={{ color: statusColor, fontSize: 22, fontWeight: "800", marginTop: 2 }}>
            {STATUS_EMOJI[survival.status]} {survival.status}
          </Text>
          <Muted>
            {survival.daysToPayday} days to payday · balance lasts {survival.daysMoneyLasts} days
          </Muted>
        </Card>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 10 }}>
          <Stat label="Safe / day" value={formatKes(survival.safeDailyAllowance, { compact: true, decimals: false })} />
          <Stat label="At payday" value={formatKes(survival.expectedBalanceAtPayday, { compact: true, decimals: false })} />
          <Stat label="Month end" value={formatKes(forecast.projectedEndBalance, { compact: true, decimals: false })} />
        </View>

        {/* Recent */}
        <Card style={{ gap: 12 }}>
          <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>Recent activity</Text>
          {data.transactions.slice(0, 8).map((t) => (
            <View key={t.id} style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <View style={{ flex: 1 }}>
                <Text style={{ color: c.text, fontWeight: "600" }} numberOfLines={1}>
                  {t.merchant}
                </Text>
                <Muted size={12}>{t.category}</Muted>
              </View>
              <Text style={{ color: t.direction === "in" ? STATUS_COLORS.Safe : c.text, fontWeight: "700" }}>
                {t.direction === "in" ? "+" : "−"}
                {formatKes(t.amount)}
              </Text>
            </View>
          ))}
          {data.transactions.length === 0 && <Muted>No transactions yet — add one from the ➕ tab.</Muted>}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const c = useColors();
  return (
    <Card style={{ flex: 1, padding: 12 }}>
      <Muted size={12}>{label}</Muted>
      <Text style={{ color: c.text, fontSize: 16, fontWeight: "800", marginTop: 2 }}>{value}</Text>
    </Card>
  );
}
