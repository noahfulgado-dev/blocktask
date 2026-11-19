"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, MemberRole } from "@/lib/types";

function revalidateClass(classId: string) {
  revalidatePath("/dashboard");
  revalidatePath(`/class/${classId}`);
  revalidatePath(`/class/${classId}/settings`);
}

export async function setMemberRoleAction(input: {
  classId: string;
  userId: string;
  role: MemberRole;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth?.claims) {
    return { ok: false, error: "You need to be logged in." };
  }

  const { error } = await supabase.rpc("set_member_role", {
    p_class_id: input.classId,
    p_user_id: input.userId,
    p_role: input.role,
  });

  if (error) {
    return {
      ok: false,
      error: /last admin/i.test(error.message)
        ? "You cannot demote the last admin of this class."
        : error.message,
    };
  }

  revalidateClass(input.classId);
  return { ok: true, message: "Member role updated." };
}

export async function removeMemberAction(input: {
  classId: string;
  userId: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth?.claims) {
    return { ok: false, error: "You need to be logged in." };
  }

  const { error } = await supabase.rpc("remove_member", {
    p_class_id: input.classId,
    p_user_id: input.userId,
  });

  if (error) {
    return {
      ok: false,
      error: /last admin/i.test(error.message)
        ? "You cannot remove the last admin of this class."
        : error.message,
    };
  }

  revalidateClass(input.classId);
  return { ok: true, message: "Member removed." };
}

export async function leaveClassAction(
  classId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();

  if (!auth?.claims) {
    return { ok: false, error: "You need to be logged in." };
  }

  const { error } = await supabase.rpc("remove_member", {
    p_class_id: classId,
    p_user_id: auth.claims.sub,
  });

  if (error) {
    return {
      ok: false,
      error: /last admin/i.test(error.message)
        ? "You are the last admin. Promote someone else before leaving."
        : error.message,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/class/${classId}`);
  return { ok: true, message: "You left the class." };
}
