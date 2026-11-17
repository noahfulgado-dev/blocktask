"use client";

import * as React from "react";
import { Check, Copy, Link2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const subscribeToOrigin = () => () => {};

export function InviteLink({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);
  const origin = React.useSyncExternalStore(
    subscribeToOrigin,
    () => window.location.origin,
    () => "",
  );

  const link = origin ? `${origin}/join/${code}` : `/join/${code}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/join/${code}`);
      setCopied(true);
      toast.success("Invite link copied.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Select the link manually.");
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center",
        className,
      )}
    >
      <div className="flex min-w-0 flex-1 items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5">
        <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
        <span className="truncate font-mono text-xs text-foreground">{link}</span>
      </div>
      <Button type="button" variant="outline" size="sm" onClick={handleCopy}>
        {copied ? <Check className="text-emerald-600" /> : <Copy />}
        {copied ? "Copied" : "Copy link"}
      </Button>
    </div>
  );
}
