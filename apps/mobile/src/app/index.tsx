import { Redirect } from "expo-router";
import { useStore } from "@/lib/store";
import { LoadingScreen } from "@/components/ui";

export default function Index() {
  const { loading, session } = useStore();
  if (loading) return <LoadingScreen />;
  return <Redirect href={session ? "/dashboard" : "/login"} />;
}
