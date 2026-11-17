import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AlertCircle, ListTodo } from "lucide-react";

import { JoinClassButton } from "@/components/class/join-class-button";
import { AppHeader } from "@/components/layout/app-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type { Profile } from "@/lib/types";

export const instant = false;

export const metadata: Metadata = {
  title: "Join a class — BlockTask",
};

type Preview = {
  id: string;
  name: string;
  description: string | null;
};

export default async function JoinPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = decodeURIComponent(rawCode ?? "").trim().toUpperCase();

  const user = await requireUser();
  const supabase = await createClient();

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", user.id)
    .maybeSingle();

  const currentProfile: Pick<Profile, "email" | "full_name"> = profileRow ?? {
    email: user.email ?? "",
    full_name: (user.user_metadata?.full_name as string | undefined) ?? null,
  };

  const configured = isSupabaseConfigured();

  let preview: Preview | null = null;
  let lookupFailed = false;

  if (configured && code) {
    const { data, error } = await supabase.rpc("preview_class_by_code", {
      p_code: code,
    });

    if (error) {
      lookupFailed = true;
    } else {
      const rows = (data ?? []) as Preview[];
      preview = rows[0] ?? null;
    }
  }

  if (preview) {
    const { data: membership } = await supabase
      .from("class_members")
      .select("user_id")
      .eq("class_id", preview.id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (membership) {
      redirect(`/class/${preview.id}`);
    }
  }

  return (
    <div className="min-h-dvh">
      <AppHeader profile={currentProfile} />

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
                <Link href="/dashboard">Back to dashboard</Link>
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
                <Link href="/dashboard">Back to dashboard</Link>
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
                  "You were invited to this class workspace."}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              <div className="rounded-lg border border-border bg-muted/60 px-3 py-2 text-center text-xs text-muted-foreground">
                Invite code{" "}
                <span className="font-mono font-semibold tracking-widest text-foreground">
                  {code}
                </span>
              </div>

              <JoinClassButton code={code} />

              <Button asChild variant="ghost" className="w-full">
                <Link href="/dashboard">Not now</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
}
