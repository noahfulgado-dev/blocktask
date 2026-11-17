"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { regenerateInviteCodeAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";

export function RegenerateInviteButton({ classId }: { classId: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleRegenerate() {
    setPending(true);

    try {
      const result = await regenerateInviteCodeAction(classId);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success(result.message ?? "Invite code regenerated.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleRegenerate}
      disabled={pending}
    >
      {pending ? <Loader2 className="animate-spin" /> : <RefreshCw />}
      Regenerate
    </Button>
  );
}
