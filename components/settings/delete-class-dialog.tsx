"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { deleteClassAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DeleteClassDialog({
  classId,
  className: courseName,
  canDelete,
}: {
  classId: string;
  className: string;
  canDelete: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [confirmText, setConfirmText] = React.useState("");

  async function handleDelete() {
    setPending(true);

    try {
      const result = await deleteClassAction(classId);

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Class deleted.");
      setOpen(false);
      router.push("/dashboard");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="rounded-xl border border-red-200 bg-red-50/60 p-5 dark:border-red-500/30 dark:bg-red-500/10">
      <h3 className="font-semibold text-red-800 dark:text-red-300">
        Delete this class
      </h3>
      <p className="mt-1 text-sm text-red-700/90 dark:text-red-300/90">
        {canDelete
          ? "Permanently delete this class, its tasks, and its members. This cannot be undone."
          : "Only the class creator can delete this class."}
      </p>

      {canDelete ? (
        <>
          <Button
            type="button"
            variant="destructive"
            className="mt-4"
            onClick={() => setOpen(true)}
          >
            <Trash2 />
            Delete class
          </Button>

          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Delete {courseName}?</DialogTitle>
                <DialogDescription>
                  This permanently removes every task and membership in this
                  class. Type the class name to confirm.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-2">
                <Label htmlFor="confirm-class-name">
                  Type{" "}
                  <span className="font-semibold text-foreground">
                    {courseName}
                  </span>{" "}
                  to confirm
                </Label>
                <Input
                  id="confirm-class-name"
                  value={confirmText}
                  onChange={(event) => setConfirmText(event.target.value)}
                  autoComplete="off"
                />
              </div>

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
                  onClick={handleDelete}
                  disabled={pending || confirmText !== courseName}
                >
                  {pending ? <Loader2 className="animate-spin" /> : null}
                  Delete permanently
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      ) : null}
    </div>
  );
}
