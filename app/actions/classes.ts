"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";
import type { ActionResult, ClassRow } from "@/lib/types";

function normalizeClassRow(data: unknown): ClassRow | null {
  if (!data) return null;
  if (Array.isArray(data)) return (data[0] as ClassRow) ?? null;
  return data as ClassRow;
}

export type CreateClassInput = {
  name: string;
  description?: string;
  allowMemberTasks?: boolean;
  allowMemberEditTasks?: boolean;
};

export async function createClassAction(
  input: CreateClassInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be logged in." };

  const name = input.name?.trim() ?? "";
  if (!name) return { ok: false, error: "Class name is required." };
  if (name.length > 120) {
    return { ok: false, error: "Class name must be 120 characters or fewer." };
  }

  const description = (input.description ?? "").trim();

  const { data, error } = await supabase.rpc("create_class", {
    p_name: name,
    p_description: description || null,
    p_allow_member_tasks: input.allowMemberTasks ?? true,
    p_allow_member_edit_tasks: input.allowMemberEditTasks ?? false,
  });

  if (error) return { ok: false, error: error.message };

  const created = normalizeClassRow(data);
  if (!created) {
    return { ok: false, error: "Class was created but could not be loaded." };
  }

  revalidatePath("/dashboard");
  return { ok: true, classId: created.id };
}

export async function joinClassAction(code: string): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be logged in." };

  const trimmed = code?.trim() ?? "";
  if (!trimmed) return { ok: false, error: "Enter an invite code." };

  const { data, error } = await supabase.rpc("join_class_by_code", {
    p_code: trimmed,
  });

  if (error) {
    return {
      ok: false,
      error:
        /invalid invite code/i.test(error.message)
          ? "That invite code is not valid."
          : error.message,
    };
  }

  const joined = normalizeClassRow(data);
  if (!joined) {
    return { ok: false, error: "Could not join this class." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/class/${joined.id}`);
  return { ok: true, classId: joined.id };
}

export type UpdateClassInput = {
  classId: string;
  name: string;
  description?: string;
  allowMemberTasks: boolean;
  allowMemberEditTasks: boolean;
};

export async function updateClassAction(
  input: UpdateClassInput,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be logged in." };

  const name = input.name?.trim() ?? "";
  if (!name) return { ok: false, error: "Class name is required." };
  if (name.length > 120) {
    return { ok: false, error: "Class name must be 120 characters or fewer." };
  }

  const { data, error } = await supabase
    .from("classes")
    .update({
      name,
      description: (input.description ?? "").trim() || null,
      allow_member_tasks: input.allowMemberTasks,
      allow_member_edit_tasks: input.allowMemberEditTasks,
    })
    .eq("id", input.classId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) {
    return { ok: false, error: "Class not found or you are not an admin." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/class/${input.classId}`);
  revalidatePath(`/class/${input.classId}/settings`);
  return { ok: true, message: "Class settings updated." };
}

export async function deleteClassAction(
  classId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be logged in." };

  const { data, error } = await supabase
    .from("classes")
    .delete()
    .eq("id", classId)
    .select("id")
    .maybeSingle();

  if (error) return { ok: false, error: error.message };
  if (!data) {
    return {
      ok: false,
      error: "Only the class creator can delete this class.",
    };
  }

  revalidatePath("/dashboard");
  return { ok: true, message: "Class deleted." };
}

export async function regenerateInviteCodeAction(
  classId: string,
): Promise<ActionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, error: "You need to be logged in." };

  const { data, error } = await supabase.rpc("regenerate_invite_code", {
    p_class_id: classId,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/class/${classId}`);
  revalidatePath(`/class/${classId}/settings`);

  return {
    ok: true,
    message: `New invite code: ${typeof data === "string" ? data : "updated"}`,
  };
}
