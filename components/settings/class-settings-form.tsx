"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { updateClassAction } from "@/app/actions/classes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function ClassSettingsForm({
  classId,
  name: initialName,
  description: initialDescription,
  allowMemberTasks: initialAllowMemberTasks,
  allowMemberEditTasks: initialAllowMemberEditTasks,
}: {
  classId: string;
  name: string;
  description: string | null;
  allowMemberTasks: boolean;
  allowMemberEditTasks: boolean;
}) {
  const router = useRouter();
  const [pending, setPending] = React.useState(false);
  const [name, setName] = React.useState(initialName);
  const [description, setDescription] = React.useState(
    initialDescription ?? "",
  );
  const [allowMemberTasks, setAllowMemberTasks] = React.useState(
    initialAllowMemberTasks,
  );
  const [allowMemberEditTasks, setAllowMemberEditTasks] = React.useState(
    initialAllowMemberEditTasks,
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const result = await updateClassAction({
        classId,
        name,
        description,
        allowMemberTasks,
        allowMemberEditTasks,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Class settings updated.");
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="settings-name">Class name</Label>
        <Input
          id="settings-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          maxLength={120}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="settings-description">Description</Label>
        <Textarea
          id="settings-description"
          placeholder="What is this block working on this semester?"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
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
              When off, only admins can create tasks.
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
              When off, members can only edit their own tasks and change the
              status of tasks assigned to them.
            </span>
          </span>
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  );
}
