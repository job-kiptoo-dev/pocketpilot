import { streamText, tool, stepCountIs } from "ai";
import { z } from "zod";
import type { AppData } from "@pocketpilot/core";
import { answerLocally, formatKes, simulatePurchase, toCents } from "@pocketpilot/core";
import { AI_MODEL, isAiConfigured } from "@/lib/ai/config";
import { financialSnapshot } from "@/lib/ai/snapshot";

export const maxDuration = 30;

type ChatMessage = { role: "user" | "assistant"; content: string };

const EMPTY: AppData = { profile: { name: "", payday: 1, monthlyIncome: 0 }, transactions: [], recurring: [], goals: [], accounts: [] };

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[]; data?: AppData };
  try {
    body = (await req.json()) as { messages?: ChatMessage[]; data?: AppData };
  } catch {
    return new Response("Invalid request body.", { status: 400 });
  }
  const messages = (body.messages ?? []).filter((m) => m && typeof m.content === "string");
  const data = body.data ?? EMPTY;
  const now = new Date();
  const lastUser = [...messages].reverse().find((m) => m.role === "user")?.content ?? "";

  // No gateway key (or OIDC) -> serve the offline rule engine as plain text.
  if (!isAiConfigured()) {
    return new Response(answerLocally(data, lastUser, now), {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const system = [
    "You are PocketPilot, a warm, concise personal-finance assistant for a Kenyan M-Pesa user.",
    "Always answer in Kenyan Shillings (KSh). Keep replies to 2-4 short sentences, practical and encouraging.",
    "Use the simulatePurchase tool whenever the user asks about buying or spending a specific amount.",
    "Base every answer on the snapshot below — do not invent numbers.",
    "",
    "CURRENT FINANCIAL SNAPSHOT:",
    financialSnapshot(data, now),
  ].join("\n");

  const result = streamText({
    model: AI_MODEL,
    system,
    messages,
    stopWhen: stepCountIs(5),
    tools: {
      simulatePurchase: tool({
        description: "Simulate spending a one-off amount now and see the impact on balance and payday safety.",
        inputSchema: z.object({
          amountKes: z.number().describe("The purchase amount in Kenyan Shillings"),
          label: z.string().optional().describe("What the purchase is for"),
        }),
        execute: async ({ amountKes, label }) => {
          const sim = simulatePurchase(data, toCents(amountKes), now, label);
          return {
            balanceBefore: formatKes(sim.balanceBefore),
            balanceAfter: formatKes(sim.balanceAfter),
            statusBefore: sim.statusBefore,
            statusAfter: sim.statusAfter,
            expectedAtPayday: formatKes(sim.expectedAtPaydayAfter),
            stillSafe: sim.stillSafe,
            verdict: sim.verdict,
          };
        },
      }),
    },
  });

  return result.toTextStreamResponse();
}
