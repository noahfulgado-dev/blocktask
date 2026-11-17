import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { pageMetadata } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description:
    "Log in to BlockTask to see your block's shared task board and assignments.",
  path: "/login",
  noIndex: true,
});

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return (
    <LoginForm
      next={next}
      initialError={params.error}
      configured={isSupabaseConfigured()}
    />
  );
}
