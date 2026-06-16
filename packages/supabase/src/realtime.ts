import type { RealtimeChannel } from "@supabase/supabase-js";
import type { TypedSupabaseClient } from "./repository";

export type RealtimeTable = "transactions" | "recurring_expenses" | "savings_goals" | "profiles";

export interface RealtimeEvent {
  table: RealtimeTable;
  eventType: "INSERT" | "UPDATE" | "DELETE";
}

/**
 * Subscribe to all of a user's data changes. Any insert/update/delete on the
 * user's rows invokes `onChange` — the consumer reloads + recalculates.
 * Returns an unsubscribe function.
 */
export function subscribeToUserData(
  client: TypedSupabaseClient,
  userId: string,
  onChange: (event: RealtimeEvent) => void,
): () => void {
  const tables: RealtimeTable[] = ["transactions", "recurring_expenses", "savings_goals", "profiles"];
  const channel: RealtimeChannel = client.channel(`pocketpilot:${userId}`);

  for (const table of tables) {
    const filter = table === "profiles" ? `id=eq.${userId}` : `user_id=eq.${userId}`;
    channel.on(
      "postgres_changes",
      { event: "*", schema: "public", table, filter },
      (payload) => onChange({ table, eventType: payload.eventType as RealtimeEvent["eventType"] }),
    );
  }

  channel.subscribe();
  return () => {
    void client.removeChannel(channel);
  };
}
