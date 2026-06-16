"use client";

import { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useStore } from "@/lib/store/store";
import { answerLocally } from "@pocketpilot/core";
import { cn } from "@/lib/utils";

interface Msg {
  role: "user" | "assistant";
  text: string;
}

const SUGGESTIONS = [
  "Can I afford a 1,500 jacket?",
  "What is my biggest expense?",
  "How much will I have by month end?",
  "Am I safe until payday?",
  "How much can I save in 6 months?",
];

export default function AssistantPage() {
  const { data, now } = useStore();
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: `Hi ${data.profile.name}! I'm your PocketPilot assistant. Ask me anything about your money — I read your real transactions.`,
    },
  ]);
  const [input, setInput] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  function ask(question: string) {
    const q = question.trim();
    if (!q) return;
    const answer = answerLocally(data, q, now);
    setMessages((m) => [...m, { role: "user", text: q }, { role: "assistant", text: answer }]);
    setInput("");
    requestAnimationFrame(() => endRef.current?.scrollIntoView({ behavior: "smooth" }));
  }

  return (
    <div className="flex h-[calc(100dvh-9rem)] flex-col">
      <header className="mb-4">
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Sparkles className="size-6 text-primary" /> AI Assistant
        </h1>
        <p className="text-sm text-muted-foreground">Your financial copilot, powered by your own data.</p>
      </header>

      <div className="flex-1 space-y-4 overflow-y-auto pr-1 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn("flex", m.role === "user" ? "justify-end" : "justify-start")}
            >
              <div
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                  m.role === "user"
                    ? "rounded-br-md bg-primary text-primary-foreground"
                    : "rounded-bl-md bg-muted text-foreground",
                )}
              >
                {m.text}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        <div ref={endRef} />
      </div>

      {messages.length <= 1 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => ask(s)}
              className="rounded-full border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(input);
        }}
        className="flex items-center gap-2 border-t pt-3"
      >
        <Input
          placeholder="Ask about your money..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1"
        />
        <Button type="submit" size="icon" className="shrink-0 rounded-full" aria-label="Send">
          <ArrowUp className="size-4" />
        </Button>
      </form>
    </div>
  );
}
