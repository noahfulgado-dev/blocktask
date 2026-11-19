import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";
import type { MemberRole } from "@/lib/types";

export type SessionUser = {
  id: string;
  email: string | null;
  user_metadata: Record<string, unknown>;
};

type SupabaseServerClient = Awaited<ReturnType<typeof createClient>>;

type AuthContext = {
  user: SessionUser | null;
  supabase: SupabaseServerClient;
};

function toSessionUser(claims: {
  sub?: string;
  email?: unknown;
  user_metadata?: unknown;
}): SessionUser | null {
  if (!claims.sub) return null;

  return {
    id: claims.sub,
    email: typeof claims.email === "string" ? claims.email : null,
    user_metadata:
      claims.user_metadata && typeof claims.user_metadata === "object"
        ? (claims.user_metadata as Record<string, unknown>)
        : {},
  };
}

/**
 * Reads the session once per request. `getClaims()` verifies the JWT locally
 * against the cached JWKS for asymmetric signing keys, which is much faster
 * than `getUser()` (one Auth server roundtrip per call).
 */
export const getAuthContext = cache(async (): Promise<AuthContext> => {
  // Reading the session verifies a JWT and compares its expiry against the
  // current time, so it must run per request instead of during prerendering.
  await connection();

  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const user = data?.claims ? toSessionUser(data.claims) : null;

  return { user, supabase };
});

export async function getSessionUser() {
  return (await getAuthContext()).user;
}

export async function requireAuthContext() {
  const context = await getAuthContext();
  if (!context.user) redirect("/login");
  return context as AuthContext & { user: SessionUser };
}

export async function requireUser() {
  return (await requireAuthContext()).user;
}

export async function requireClassMember(classId: string) {
  const { user, supabase } = await requireAuthContext();

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
