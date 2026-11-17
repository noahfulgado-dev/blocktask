"use client";

import * as React from "react";
import { ListChecks, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { ClassReminder } from "@/components/tasks/class-reminder";
import { TaskCard } from "@/components/tasks/task-card";
import {
  TaskFormDialog,
  type TaskFormValues,
} from "@/components/tasks/task-form-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import type {
  MemberRole,
  MemberWithProfile,
  Profile,
  Task,
  TaskCompletion,
  TaskStatus,
} from "@/lib/types";
import { friendlyTaskError } from "@/lib/task-errors";

const COLUMNS: {
  status: TaskStatus;
  title: string;
  dot: string;
}[] = [
  { status: "pending", title: "Pending", dot: "bg-slate-400" },
  { status: "in_progress", title: "In progress", dot: "bg-amber-500" },
  { status: "done", title: "Done", dot: "bg-emerald-500" },
];

const EMPTY_COMPLETIONS: TaskCompletion[] = [];

function compareTasks(a: Task, b: Task) {
  if (a.due_date && b.due_date) return a.due_date.localeCompare(b.due_date);
  if (a.due_date) return -1;
  if (b.due_date) return 1;
  return b.created_at.localeCompare(a.created_at);
}

export function TaskBoard({
  classId,
  initialTasks,
  initialMembers,
  initialCompletions,
  initialReminder,
  role,
  allowMemberTasks,
  allowMemberEditTasks,
  currentUserId,
}: {
  classId: string;
  initialTasks: Task[];
  initialMembers: MemberWithProfile[];
  initialCompletions: TaskCompletion[];
  initialReminder: string;
  role: MemberRole;
  allowMemberTasks: boolean;
  allowMemberEditTasks: boolean;
  currentUserId: string;
}) {
  const [query, setQuery] = React.useState("");
  const [createOpen, setCreateOpen] = React.useState(false);
  const [tasks, setTasks] = React.useState(initialTasks);
  const [members, setMembers] = React.useState(initialMembers);
  const [completions, setCompletions] = React.useState(initialCompletions);
  const [reminder, setReminder] = React.useState(initialReminder);

  const canCreate = role === "admin" || allowMemberTasks;

  React.useEffect(() => {
    const supabase = createClient();
    let cancelled = false;

    async function refreshMembers() {
      const { data: memberRows } = await supabase
        .from("class_members")
        .select("user_id, role, joined_at")
        .eq("class_id", classId);

      if (cancelled) return;

      const rows = memberRows ?? [];
      const userIds = rows.map((row) => row.user_id as string);
      let profiles: Profile[] = [];

      if (userIds.length > 0) {
        const { data } = await supabase
          .from("profiles")
          .select("id, email, full_name, avatar_url")
          .in("id", userIds);
        profiles = (data ?? []) as Profile[];
      }

      if (cancelled) return;

      const profileById = new Map(
        profiles.map((profile) => [profile.id, profile]),
      );

      setMembers(
        rows.map((row) => ({
          user_id: row.user_id as string,
          role: row.role as MemberWithProfile["role"],
          joined_at: row.joined_at as string,
          profile: profileById.get(row.user_id as string) ?? null,
        })),
      );
    }

    const channel = supabase
      .channel(`class-${classId}-board`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tasks",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const removed = payload.old as { id?: string };
            if (removed.id) {
              setTasks((prev) => prev.filter((task) => task.id !== removed.id));
            }
            return;
          }

          const row = payload.new as Task;
          setTasks((prev) =>
            prev.some((task) => task.id === row.id)
              ? prev.map((task) => (task.id === row.id ? row : task))
              : [row, ...prev],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "task_completions",
          filter: `class_id=eq.${classId}`,
        },
        (payload) => {
          if (payload.eventType === "DELETE") {
            const removed = payload.old as TaskCompletion;
            setCompletions((prev) =>
              prev.filter(
                (completion) =>
                  !(
                    completion.task_id === removed.task_id &&
                    completion.user_id === removed.user_id
                  ),
              ),
            );
            return;
          }

          const row = payload.new as TaskCompletion;
          setCompletions((prev) =>
            prev.some(
              (completion) =>
                completion.task_id === row.task_id &&
                completion.user_id === row.user_id,
            )
              ? prev.map((completion) =>
                  completion.task_id === row.task_id &&
                  completion.user_id === row.user_id
                    ? row
                    : completion,
                )
              : [...prev, row],
          );
        },
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "class_members",
          filter: `class_id=eq.${classId}`,
        },
        () => {
          void refreshMembers();
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "classes",
          filter: `id=eq.${classId}`,
        },
        (payload) => {
          const row = payload.new as { reminder?: string | null };
          setReminder(row.reminder ?? "");
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      void supabase.removeChannel(channel);
    };
  }, [classId]);

  const completionsByTask = React.useMemo(() => {
    const map = new Map<string, TaskCompletion[]>();
    for (const completion of completions) {
      const list = map.get(completion.task_id);
      if (list) {
        list.push(completion);
      } else {
        map.set(completion.task_id, [completion]);
      }
    }
    return map;
  }, [completions]);

  function createTask(values: TaskFormValues) {
    const title = values.title.trim();
    if (!title) {
      toast.error("Task title is required.");
      return;
    }

    const id = crypto.randomUUID();
    const timestamp = new Date().toISOString();
    const optimistic: Task = {
      id,
      class_id: classId,
      title,
      description: values.description.trim() || null,
      status: "pending",
      assigned_to: values.assignedTo,
      due_date: values.dueDate,
      created_by: currentUserId,
      auto_completed: false,
      created_at: timestamp,
      updated_at: timestamp,
    };

    setTasks((prev) => [optimistic, ...prev]);

    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          id,
          class_id: classId,
          title,
          description: optimistic.description,
          assigned_to: values.assignedTo,
          due_date: values.dueDate,
          created_by: currentUserId,
        })
        .select("*")
        .single();

      if (error) {
        setTasks((prev) => prev.filter((task) => task.id !== id));
        toast.error(friendlyTaskError(error.message));
        return;
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === id ? (data as Task) : task)),
      );
    })();
  }

  function updateTask(taskId: string, values: TaskFormValues) {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous) return;

    const title = values.title.trim();
    if (!title) {
      toast.error("Task title is required.");
      return;
    }

    const statusChanged =
      values.status !== undefined && values.status !== previous.status;

    const optimistic: Task = {
      ...previous,
      title,
      description: values.description.trim() || null,
      assigned_to: values.assignedTo,
      due_date: values.dueDate,
      ...(values.status === undefined
        ? {}
        : { status: values.status, auto_completed: statusChanged ? false : previous.auto_completed }),
      updated_at: new Date().toISOString(),
    };

    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? optimistic : task)),
    );

    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title,
          description: optimistic.description,
          assigned_to: values.assignedTo,
          due_date: values.dueDate,
          ...(values.status === undefined ? {} : { status: values.status }),
        })
        .eq("id", taskId)
        .select("*")
        .single();

      if (error || !data) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? previous : task)),
        );
        toast.error(
          friendlyTaskError(error?.message ?? "Could not update the task."),
        );
        return;
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? (data as Task) : task)),
      );
    })();
  }

  function changeStatus(taskId: string, status: TaskStatus) {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous || previous.status === status) return;

    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? {
              ...task,
              status,
              auto_completed: false,
              updated_at: new Date().toISOString(),
            }
          : task,
      ),
    );

    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .update({ status })
        .eq("id", taskId)
        .select("*")
        .single();

      if (error || !data) {
        setTasks((prev) =>
          prev.map((task) => (task.id === taskId ? previous : task)),
        );
        toast.error(
          friendlyTaskError(
            error?.message ?? "Could not change the task status.",
          ),
        );
        return;
      }

      setTasks((prev) =>
        prev.map((task) => (task.id === taskId ? (data as Task) : task)),
      );
    })();
  }

  function deleteTask(taskId: string) {
    const previous = tasks.find((task) => task.id === taskId);
    if (!previous) return;

    setTasks((prev) => prev.filter((task) => task.id !== taskId));

    void (async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", taskId)
        .select("id")
        .maybeSingle();

      if (error || !data) {
        setTasks((prev) =>
          prev.some((task) => task.id === taskId)
            ? prev
            : [...prev, previous],
        );
        toast.error(
          friendlyTaskError(error?.message ?? "Could not delete the task."),
        );
        return;
      }

      toast.success("Task deleted.");
    })();
  }

  function toggleCompletion(taskId: string) {
    const task = tasks.find((item) => item.id === taskId);
    if (!task) return;

    const existing = completions.find(
      (completion) =>
        completion.task_id === taskId &&
        completion.user_id === currentUserId,
    );

    const supabase = createClient();

    if (existing) {
      setCompletions((prev) =>
        prev.filter(
          (completion) =>
            !(
              completion.task_id === taskId &&
              completion.user_id === currentUserId
            ),
        ),
      );

      if (task.auto_completed) {
        setTasks((prev) =>
          prev.map((item) =>
            item.id === taskId
              ? {
                  ...item,
                  status: "in_progress",
                  auto_completed: false,
                  updated_at: new Date().toISOString(),
                }
              : item,
          ),
        );
      }

      void (async () => {
        const { error } = await supabase
          .from("task_completions")
          .delete()
          .eq("task_id", taskId)
          .eq("user_id", currentUserId);

        if (error) {
          setCompletions((prev) =>
            prev.some(
              (completion) =>
                completion.task_id === taskId &&
                completion.user_id === currentUserId,
            )
              ? prev
              : [...prev, existing],
          );
          setTasks((prev) =>
            prev.map((item) => (item.id === taskId ? task : item)),
          );
          toast.error(friendlyTaskError(error.message));
        }
      })();

      return;
    }

    const optimistic: TaskCompletion = {
      task_id: taskId,
      user_id: currentUserId,
      class_id: classId,
      completed_at: new Date().toISOString(),
    };

    const completedCount = completions.filter(
      (completion) => completion.task_id === taskId,
    ).length;
    const willCompleteAll =
      members.length > 0 && completedCount + 1 >= members.length;

    setCompletions((prev) => [...prev, optimistic]);

    if (willCompleteAll) {
      setTasks((prev) =>
        prev.map((item) =>
          item.id === taskId
            ? {
                ...item,
                status: "done",
                auto_completed: true,
                updated_at: new Date().toISOString(),
              }
            : item,
        ),
      );
    }

    void (async () => {
      const { data, error } = await supabase
        .from("task_completions")
        .insert({
          task_id: taskId,
          user_id: currentUserId,
          class_id: classId,
        })
        .select("*")
        .single();

      if (error || !data) {
        setCompletions((prev) =>
          prev.filter(
            (completion) =>
              !(
                completion.task_id === taskId &&
                completion.user_id === currentUserId
              ),
          ),
        );
        setTasks((prev) =>
          prev.map((item) => (item.id === taskId ? task : item)),
        );
        toast.error(
          friendlyTaskError(
            error?.message ?? "Could not mark the task as done.",
          ),
        );
        return;
      }

      setCompletions((prev) =>
        prev.map((completion) =>
          completion.task_id === taskId &&
          completion.user_id === currentUserId
            ? (data as TaskCompletion)
            : completion,
        ),
      );
    })();
  }

  const needle = query.trim().toLowerCase();
  const visibleTasks = needle
    ? tasks.filter((task) => {
        const haystack = `${task.title} ${task.description ?? ""}`.toLowerCase();
        return haystack.includes(needle);
      })
    : tasks;

  const totalOpen = tasks.filter((task) => task.status !== "done").length;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-60" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-600" />
            </span>
            Live
          </span>
          <p className="text-sm text-muted-foreground">
            {tasks.length} {tasks.length === 1 ? "task" : "tasks"} · {totalOpen}{" "}
            open
          </p>
        </div>

        <div className="flex w-full items-center gap-2 sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search tasks"
              className="pl-9"
            />
          </div>

          {canCreate ? (
            <Button onClick={() => setCreateOpen(true)}>
              <Plus />
              New task
            </Button>
          ) : null}
        </div>
      </div>

      <ClassReminder
        classId={classId}
        reminder={reminder}
        role={role}
        onChange={setReminder}
      />

      {tasks.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-10 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
            <ListChecks className="h-6 w-6" />
          </span>
          <h2 className="text-lg font-semibold">The board is empty</h2>
          <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
            Add the first requirement, deadline, or group task so everyone in
            the class knows what to do.
          </p>
          {canCreate ? (
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              <Plus />
              Add the first task
            </Button>
          ) : (
            <p className="mt-4 text-xs text-muted-foreground">
              Only class admins can add tasks right now.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          {COLUMNS.map((column) => {
            const columnTasks = visibleTasks
              .filter((task) => task.status === column.status)
              .sort(compareTasks);

            return (
              <div
                key={column.status}
                className="rounded-xl border border-border bg-muted/40 p-3"
              >
                <div className="mb-3 flex items-center justify-between px-1">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <span className={`h-2 w-2 rounded-full ${column.dot}`} />
                    {column.title}
                  </h3>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground">
                    {columnTasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {columnTasks.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-border bg-card/60 px-3 py-6 text-center text-xs text-muted-foreground">
                      {needle ? "No matching tasks" : "Nothing here yet"}
                    </p>
                  ) : (
                    columnTasks.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        members={members}
                        completions={
                          completionsByTask.get(task.id) ?? EMPTY_COMPLETIONS
                        }
                        role={role}
                        allowMemberEditTasks={allowMemberEditTasks}
                        currentUserId={currentUserId}
                        onStatusChange={changeStatus}
                        onToggleCompletion={toggleCompletion}
                        onUpdateTask={updateTask}
                        onDeleteTask={deleteTask}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <TaskFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        members={members}
        onSubmit={createTask}
      />
    </section>
  );
}
