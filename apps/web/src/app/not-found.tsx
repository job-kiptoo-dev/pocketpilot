import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-5xl font-bold tracking-tight text-primary">404</p>
      <div className="space-y-1">
        <h1 className="text-lg font-semibold">Page not found</h1>
        <p className="text-sm text-muted-foreground">That page doesn&apos;t exist — let&apos;s get you back on track.</p>
      </div>
      <Button render={<Link href="/" />}>Back to dashboard</Button>
    </div>
  );
}
