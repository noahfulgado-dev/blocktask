import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { ThemeToggle } from "@/components/theme-toggle";

export function LegalDocument({
  title,
  updated,
  summary,
  otherDocument,
  children,
}: {
  title: string;
  updated: string;
  summary: string;
  otherDocument: { href: string; label: string; description: string };
  children: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-border bg-card">
        <div className="flex w-full items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <LogoMark className="h-7 w-7" />
            BlockTask
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Last updated: {updated}
        </p>

        <p className="mt-6 rounded-xl border border-border bg-muted/30 p-4 text-sm leading-relaxed text-muted-foreground">
          {summary}
        </p>

        <div className="mt-10 space-y-9">{children}</div>

        <Link
          href={otherDocument.href}
          className="mt-12 flex items-center justify-between gap-4 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/40 hover:bg-accent"
        >
          <span className="min-w-0">
            <span className="block text-sm font-semibold">
              {otherDocument.label}
            </span>
            <span className="mt-1 block text-sm text-muted-foreground">
              {otherDocument.description}
            </span>
          </span>
          <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground" />
        </Link>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto w-full max-w-3xl px-4 py-6 text-center text-xs text-muted-foreground sm:px-6">
          BlockTask is an independent student project and is not associated
          with, affiliated with, or endorsed by Cavite State University.
        </div>
      </footer>
    </div>
  );
}

export function LegalSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h2>
      <div className="space-y-3 text-sm leading-relaxed text-muted-foreground">
        {children}
      </div>
    </section>
  );
}

export function LegalList({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1.5 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}
