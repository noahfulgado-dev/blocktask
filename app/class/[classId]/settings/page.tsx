import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";

import { InviteCode } from "@/components/class/invite-code";
import { InviteLink } from "@/components/class/invite-link";
import { AppHeader } from "@/components/layout/app-header";
import { MembersAdmin } from "@/components/members/members-admin";
import { ClassSettingsForm } from "@/components/settings/class-settings-form";
import { DeleteClassDialog } from "@/components/settings/delete-class-dialog";
import { RegenerateInviteButton } from "@/components/settings/regenerate-invite-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuthContext } from "@/lib/auth";
import { pageMetadata } from "@/lib/site";
import type {
  ClassRow,
  MemberWithProfile,
  Profile,
} from "@/lib/types";

export const metadata: Metadata = pageMetadata({
  title: "Class settings",
  description:
    "Manage your BlockTask class details, invite code, members, and permissions.",
  noIndex: true,
});

export default async function ClassSettingsPage({
  params,
}: {
  params: Promise<{ classId: string }>;
}) {
  const { classId } = await params;
  const { user, supabase } = await requireAuthContext();

  const [membershipResult, { data: course }, { data: memberRows }] =
    await Promise.all([
      supabase
        .from("class_members")
        .select("role")
        .eq("class_id", classId)
        .eq("user_id", user.id)
        .maybeSingle(),
      supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .maybeSingle<ClassRow>(),
      supabase
        .from("class_members")
        .select("user_id, role, joined_at")
        .eq("class_id", classId),
    ]);

  if (!membershipResult.data) redirect("/dashboard");
  if (membershipResult.data.role !== "admin") redirect(`/class/${classId}`);

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

  const currentProfile =
    profileById.get(user.id) ?? {
      id: user.id,
      email: user.email ?? "",
      full_name:
        (user.user_metadata?.full_name as string | undefined) ?? null,
      avatar_url: null,
    };

  const isCreator = course.created_by === user.id;

  return (
    <div className="min-h-dvh">
      <AppHeader profile={currentProfile}>
        <nav className="flex items-center gap-1 text-sm text-primary-foreground/80">
          <Link
            href="/dashboard"
            className="hidden transition-colors hover:text-primary-foreground sm:inline"
          >
            Dashboard
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
          <Link
            href={`/class/${classId}`}
            className="hidden max-w-40 truncate transition-colors hover:text-primary-foreground sm:inline"
          >
            {course.name}
          </Link>
          <ChevronRight className="hidden h-3.5 w-3.5 sm:inline" />
          <span className="truncate font-medium text-primary-foreground">Settings</span>
        </nav>
      </AppHeader>

      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Class settings</h1>
            <p className="text-sm text-muted-foreground">{course.name}</p>
          </div>
          <Button asChild variant="ghost" size="sm">
            <Link href={`/class/${classId}`}>
              <ArrowLeft />
              Back to board
            </Link>
          </Button>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Class details</CardTitle>
              <CardDescription>
                Update the name, description, and what members are allowed to
                do.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClassSettingsForm
                classId={classId}
                name={course.name}
                description={course.description}
                allowMemberTasks={course.allow_member_tasks}
                allowMemberEditTasks={course.allow_member_edit_tasks}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Invite link</CardTitle>
              <CardDescription>
                Share this link with your blockmates so they can join with one
                click. Anyone with the link can join, so regenerate the invite
                code if it leaks.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <InviteLink code={course.invite_code} />
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Invite code</span>
                  <InviteCode code={course.invite_code} />
                </div>
                <RegenerateInviteButton classId={classId} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Members</CardTitle>
              <CardDescription>
                Promote members to admin or remove them. The last admin cannot
                be demoted or removed.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MembersAdmin
                classId={classId}
                members={members}
                currentUserId={user.id}
              />
            </CardContent>
          </Card>

          <DeleteClassDialog
            classId={classId}
            className={course.name}
            canDelete={isCreator}
          />
        </div>
      </main>
    </div>
  );
}
