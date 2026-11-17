"use client";

import * as React from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { friendlyAuthError, isCvsuEmail } from "@/lib/utils";

export function LoginForm({
  next,
  initialError,
  configured,
}: {
  next?: string;
  initialError?: string;
  configured: boolean;
}) {
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState(initialError ?? "");
  const [loading, setLoading] = React.useState(false);

  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!isCvsuEmail(email)) {
      setError("Use your @cvsu.edu.ph email address.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (signInError) {
        const message = friendlyAuthError(signInError.message);
        setError(message);
        toast.error(message);
        return;
      }

      window.location.replace(safeNext);
    } catch {
      setError("Could not reach Supabase. Check your connection and env keys.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Log in to see your block&apos;s task board.
        </p>
      </div>

      {!configured ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
          Supabase is not connected yet. Add your project keys to{" "}
          <code className="font-semibold">.env.local</code> first.
        </p>
      ) : null}

      {error ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {error}
        </p>
      ) : null}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">CvSU email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder="juan.delacruz@cvsu.edu.ph"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            placeholder="Your password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || !configured}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          Log in
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        No account yet?{" "}
        <Link
          href={
            safeNext === "/dashboard"
              ? "/signup"
              : `/signup?next=${encodeURIComponent(safeNext)}`
          }
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </p>
    </div>
  );
}
