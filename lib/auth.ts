import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/types";

export async function getSessionUser() {
  await connection();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user;
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}

export async function requireClassMember(classId: string) {
  const user = await requireUser();
  const supabase = await createClient();

  const { data: membership } = await supabase
    .from("class_members")
    .select("role")
    .eq("class_id", classId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership) {
    redirect("/dashboard");
  }

  return {
    user,
    supabase,
    role: membership.role as MemberRole,
  };
}

export async function requireClassAdmin(classId: string) {
  const result = await requireClassMember(classId);

  if (result.role !== "admin") {
    redirect(`/class/${classId}`);
  }

  return result;
}
