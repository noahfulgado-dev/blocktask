"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";

import { leaveClassAction } from "@/app/actions/members";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function LeaveClassButton({
  classId,
  className,
}: {
  classId: string;
  className?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);

  async function handleLeave() {
    setPending(true);

    try {
      const result = await leaveClassAction(classId);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("You left the class.");
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className={className}
        onClick={() => setOpen(true)}
      >
        <LogOut />
        Leave class
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Leave this class?</DialogTitle>
            <DialogDescription>
              You will lose access to its task board and members. You can rejoin
              later with the invite code.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleLeave}
              disabled={pending}
            >
              {pending ? <Loader2 className="animate-spin" /> : null}
              Leave class
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
