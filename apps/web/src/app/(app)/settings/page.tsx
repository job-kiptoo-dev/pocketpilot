"use client";

import { useCallback, useEffect, useState } from "react";
import { Check, Copy, KeyRound, Loader2, RefreshCw, Smartphone, Zap } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { getBrowserSupabase } from "@/lib/supabase/client";

interface TokenStatus {
  created_at: string;
  last_used_at: string | null;
}

export default function SettingsPage() {
  const cloud = isSupabaseConfigured();
  const [status, setStatus] = useState<TokenStatus | null>(null);
  const [loading, setLoading] = useState(cloud);
  const [token, setToken] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(async () => {
    if (!cloud) return;
    const { data } = await getBrowserSupabase()
      .from("ingest_tokens")
      .select("created_at, last_used_at")
      .maybeSingle();
    setStatus(data ?? null);
    setLoading(false);
  }, [cloud]);

  useEffect(() => {
    // refresh() only sets state after an awaited fetch, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refresh();
  }, [refresh]);

  async function generate() {
    setBusy(true);
    try {
      const res = await fetch("/api/ingest/token", { method: "POST" });
      if (!res.ok) throw new Error();
      const { token: t } = (await res.json()) as { token: string };
      setToken(t);
      await refresh();
      toast.success(status ? "New token generated" : "Connection created");
    } catch {
      toast.error("Couldn't generate a token. Are you signed in?");
    } finally {
      setBusy(false);
    }
  }

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const webhookUrl = token ? `${origin}/api/ingest/sms?token=${token}` : null;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Zap className="size-6 text-primary" /> Connect M-Pesa
        </h1>
        <p className="text-sm text-muted-foreground">
          Forward your M-Pesa SMS to PocketPilot and watch transactions appear live.
        </p>
      </header>

      {!cloud ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Real-time sync needs the cloud backend. This build is running in local mode.
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <KeyRound className="size-4" /> Your ingest webhook
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Loading…
                </div>
              ) : status ? (
                <p className="text-sm text-muted-foreground">
                  Connection active since {new Date(status.created_at).toLocaleDateString()}.{" "}
                  {status.last_used_at
                    ? `Last message received ${timeAgo(status.last_used_at)}.`
                    : "No messages received yet."}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground">
                  You haven&apos;t set up a connection yet. Generate a webhook to get started.
                </p>
              )}

              {webhookUrl && (
                <div className="space-y-2 rounded-xl border border-[color:var(--warning)]/40 bg-[color:var(--warning)]/5 p-3">
                  <p className="text-xs font-medium text-[color:var(--warning)]">
                    Copy this now — it&apos;s shown only once.
                  </p>
                  <CopyField value={webhookUrl} />
                </div>
              )}

              <Button onClick={generate} disabled={busy} variant={status ? "outline" : "default"}>
                {busy ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
                {status ? "Regenerate token" : "Generate webhook"}
              </Button>
              {status && (
                <p className="text-xs text-muted-foreground">
                  Regenerating invalidates the old token — update your forwarder app afterwards.
                </p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Smartphone className="size-4" /> Forward your M-Pesa SMS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                M-Pesa has no real-time API for personal numbers, so we read the confirmation SMS on your
                phone and POST it to your webhook above. Pick your phone:
              </p>

              <Tabs defaultValue="ios">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="ios">iPhone</TabsTrigger>
                  <TabsTrigger value="android">Android</TabsTrigger>
                </TabsList>

                <TabsContent value="ios" className="pt-3">
                  <p className="mb-2">Use a built-in Shortcuts automation — no extra app, runs automatically:</p>
                  <ol className="ml-1 list-inside list-decimal space-y-1.5">
                    <li>
                      Shortcuts app → <strong className="text-foreground">Automation</strong> tab → New →{" "}
                      <strong className="text-foreground">Message</strong>.
                    </li>
                    <li>
                      Filter: <strong className="text-foreground">Sender contains</strong>{" "}
                      <code className="rounded bg-muted px-1">MPESA</code>. Turn on{" "}
                      <strong className="text-foreground">Run Immediately</strong>.
                    </li>
                    <li>
                      Add action <strong className="text-foreground">Get Contents of URL</strong> → method{" "}
                      <strong className="text-foreground">POST</strong>, URL = the webhook above.
                    </li>
                    <li>
                      Request Body = <strong className="text-foreground">JSON</strong>, add field{" "}
                      <code className="rounded bg-muted px-1">text</code> = the{" "}
                      <strong className="text-foreground">Shortcut Input</strong> (message content).
                    </li>
                    <li>Send yourself a small M-Pesa payment — it should appear here within a second.</li>
                  </ol>
                </TabsContent>

                <TabsContent value="android" className="pt-3">
                  <ol className="ml-1 list-inside list-decimal space-y-1.5">
                    <li>
                      Install an SMS-to-URL forwarder (e.g. <strong className="text-foreground">SMS Forwarder</strong>{" "}
                      on the Play Store, or the open-source one on F-Droid).
                    </li>
                    <li>
                      Add a rule matching the sender <code className="rounded bg-muted px-1">MPESA</code>.
                    </li>
                    <li>
                      Action = <strong className="text-foreground">webhook / HTTP POST</strong> to the URL above,
                      sending the message text as the body (field{" "}
                      <code className="rounded bg-muted px-1">text</code> or raw body both work).
                    </li>
                    <li>Send yourself a small M-Pesa payment — it should appear here within a second.</li>
                  </ol>
                </TabsContent>
              </Tabs>

              <p className="rounded-lg bg-muted/60 px-3 py-2 text-xs">
                Your SMS pass through your own HTTPS endpoint. Keep the token private — treat the URL like a
                password, and regenerate it if it leaks.
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

function CopyField({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — select and copy manually.");
    }
  }
  return (
    <div className="flex gap-2">
      <Input readOnly value={value} className="font-mono text-xs" onFocus={(e) => e.currentTarget.select()} />
      <Button type="button" size="icon" variant="outline" onClick={copy} aria-label="Copy" className="shrink-0">
        {copied ? <Check className="size-4 text-[color:var(--safe)]" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

function timeAgo(iso: string): string {
  const secs = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (secs < 60) return "just now";
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} h ago`;
  return `${Math.floor(hrs / 24)} d ago`;
}
