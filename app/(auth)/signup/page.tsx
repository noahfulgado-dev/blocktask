import type { Metadata } from "next";

import { SignupForm } from "@/components/auth/signup-form";
import { pageMetadata } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export const instant = false;

export const metadata: Metadata = pageMetadata({
  title: "Sign up",
  description:
    "Create a BlockTask account with your @cvsu.edu.ph email to start or join a block workspace.",
  path: "/signup",
  noIndex: true,
});

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const params = await searchParams;
  const next =
    params.next && params.next.startsWith("/") && !params.next.startsWith("//")
      ? params.next
      : "/dashboard";

  return <SignupForm next={next} configured={isSupabaseConfigured()} />;
}
