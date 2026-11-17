"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";

export function InviteCode({
  code,
  className,
}: {
  code: string;
  className?: string;
}) {
  const [copied, setCopied] = React.useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Invite code copied.");
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Could not copy. Select the code manually.");
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      title="Copy invite code"
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-border bg-muted px-3 py-1.5 font-mono text-sm font-semibold tracking-[0.2em] text-foreground transition-colors hover:bg-muted/70",
        className,
      )}
    >
      {code}
      {copied ? (
        <Check className="h-3.5 w-3.5 text-emerald-600" />
      ) : (
        <Copy className="h-3.5 w-3.5 text-muted-foreground" />
      )}
    </button>
  );
}
