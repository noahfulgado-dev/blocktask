import type { Metadata } from "next";
import { FolderPlus, ListTodo } from "lucide-react";

import { ClassCard } from "@/components/class/class-card";
import { CreateClassDialog } from "@/components/class/create-class-dialog";
import { JoinClassDialog } from "@/components/class/join-class-dialog";
import { FacebookTimelinePanel } from "@/components/dashboard/facebook-timeline-panel";
import {
  RemindersPanel,
  type ReminderItem,
} from "@/components/dashboard/reminders-panel";
import { AppHeader } from "@/components/layout/app-header";
import { requireUser } from "@/lib/auth";
import { pageMetadata } from "@/lib/site";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { ClassRow, MemberRole, TaskStatus } from "@/lib/types";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Your classes",
  description:
    "See your BlockTask classes, open a task board, and join another block with an invite code.",
  path: "/dashboard",
  noIndex: true,
});

export default async function DashboardPage() {
  const user = await requireUser();
  const supabase = await createClient();

  const [{ data: profileRow }, { data: memberships }] = await Promise.all([
    supabase
      .from("profiles")
      .select("email, full_name")
      .eq("id", user.id)
      .maybeSingle(),
    supabase
      .from("class_members")
      .select("class_id, role")
      .eq("user_id", user.id),
  ]);

  const profile = profileRow ?? {
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  };

  const classIds = (memberships ?? []).map((row) => row.class_id as string);
  const roleByClass = new Map<string, MemberRole>(
    (memberships ?? []).map((row) => [
      row.class_id as string,
      row.role as MemberRole,
    ]),
  );

  let classes: ClassRow[] = [];
  const memberCounts = new Map<string, number>();
  const openTaskCounts = new Map<string, number>();

  if (classIds.length > 0) {
    const [classesResult, membersResult, tasksResult] = await Promise.all([
      supabase
        .from("classes")
        .select("*")
        .in("id", classIds)
        .order("created_at", { ascending: false }),
      supabase
        .from("class_members")
        .select("class_id")
        .in("class_id", classIds),
      supabase
        .from("tasks")
        .select("class_id, status")
        .in("class_id", classIds),
    ]);

    classes = (classesResult.data ?? []) as ClassRow[];

    for (const row of membersResult.data ?? []) {
      const classId = row.class_id as string;
      memberCounts.set(classId, (memberCounts.get(classId) ?? 0) + 1);
    }

    for (const row of tasksResult.data ?? []) {
      if ((row.status as TaskStatus) === "done") continue;
      const classId = row.class_id as string;
      openTaskCounts.set(classId, (openTaskCounts.get(classId) ?? 0) + 1);
    }
  }

  const reminders: ReminderItem[] = classes
    .filter((course) => (course.reminder ?? "").trim().length > 0)
    .map((course) => ({
      classId: course.id,
      className: course.name,
      reminder: (course.reminder ?? "").trim(),
      updatedAt: course.updated_at ?? course.created_at,
      openTasks: openTaskCounts.get(course.id) ?? 0,
    }))
    .sort((a, b) => (b.updatedAt ?? "").localeCompare(a.updatedAt ?? ""));

  const configured = isSupabaseConfigured();

  return (
    <div className="min-h-dvh">
      <AppHeader profile={profile} />

      <main className="w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8 2xl:px-12">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between sm:gap-4">
          <div className="min-w-0">
            <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
              Your classes
            </h1>
            <p className="text-sm text-muted-foreground">
              Pick a class to open its task board.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <JoinClassDialog configured={configured} />
            <CreateClassDialog configured={configured} />
          </div>
        </div>

        {!configured ? (
          <p className="mt-6 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
            Supabase is not connected yet. Add your project keys to{" "}
            <code className="font-semibold">.env.local</code>, then restart the
            dev server.
          </p>
        ) : null}

        <div className="mt-6 grid gap-6 md:grid-cols-[260px_minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)_240px] lg:items-start xl:grid-cols-[320px_minmax(0,1fr)_270px] 2xl:grid-cols-[360px_minmax(0,1fr)_300px]">
          <aside className="order-3 md:col-start-1 md:row-span-2 md:row-start-1 lg:order-1 lg:row-span-1 lg:sticky lg:top-20 lg:self-start">
            <FacebookTimelinePanel />
          </aside>

          <div className="order-2 min-w-0 md:col-start-2 md:row-start-1 lg:order-2">
            {classes.length === 0 ? (
              <div className="mx-auto max-w-2xl rounded-xl border border-dashed border-border bg-card p-6 text-center sm:p-10">
                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                  <ListTodo className="h-6 w-6" />
                </span>
                <h2 className="text-lg font-semibold">No classes yet</h2>
                <p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">
                  Create your block&apos;s workspace, or join one with an invite
                  code from your class admin.
                </p>
                <div className="mt-5 flex flex-wrap justify-center gap-2">
                  <JoinClassDialog configured={configured} />
                  <CreateClassDialog configured={configured} />
                </div>
                <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <FolderPlus className="h-3.5 w-3.5" />
                  Tip: one class per block or section keeps things organized.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(min(240px,100%),1fr))] content-start gap-4">
                {classes.map((course) => (
                  <ClassCard
                    key={course.id}
                    id={course.id}
                    name={course.name}
                    description={course.description}
                    role={roleByClass.get(course.id) ?? "member"}
                    memberCount={memberCounts.get(course.id) ?? 1}
                    openTasks={openTaskCounts.get(course.id) ?? 0}
                  />
                ))}
              </div>
            )}
          </div>

          <aside className="order-1 md:col-start-2 md:row-start-2 lg:col-start-3 lg:row-start-1 lg:sticky lg:top-20 lg:self-start">
            <RemindersPanel reminders={reminders} />
          </aside>
        </div>
      </main>
    </div>
  );
}
