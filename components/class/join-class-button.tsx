"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogIn } from "lucide-react";
import { toast } from "sonner";

import { joinClassAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";

export function JoinClassButton({ code }: { code: string }) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);

  async function handleJoin() {
    setPending(true);

    try {
      const result = await joinClassAction(code);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (!result.classId) {
        toast.error("Class joined, but it could not be opened.");
        return;
      }

      toast.success("You joined the class.");
      router.push(`/class/${result.classId}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Button type="button" size="lg" className="w-full" onClick={handleJoin} disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <LogIn />}
      Join class
    </Button>
  );
}
