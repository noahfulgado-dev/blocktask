import { cache } from "react";
import { connection } from "next/server";

import { createClient } from "@/lib/supabase/server";

export type InvitePreview = {
  id: string;
  name: string;
  description: string | null;
};

export type InviteLookup = {
  preview: InvitePreview | null;
  failed: boolean;
};

export function normalizeInviteCode(raw: string | undefined) {
  try {
    return decodeURIComponent(raw ?? "").trim().toUpperCase();
  } catch {
    return (raw ?? "").trim().toUpperCase();
  }
}

export const lookupInvite = cache(async (code: string): Promise<InviteLookup> => {
  if (!code) return { preview: null, failed: false };

  // The Supabase client reads the session, which is request-time data.
  await connection();

  const supabase = await createClient();

  const { data, error } = await supabase.rpc("preview_class_by_code", {
    p_code: code,
  });

  if (error) return { preview: null, failed: true };

  const rows = (data ?? []) as InvitePreview[];
  return { preview: rows[0] ?? null, failed: false };
});
