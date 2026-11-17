"use client";

import * as React from "react";
import Link from "next/link";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import { CVSU_EMAIL_DOMAIN, friendlyAuthError, isCvsuEmail } from "@/lib/utils";

export function SignupForm({
  next,
  configured,
}: {
  next?: string;
  configured: boolean;
}) {
  const safeNext =
    next && next.startsWith("/") && !next.startsWith("//")
      ? next
      : "/dashboard";
  const loginHref =
    safeNext === "/dashboard"
      ? "/login"
      : `/login?next=${encodeURIComponent(safeNext)}`;
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [submittedEmail, setSubmittedEmail] = React.useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!isCvsuEmail(email)) {
      setError(`Only @${CVSU_EMAIL_DOMAIN} emails are allowed.`);
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();
      const normalizedEmail = email.trim().toLowerCase();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
          data: { full_name: fullName.trim() },
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
            safeNext,
          )}`,
        },
      });

      if (signUpError) {
        const message = friendlyAuthError(signUpError.message);
        setError(message);
        toast.error(message);
        return;
      }

      if (!data.session) {
        setSubmittedEmail(normalizedEmail);
        toast.success("Account created. Check your email to confirm it.");
        return;
      }

      toast.success("Account created. Welcome to BlockTask!");
      window.location.replace(safeNext);
    } catch {
      setError("Could not reach Supabase. Check your connection and env keys.");
    } finally {
      setLoading(false);
    }
  }

  if (submittedEmail) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6 text-center dark:border-emerald-500/30 dark:bg-emerald-500/10">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-600 dark:text-emerald-400" />
        <h1 className="text-xl font-bold text-emerald-900 dark:text-emerald-200">
          Check your inbox
        </h1>
        <p className="text-sm text-emerald-800 dark:text-emerald-300">
          We sent a confirmation link to{" "}
          <span className="font-semibold">{submittedEmail}</span>. Open it to
          activate your account, then log in.
        </p>
        <Button asChild className="w-full">
          <Link href={loginHref}>Go to login</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight">Create your account</h1>
        <p className="text-sm text-muted-foreground">
          Use your CvSU email to join or start a block workspace.
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
          <Label htmlFor="fullName">Full name</Label>
          <Input
            id="fullName"
            autoComplete="name"
            placeholder="Juan Dela Cruz"
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">CvSU email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            placeholder={`juan.delacruz@${CVSU_EMAIL_DOMAIN}`}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
          />
          <p className="text-xs text-muted-foreground">
            Only @{CVSU_EMAIL_DOMAIN} addresses are accepted.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 6 characters"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm password</Label>
          <Input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat your password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || !configured}>
          {loading ? <Loader2 className="animate-spin" /> : null}
          Create account
        </Button>

        <p className="text-center text-xs leading-relaxed text-muted-foreground">
          By creating an account, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/terms-of-use"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Terms of Use
          </Link>
          .
        </p>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={loginHref} className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
