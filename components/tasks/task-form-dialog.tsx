"use client";

import * as React from "react";

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
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { MemberWithProfile, Task, TaskStatus } from "@/lib/types";
import { displayName } from "@/lib/utils";

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "in_progress", label: "In progress" },
  { value: "done", label: "Done" },
];

export type TaskFormValues = {
  title: string;
  description: string;
  assignedTo: string | null;
  dueDate: string | null;
  status?: TaskStatus;
};

export function TaskFormDialog({
  open,
  onOpenChange,
  members,
  task,
  showStatus = false,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: MemberWithProfile[];
  task?: Task | null;
  showStatus?: boolean;
  onSubmit: (values: TaskFormValues) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open ? (
          <TaskFormFields
            key={task?.id ?? "new"}
            members={members}
            task={task ?? null}
            showStatus={showStatus}
            onSubmit={onSubmit}
            onDone={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function TaskFormFields({
  members,
  task,
  showStatus,
  onSubmit,
  onDone,
}: {
  members: MemberWithProfile[];
  task: Task | null;
  showStatus: boolean;
  onSubmit: (values: TaskFormValues) => void;
  onDone: () => void;
}) {
  const isEdit = Boolean(task);

  const [title, setTitle] = React.useState(task?.title ?? "");
  const [description, setDescription] = React.useState(
    task?.description ?? "",
  );
  const [assignedTo, setAssignedTo] = React.useState(task?.assigned_to ?? "");
  const [dueDate, setDueDate] = React.useState(task?.due_date ?? "");
  const [status, setStatus] = React.useState<TaskStatus>(
    task?.status ?? "pending",
  );

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit({
      title,
      description,
      assignedTo: assignedTo || null,
      dueDate: dueDate || null,
      ...(showStatus ? { status } : {}),
    });
    onDone();
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle>{isEdit ? "Edit task" : "New task"}</DialogTitle>
        <DialogDescription>
          {isEdit
            ? "Update the task details for everyone in the class."
            : "Add a requirement, deadline, or group task to the board."}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="task-title">Title</Label>
          <Input
            id="task-title"
            placeholder="Finalize capstone proposal"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            maxLength={200}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="task-description">Details</Label>
          <Textarea
            id="task-description"
            placeholder="Add context, links, or reminders."
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="task-assignee">Assigned to</Label>
            <Select
              id="task-assignee"
              value={assignedTo}
              onChange={(event) => setAssignedTo(event.target.value)}
            >
              <option value="">Unassigned</option>
              {members.map((member) => (
                <option key={member.user_id} value={member.user_id}>
                  {displayName(member.profile)}
                  {member.role === "admin" ? " (admin)" : ""}
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="task-due">Due date</Label>
            <Input
              id="task-due"
              type="date"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
        </div>

        {isEdit && showStatus ? (
          <div className="space-y-2">
            <Label htmlFor="task-status">Status</Label>
            <Select
              id="task-status"
              value={status}
              onChange={(event) => setStatus(event.target.value as TaskStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        ) : null}

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onDone}>
            Cancel
          </Button>
          <Button type="submit">{isEdit ? "Save changes" : "Add task"}</Button>
        </DialogFooter>
      </form>
    </>
  );
}
