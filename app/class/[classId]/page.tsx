import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Settings } from "lucide-react";

import { InviteCode } from "@/components/class/invite-code";
import { InviteLink } from "@/components/class/invite-link";
import { AppHeader } from "@/components/layout/app-header";
import { MembersPanel } from "@/components/members/members-panel";
import { TaskBoard } from "@/components/tasks/task-board";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { requireClassMember } from "@/lib/auth";
import type {
  ClassRow,
  MemberWithProfile,
  Profile,
  Task,
  TaskCompletion,
} from "@/lib/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Task board — BlockTask",
};

export default async function ClassPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const { user, supabase, role } = await requireClassMember(classId);

  const [
    { data: course },
    { data: memberRows },
    { data: taskRows },
    { data: completionRows },
  ] = await Promise.all([
    supabase
      .from("classes")
      .select("*")
      .eq("id", classId)
      .maybeSingle<ClassRow>(),
    supabase
      .from("class_members")
      .select("user_id, role, joined_at")
      .eq("class_id", classId),
    supabase
      .from("tasks")
      .select("*")
      .eq("class_id", classId)
      .order("created_at", { ascending: false }),
    supabase
      .from("task_completions")
      .select("*")
      .eq("class_id", classId),
  ]);

  if (!course) notFound();

  const userIds = (memberRows ?? []).map((row) => row.user_id as string);

  let profiles: Profile[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, email, full_name, avatar_url")
      .in("id", userIds);
    profiles = (data ?? []) as Profile[];
  }

  const profileById = new Map(profiles.map((profile) => [profile.id, profile]));

  const members: MemberWithProfile[] = (memberRows ?? []).map((row) => ({
    user_id: row.user_id as string,
    role: row.role as MemberWithProfile["role"],
    joined_at: row.joined_at as string,
    profile: profileById.get(row.user_id as string) ?? null,
  }));

  const tasks = (taskRows ?? []) as Task[];
  const taskCompletions = (completionRows ?? []) as TaskCompletion[];

  const currentProfile =
    profileById.get(user.id) ?? {
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ?? null,
      avatar_url: null,
    };

  return (
    <div className="min-h-dvh">
      <AppHeader profile={currentProfile}>
        <nav className="flex items-center gap-1 text-sm text-primary-foreground/80">
          <Link
            href="/dashboard"
            className="hidden truncate transition-colors hover:text-primary-foreground sm:inline"
          >
            Dashboard
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
          <span className="truncate font-medium text-primary-foreground">
            {course.name}
          </span>
        </nav>
      </AppHeader>

      <main className="w-full px-4 py-6 sm:px-6 lg:px-8 2xl:px-12">
        <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">
                {course.name}
              </h1>
              <Badge variant={role === "admin" ? "default" : "secondary"}>
                {role === "admin" ? "Admin" : "Member"}
              </Badge>
            </div>

            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              {course.description?.trim() || "No description yet."}
            </p>

            <div className="mt-3 max-w-md space-y-2">
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                <span>Invite code</span>
                <InviteCode code={course.invite_code} />
                <span className="text-xs">
                  Share this link with your blockmates.
                </span>
              </div>
              <InviteLink code={course.invite_code} />
            </div>
          </div>

          {role === "admin" ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/class/${classId}/settings`}>
                <Settings />
                Class settings
              </Link>
            </Button>
          ) : null}
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_290px]">
          <TaskBoard
            classId={classId}
            initialTasks={tasks}
            initialMembers={members}
            initialCompletions={taskCompletions}
            initialReminder={course.reminder ?? ""}
            role={role}
            allowMemberTasks={course.allow_member_tasks}
            allowMemberEditTasks={course.allow_member_edit_tasks}
            currentUserId={user.id}
          />

          <aside className="lg:sticky lg:top-20 lg:self-start">
            <MembersPanel
              classId={classId}
              members={members}
              currentUserId={user.id}
            />
          </aside>
        </div>
      </main>
    </div>
  );
}
