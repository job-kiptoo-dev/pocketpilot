"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Landmark, LayoutDashboard, Loader2, Receipt, ShieldCheck, Sparkles, Target, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { SyncStatus } from "@/components/sync-status";
import { useStore } from "@/lib/store/store";

const NAV = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: Receipt },
  { href: "/goals", label: "Goals", icon: Target },
  { href: "/accounts", label: "Accounts", icon: Landmark },
  { href: "/survival", label: "Survival", icon: ShieldCheck },
  { href: "/assistant", label: "Assistant", icon: Sparkles },
] as const;

function isActive(href: string, pathname: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { hydrated } = useStore();

  return (
    <div className="flex min-h-dvh w-full">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r bg-sidebar/60 px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-col gap-1">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = isActive(href, pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="size-5" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto rounded-2xl border bg-card/60 p-4 text-xs text-muted-foreground">
          <p className="font-medium text-foreground">PocketPilot</p>
          <p className="mt-1">Your M-Pesa money, finally making sense.</p>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex items-center justify-between border-b bg-background/80 px-4 py-3 backdrop-blur md:px-8">
          <div className="md:hidden">
            <Brand compact />
          </div>
          <div className="hidden md:block" />
          <div className="flex items-center gap-2">
            <SyncStatus />
            <UserMenu />
            <ThemeToggle />
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 md:px-8 md:pb-10">
          {hydrated ? (
            children
          ) : (
            <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 text-muted-foreground">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-sm">Loading your money…</p>
            </div>
          )}
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t bg-background/90 px-2 py-2 backdrop-blur md:hidden">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center gap-1 rounded-lg py-1 text-[11px] font-medium transition-colors",
                active ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <Wallet className="size-5" />
      </span>
      {!compact && (
        <span className="text-lg font-semibold tracking-tight">
          Pocket<span className="text-primary">Pilot</span>
        </span>
      )}
      {compact && (
        <span className="text-base font-semibold tracking-tight">
          Pocket<span className="text-primary">Pilot</span>
        </span>
      )}
    </Link>
  );
}
