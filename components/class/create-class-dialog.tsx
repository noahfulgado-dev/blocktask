"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { createClassAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateClassDialog({ configured }: { configured: boolean }) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [allowMemberTasks, setAllowMemberTasks] = React.useState(true);
  const [allowMemberEditTasks, setAllowMemberEditTasks] = React.useState(false);

  function reset() {
    setName("");
    setDescription("");
    setAllowMemberTasks(true);
    setAllowMemberEditTasks(false);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const result = await createClassAction({
        name,
        description,
        allowMemberTasks,
        allowMemberEditTasks,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      if (!result.classId) {
        toast.error("Class created, but it could not be opened.");
        return;
      }

      toast.success("Class created.");
      setOpen(false);
      reset();
      router.push(`/class/${result.classId}`);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button disabled={!configured}>
          <Plus />
          New class
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a class</DialogTitle>
          <DialogDescription>
            Start a workspace for your block or section. You become its first
            admin and get an invite code to share.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="class-name">Class name</Label>
            <Input
              id="class-name"
              placeholder="Block 3 — Section A"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={120}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-description">Description</Label>
            <Textarea
              id="class-description"
              placeholder="What is this block working on this semester?"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/50 p-3">
            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                checked={allowMemberTasks}
                onChange={(event) => setAllowMemberTasks(event.target.checked)}
              />
              <span>
                <span className="font-medium">Members can add tasks</span>
                <span className="block text-xs text-muted-foreground">
                  Members can create their own tasks. Admins always can.
                </span>
              </span>
            </label>

            <label className="flex items-start gap-3 text-sm">
              <input
                type="checkbox"
                className="mt-0.5 h-4 w-4 rounded border-input accent-primary"
                checked={allowMemberEditTasks}
                onChange={(event) =>
                  setAllowMemberEditTasks(event.target.checked)
                }
              />
              <span>
                <span className="font-medium">Members can edit any task</span>
                <span className="block text-xs text-muted-foreground">
                  Members can edit and reschedule every task, not just their own.
                </span>
              </span>
            </label>
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
            <Button type="submit" disabled={pending}>
              {pending ? <Loader2 className="animate-spin" /> : null}
              Create class
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
