import { Text } from "react-native";
import { Redirect, Tabs } from "expo-router";
import { useStore } from "@/lib/store";
import { useColors } from "@/lib/theme";
import { LoadingScreen } from "@/components/ui";

function TabIcon({ emoji, focused }: { emoji: string; focused: boolean }) {
  return <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>{emoji}</Text>;
}

export default function TabsLayout() {
  const c = useColors();
  const { loading, session } = useStore();

  if (loading) return <LoadingScreen />;
  if (!session) return <Redirect href="/login" />;

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: c.primary,
        tabBarInactiveTintColor: c.muted,
        tabBarStyle: { backgroundColor: c.card, borderTopColor: c.border },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ title: "Dashboard", tabBarIcon: ({ focused }) => <TabIcon emoji="📊" focused={focused} /> }}
      />
      <Tabs.Screen
        name="add"
        options={{ title: "Add", tabBarIcon: ({ focused }) => <TabIcon emoji="➕" focused={focused} /> }}
      />
      <Tabs.Screen
        name="survival"
        options={{ title: "Survival", tabBarIcon: ({ focused }) => <TabIcon emoji="🛡️" focused={focused} /> }}
      />
    </Tabs>
  );
}
