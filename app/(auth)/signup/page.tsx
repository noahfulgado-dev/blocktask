import { Suspense } from "react";
import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { pageMetadata } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const metadata: Metadata = pageMetadata({
  title: "Sign up",
  description:
    "Create a BlockTask account with your @cvsu.edu.ph email to start or join a block workspace.",
  path: "/signup",
  noIndex: true,
});

type SignupSearchParams = Promise<{ next?: string }>;

export default function SignupPage({
  searchParams,
}: {
  searchParams: SignupSearchParams;
}) {
  return (
    <Suspense
      fallback={
        <SignupForm next="/dashboard" configured={isSupabaseConfigured()} />
      }
    >
      <SignupContent searchParams={searchParams} />
    </Suspense>
  );
}

async function SignupContent({
  searchParams,
}: {
  searchParams: SignupSearchParams;
}) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return <SignupForm next={next} configured={isSupabaseConfigured()} />;
}
