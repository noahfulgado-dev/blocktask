export type MemberRole = "admin" | "member";
export type TaskStatus = "pending" | "in_progress" | "done";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at?: string;
  updated_at?: string;
};

export type ClassRow = {
  id: string;
  name: string;
  description: string | null;
  reminder: string | null;
  invite_code: string;
  created_by: string;
  allow_member_tasks: boolean;
  allow_member_edit_tasks: boolean;
  created_at: string;
  updated_at?: string;
};

export type ClassWithRole = ClassRow & {
  role: MemberRole;
};

export type ClassMember = {
  id: string;
  class_id: string;
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile: Profile | null;
};

export type MemberWithProfile = {
  user_id: string;
  role: MemberRole;
  joined_at: string;
  profile: Profile | null;
};

export type Task = {
  id: string;
  class_id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assigned_to: string | null;
  due_date: string | null;
  created_by: string;
  auto_completed: boolean;
  created_at: string;
  updated_at: string;
};

export type TaskCompletion = {
  task_id: string;
  user_id: string;
  class_id: string;
  completed_at: string;
};

export type ActionResult =
  | { ok: true; classId?: string; message?: string }
  | { ok: false; error: string };
