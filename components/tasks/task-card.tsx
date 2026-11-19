"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  MoreHorizontal,
  Pencil,
  Trash2,
} from "lucide-react";

import { RelativeTime } from "@/components/time/relative-time";
import {
  TaskFormDialog,
  type TaskFormValues,
} from "@/components/tasks/task-form-dialog";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type {
  MemberRole,
  MemberWithProfile,
  Task,
  TaskCompletion,
  TaskStatus,
} from "@/lib/types";
import { cn, displayName, formatDate } from "@/lib/utils";
import { useToday } from "@/lib/use-today";

const STATUS_LABELS: Record<TaskStatus, string> = {
  pending: "Pending",
  in_progress: "In progress",
  done: "Done",
};

const STATUS_STYLES: Record<TaskStatus, string> = {
  pending:
    "border-slate-200 bg-slate-100 text-slate-700 dark:border-slate-600 dark:bg-slate-700/60 dark:text-slate-200",
  in_progress:
    "border-amber-200 bg-amber-100 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/15 dark:text-amber-300",
  done: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/15 dark:text-emerald-300",
};

export function TaskCard({
  task,
  members,
  completions,
  role,
  allowMemberEditTasks,
  currentUserId,
  onStatusChange,
  onToggleCompletion,
  onUpdateTask,
  onDeleteTask,
}: {
  task: Task;
  members: MemberWithProfile[];
  completions: TaskCompletion[];
  role: MemberRole;
  allowMemberEditTasks: boolean;
  currentUserId: string;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onToggleCompletion: (taskId: string) => void;
  onUpdateTask: (taskId: string, values: TaskFormValues) => void;
  onDeleteTask: (taskId: string) => void;
}) {
  const [editOpen, setEditOpen] = React.useState(false);
  const [deleteOpen, setDeleteOpen] = React.useState(false);
  const today = useToday();

  const canEditAll = role === "admin" || allowMemberEditTasks;
  const canEdit = canEditAll || task.created_by === currentUserId;
  const canChangeStatus = canEdit || task.assigned_to === currentUserId;
  const canDelete = role === "admin" || task.created_by === currentUserId;

  const assignee = task.assigned_to
    ? members.find((member) => member.user_id === task.assigned_to)
    : null;

  const dueLabel = formatDate(task.due_date);
  const dueDate = task.due_date;
  const isOverdue =
    task.status !== "done" &&
    dueDate !== null &&
    today !== null &&
    dueDate < today;

  const memberById = new Map(
    members.map((member) => [member.user_id, member] as const),
  );
  const completedMembers = completions
    .map((completion) => memberById.get(completion.user_id))
    .filter((member): member is MemberWithProfile => Boolean(member));
  const completedByMe = completions.some(
    (completion) => completion.user_id === currentUserId,
  );
  const allDone =
    members.length > 0 && completedMembers.length >= members.length;

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between gap-2">
        <h3
          className={cn(
            "text-sm font-semibold leading-snug",
            task.status === "done" && "text-muted-foreground line-through",
          )}
        >
          {task.title}
        </h3>

        {canEdit || canDelete ? (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="rounded-md p-1 text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
              <MoreHorizontal className="h-4 w-4" />
              <span className="sr-only">Task actions</span>
            </DropdownMenu.Trigger>

            <DropdownMenu.Portal>
              <DropdownMenu.Content
                align="end"
                sideOffset={4}
                className="z-50 w-40 rounded-lg border border-border bg-card p-1 text-card-foreground shadow-lg"
              >
                {canEdit ? (
                  <DropdownMenu.Item
                    onSelect={() => setEditOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm outline-none transition-colors hover:bg-muted focus-visible:bg-muted"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                    Edit task
                  </DropdownMenu.Item>
                ) : null}

                {canDelete ? (
                  <DropdownMenu.Item
                    onSelect={() => setDeleteOpen(true)}
                    className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm text-red-600 outline-none transition-colors hover:bg-red-50 focus-visible:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10 dark:focus-visible:bg-red-500/10"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete task
                  </DropdownMenu.Item>
                ) : null}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>
        ) : null}
      </div>

      {task.description ? (
        <p className="mt-1.5 whitespace-pre-line text-sm text-muted-foreground line-clamp-3">
          {task.description}
        </p>
      ) : null}

      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-muted-foreground">
        {assignee ? (
          <span className="inline-flex items-center gap-1.5">
            <Avatar
              name={displayName(assignee.profile)}
              seed={assignee.user_id}
              className="h-5 w-5 text-[9px]"
            />
            {displayName(assignee.profile)}
          </span>
        ) : (
          <span className="rounded-full bg-muted px-2 py-0.5">Unassigned</span>
        )}

        {dueLabel ? (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              isOverdue && "font-medium text-red-600 dark:text-red-400",
            )}
          >
            <CalendarDays className="h-3.5 w-3.5" />
            {dueLabel}
            {isOverdue ? " (overdue)" : ""}
          </span>
        ) : null}
      </div>

      <div className="mt-3 space-y-2 border-t border-border pt-3">
        <div className="flex min-h-5 items-center gap-2">
          {completedMembers.length === 0 ? (
            <span className="text-[11px] text-muted-foreground">
              No one has marked this done yet
            </span>
          ) : (
            <>
              <span className="flex -space-x-1.5">
                {completedMembers.slice(0, 4).map((member) => (
                  <span
                    key={member.user_id}
                    title={displayName(member.profile)}
                    className="inline-flex rounded-full ring-2 ring-card"
                  >
                    <Avatar
                      name={displayName(member.profile)}
                      seed={member.user_id}
                      className="h-5 w-5 text-[9px]"
                    />
                  </span>
                ))}
              </span>
              <span className="text-[11px] text-muted-foreground">
                {completedMembers.length} of {members.length} done
                {allDone ? " · all done" : ""}
              </span>
            </>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onToggleCompletion(task.id)}
            aria-pressed={completedByMe}
            className={cn(
              "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              completedByMe
                ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300 dark:hover:bg-emerald-500/20"
                : "border-border bg-card text-foreground hover:bg-muted",
            )}
          >
            {completedByMe ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Circle className="h-3.5 w-3.5" />
            )}
            {completedByMe ? "Undo" : "Mark done"}
          </button>

          <span className="text-[11px] text-muted-foreground">
            Updated <RelativeTime value={task.updated_at} fallback="recently" />
          </span>
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="relative">
            <select
              aria-label="Task status"
              value={task.status}
              onChange={(event) =>
                onStatusChange(task.id, event.target.value as TaskStatus)
              }
              disabled={!canChangeStatus}
              className={cn(
                "appearance-none rounded-full border py-1 pl-2.5 pr-6 text-base font-semibold outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-70 sm:text-xs",
                STATUS_STYLES[task.status],
              )}
            >
              <option value="pending">{STATUS_LABELS.pending}</option>
              <option value="in_progress">{STATUS_LABELS.in_progress}</option>
              <option value="done">{STATUS_LABELS.done}</option>
            </select>
            <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[8px]">
              ▼
            </span>
          </div>

          {task.auto_completed ? (
            <span className="text-[11px] font-medium text-emerald-700 dark:text-emerald-300">
              Auto-completed
            </span>
          ) : null}
        </div>
      </div>

      <TaskFormDialog
        open={editOpen}
        onOpenChange={setEditOpen}
        members={members}
        task={task}
        showStatus={canChangeStatus}
        onSubmit={(values) => onUpdateTask(task.id, values)}
      />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Delete this task?</DialogTitle>
            <DialogDescription>
              &ldquo;{task.title}&rdquo; will be removed for everyone in the
              class. This cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                setDeleteOpen(false);
                onDeleteTask(task.id);
              }}
            >
              Delete task
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </article>
  );
}
