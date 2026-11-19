import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ListTodo } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { JoinClassButton } from "@/components/class/join-class-button";
import { AppHeader } from "@/components/layout/app-header";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getAuthContext } from "@/lib/auth";
import {
  lookupInvite,
  normalizeInviteCode,
} from "@/lib/class-invite";
import { pageMetadata } from "@/lib/site";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile } from "@/lib/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code: rawCode } = await params;
  const code = normalizeInviteCode(rawCode);
  const { preview } = await lookupInvite(code);
  const className = preview?.name?.trim();
  const title = className ? `Join ${className}` : "Join a class";
  const description =
    preview?.description?.trim() ||
    (className
      ? `You're invited to join ${className} on BlockTask. Invite code ${code}.`
      : `You're invited to join a class workspace on BlockTask. Invite code ${code || "from your class admin"}.`);

  return pageMetadata({
    title,
    description,
    path: `/join/${code}`,
    noIndex: true,
    imagePath: `/join/${encodeURIComponent(code)}/opengraph-image`,
    twitterImagePath: `/join/${encodeURIComponent(code)}/twitter-image`,
  });
}

export default function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  return (
    <Suspense fallback={<JoinPageSkeleton />}>
      <JoinContent params={params} />
    </Suspense>
  );
}

function JoinPageSkeleton() {
  return (
    <div className="min-h-dvh">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between gap-4 px-4">
          <div className="h-7 w-28 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 py-16">
        <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      </main>
    </div>
  );
}

async function JoinContent({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = normalizeInviteCode(rawCode);
  const [{ user, supabase }, { preview, failed: lookupFailed }] =
    await Promise.all([getAuthContext(), lookupInvite(code)]);
  const configured = isSupabaseConfigured();

  let currentProfile: Pick<Profile, "email" | "full_name"> | null = null;

  if (user) {
    const [{ data: profileRow }, { data: membership }] = await Promise.all([
      supabase
        .from("profiles")
        .select("email, full_name")
        .eq("id", user.id)
        .maybeSingle(),
      preview
        ? supabase
            .from("class_members")
            .select("user_id")
            .eq("class_id", preview.id)
            .eq("user_id", user.id)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ]);

    currentProfile = profileRow ?? {
      email: user.email ?? "",
      full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
    };

    if (membership && preview) {
      redirect(`/class/${preview.id}`);
    }
  }

  const joinPath = `/join/${code}`;
  const loginHref = `/login?next=${encodeURIComponent(joinPath)}`;
  const signupHref = `/signup?next=${encodeURIComponent(joinPath)}`;

  return (
    <div className="min-h-dvh">
      {currentProfile ? (
        <AppHeader profile={currentProfile} />
      ) : (
        <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
          <div className="mx-auto flex h-16 w-full max-w-lg items-center justify-between gap-4 px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <LogoMark className="h-7 w-7" />
              BlockTask
            </Link>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button asChild variant="ghost" size="sm">
                <Link href={loginHref}>Log in</Link>
              </Button>
              <Button asChild size="sm">
                <Link href={signupHref}>Sign up</Link>
              </Button>
            </div>
          </div>
        </header>
      )}

      <main className="mx-auto flex w-full max-w-lg flex-col justify-center px-4 py-16">
        {!configured ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-amber-500" />
                Supabase not connected
              </CardTitle>
              <CardDescription>
                Add your project keys to <code>.env.local</code> to preview and
                join classes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="outline" className="w-full">
                <Link href={user ? "/dashboard" : "/"}>
                  {user ? "Back to dashboard" : "Back to home"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : !preview ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                {lookupFailed ? "Could not check this invite" : "Invite not found"}
              </CardTitle>
              <CardDescription>
                {lookupFailed
                  ? "Something went wrong while checking the invite code. Please try again."
                  : `The code "${code}" is not valid. Ask your class admin for the current invite code.`}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button asChild className="w-full">
                <Link href={user ? "/dashboard" : "/"}>
                  {user ? "Back to dashboard" : "Back to home"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="items-center text-center">
              <span className="mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-accent text-accent-foreground">
                <ListTodo className="h-6 w-6" />
              </span>
              <CardTitle className="text-xl">
                Join {preview.name}
              </CardTitle>
              <CardDescription>
                {preview.description?.trim() ||
                  (user
                    ? "You were invited to this class workspace."
                    : "You were invited to this class workspace. Log in or create an account with your CvSU email to join.")}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
                Invite code{" "}
                <span className="font-mono font-semibold tracking-widest text-foreground">
                  {code}
                </span>
              </div>

              {user ? (
                <JoinClassButton code={code} />
              ) : (
                <div className="flex flex-col gap-2">
                  <Button asChild size="lg" className="w-full">
                    <Link href={loginHref}>Log in to join</Link>
                  </Button>
                  <Button asChild size="lg" variant="outline" className="w-full">
                    <Link href={signupHref}>Create an account</Link>
                  </Button>
                </div>
              )}

              <Button asChild variant="ghost" className="w-full">
                <Link href={user ? "/dashboard" : "/"}>
                  {user ? "Not now" : "Back to home"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
