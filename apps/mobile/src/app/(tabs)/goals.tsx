import { useState } from "react";
import { Alert, Modal, Pressable, ScrollView, View, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { computeAllGoals, formatKes, toCents, toKes, type SavingsGoal } from "@pocketpilot/core";
import { useStore } from "@/lib/store";
import { uuidv4 } from "@/lib/uuid";
import { useColors } from "@/lib/theme";
import { Btn, Card, Field, Muted, Title } from "@/components/ui";

const EMOJIS = ["🎯", "🛟", "💻", "📱", "🚗", "✈️", "🏠", "🎓", "💍", "🐷"];

export default function GoalsScreen() {
  const c = useColors();
  const { data, now, upsertGoal, contributeToGoal, deleteGoal } = useStore();
  const goals = computeAllGoals(data.goals, now);

  const [editing, setEditing] = useState<SavingsGoal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [contributeGoal, setContributeGoal] = useState<SavingsGoal | null>(null);

  function openCreate() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(goal: SavingsGoal) {
    setEditing(goal);
    setFormOpen(true);
  }
  function confirmDelete(goal: SavingsGoal) {
    Alert.alert("Delete goal", `Delete "${goal.name}"?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteGoal(goal.id) },
    ]);
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }} edges={["top"]}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 14, paddingBottom: 40 }}>
        <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
          <Title>Savings Goals 🎯</Title>
        </View>
        <Btn label="+ New goal" onPress={openCreate} />

        {goals.length === 0 && (
          <Card>
            <Muted>No goals yet. Create your first savings goal.</Muted>
          </Card>
        )}

        {goals.map(({ goal, progress, remaining, monthsRemaining, suggestedMonthly }) => (
          <Card key={goal.id} style={{ gap: 10 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
              <View style={{ flexDirection: "row", gap: 10, flex: 1 }}>
                <Text style={{ fontSize: 26 }}>{goal.emoji ?? "🎯"}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: c.text, fontWeight: "700", fontSize: 16 }}>{goal.name}</Text>
                  <Muted size={12}>
                    {formatKes(goal.saved, { compact: true })} / {formatKes(goal.target, { compact: true })}
                  </Muted>
                </View>
              </View>
              <View style={{ flexDirection: "row", gap: 14 }}>
                <Pressable onPress={() => openEdit(goal)} hitSlop={8}>
                  <Text style={{ color: c.muted }}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => confirmDelete(goal)} hitSlop={8}>
                  <Text style={{ color: "#ef4444" }}>Delete</Text>
                </Pressable>
              </View>
            </View>

            {/* progress bar */}
            <View style={{ height: 10, borderRadius: 999, backgroundColor: c.border, overflow: "hidden" }}>
              <View style={{ width: `${Math.round(progress * 100)}%`, height: "100%", backgroundColor: c.primary }} />
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Muted size={12}>{Math.round(progress * 100)}% funded</Muted>
              {progress >= 1 ? (
                <Text style={{ color: "#10b981", fontSize: 12, fontWeight: "700" }}>🎉 Reached!</Text>
              ) : (
                <Muted size={12}>{formatKes(remaining, { compact: true })} to go</Muted>
              )}
            </View>

            {suggestedMonthly != null && monthsRemaining != null && progress < 1 && (
              <Muted size={12}>
                Save {formatKes(suggestedMonthly, { compact: true })}/mo to hit this in {monthsRemaining} month
                {monthsRemaining === 1 ? "" : "s"}.
              </Muted>
            )}

            <Btn label="+ Add money" variant="outline" onPress={() => setContributeGoal(goal)} />
          </Card>
        ))}
      </ScrollView>

      <GoalFormModal
        visible={formOpen}
        goal={editing}
        onClose={() => setFormOpen(false)}
        onSave={(g) => {
          upsertGoal(g);
          setFormOpen(false);
        }}
      />

      <ContributeModal
        goal={contributeGoal}
        onClose={() => setContributeGoal(null)}
        onSave={(id, cents) => {
          contributeToGoal(id, cents);
          setContributeGoal(null);
        }}
      />
    </SafeAreaView>
  );
}

function Overlay({ children }: { children: React.ReactNode }) {
  return (
    <View style={{ flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.5)" }}>{children}</View>
  );
}

function GoalFormModal({
  visible,
  goal,
  onClose,
  onSave,
}: {
  visible: boolean;
  goal: SavingsGoal | null;
  onClose: () => void;
  onSave: (goal: SavingsGoal) => void;
}) {
  const c = useColors();
  const [emoji, setEmoji] = useState("🎯");
  const [name, setName] = useState("");
  const [target, setTarget] = useState("");
  const [deadline, setDeadline] = useState("");

  // Re-seed fields each time the modal opens.
  function onShow() {
    setEmoji(goal?.emoji ?? "🎯");
    setName(goal?.name ?? "");
    setTarget(goal ? String(toKes(goal.target)) : "");
    setDeadline(goal?.deadline ? goal.deadline.slice(0, 10) : "");
  }

  function save() {
    const targetValue = Number(target);
    if (!name.trim()) return Alert.alert("Give your goal a name");
    if (!targetValue || targetValue <= 0) return Alert.alert("Enter a target amount");
    const iso = /^\d{4}-\d{2}-\d{2}$/.test(deadline) ? new Date(deadline).toISOString() : undefined;
    onSave({
      id: goal?.id ?? uuidv4(),
      name: name.trim(),
      target: toCents(targetValue),
      saved: goal?.saved ?? 0,
      deadline: iso,
      emoji: emoji || "🎯",
    });
  }

  return (
    <Modal visible={visible} transparent animationType="slide" onShow={onShow} onRequestClose={onClose}>
      <Overlay>
        <View style={{ backgroundColor: c.bg, padding: 20, gap: 14, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <Title>{goal ? "Edit goal" : "New goal"}</Title>

          <Muted size={13}>Icon</Muted>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
            {EMOJIS.map((e) => (
              <Pressable
                key={e}
                onPress={() => setEmoji(e)}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  borderWidth: 1,
                  borderColor: emoji === e ? c.primary : c.border,
                  backgroundColor: emoji === e ? c.tint : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>{e}</Text>
              </Pressable>
            ))}
          </View>

          <Field label="Name" value={name} onChangeText={setName} placeholder="Emergency Fund" />
          <Field label="Target (KSh)" value={target} onChangeText={setTarget} keyboardType="decimal-pad" placeholder="50000" />
          <Field label="Deadline (YYYY-MM-DD, optional)" value={deadline} onChangeText={setDeadline} placeholder="2026-12-31" />

          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Btn label="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Btn label={goal ? "Save" : "Create"} onPress={save} />
            </View>
          </View>
        </View>
      </Overlay>
    </Modal>
  );
}

function ContributeModal({
  goal,
  onClose,
  onSave,
}: {
  goal: SavingsGoal | null;
  onClose: () => void;
  onSave: (id: string, cents: number) => void;
}) {
  const c = useColors();
  const [amount, setAmount] = useState("");

  function save() {
    const value = Number(amount);
    if (!value || value <= 0) return Alert.alert("Enter an amount");
    if (goal) onSave(goal.id, toCents(value));
    setAmount("");
  }

  return (
    <Modal visible={!!goal} transparent animationType="slide" onShow={() => setAmount("")} onRequestClose={onClose}>
      <Overlay>
        <View style={{ backgroundColor: c.bg, padding: 20, gap: 14, borderTopLeftRadius: 24, borderTopRightRadius: 24 }}>
          <Title>
            {goal?.emoji} Add to {goal?.name}
          </Title>
          {goal && (
            <Muted size={13}>
              {formatKes(goal.saved)} saved · {formatKes(Math.max(0, goal.target - goal.saved))} to go
            </Muted>
          )}
          <Field label="Amount (KSh)" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="2000" />
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View style={{ flex: 1 }}>
              <Btn label="Cancel" variant="outline" onPress={onClose} />
            </View>
            <View style={{ flex: 1 }}>
              <Btn label="Add" onPress={save} />
            </View>
          </View>
        </View>
      </Overlay>
    </Modal>
  );
}
