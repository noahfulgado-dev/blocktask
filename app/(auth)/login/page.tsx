import { Suspense } from "react";
import type { Metadata } from "next";

import { LoginForm } from "@/components/auth/login-form";
import { pageMetadata } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = pageMetadata({
  title: "Log in",
  description:
    "Log in to BlockTask to see your block's shared task board and assignments.",
  path: "/login",
  noIndex: true,
});

type LoginSearchParams = Promise<{ next?: string; error?: string }>;

export default function LoginPage({
  searchParams,
}: {
  searchParams: LoginSearchParams;
}) {
  return (
    <Suspense
      fallback={
        <LoginForm next="/dashboard" configured={isSupabaseConfigured()} />
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({
  searchParams,
}: {
  searchParams: LoginSearchParams;
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
