import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <aside className="relative hidden flex-col justify-between bg-slate-950 p-10 text-slate-100 lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(13,148,136,0.35),transparent_55%)]" />

        <Link href="/" className="relative flex items-center gap-2 text-lg font-semibold">
          <LogoMark mono className="h-8 w-8" />
          BlockTask
        </Link>

        <div className="relative space-y-6">
          <h2 className="max-w-md text-3xl font-bold leading-tight">
            Every task for your block, visible to everyone who needs it.
          </h2>
          <ul className="space-y-3 text-sm text-slate-300">
            {[
              "Locked to @cvsu.edu.ph accounts",
              "One workspace per block or section",
              "Admins can delegate and manage members",
              "Tasks update live for the whole class",
            ].map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-slate-500">
          Made for Cavite State University students.
          <span className="mt-1 block">
            BlockTask is an independent project and is not associated with,
            affiliated with, or endorsed by Cavite State University.
          </span>
        </p>
      </aside>

      <main className="flex flex-col px-6 py-8">
        <div className="flex items-center justify-between lg:justify-end">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:hidden"
          >
            <ArrowLeft className="h-4 w-4" />
            Home
          </Link>
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground lg:inline-flex"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
          <ThemeToggle />
        </div>

        <div className="flex flex-1 items-center justify-center py-8">
          <div className="w-full max-w-sm">{children}</div>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          By continuing, you agree to our{" "}
          <Link
            href="/terms-of-service"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link
            href="/terms-of-use"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Terms of Use
          </Link>
          .
        </p>

        <p className="mt-2 text-center text-xs text-muted-foreground lg:hidden">
          BlockTask is an independent project and is not associated with,
          affiliated with, or endorsed by Cavite State University.
        </p>
      </main>
    </div>
  );
}
