import Link from "next/link";
import { ArrowRight, LayoutGrid } from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { FeatureShowcase } from "@/components/landing/feature-showcase";
import { HeroPreview } from "@/components/landing/hero-preview";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export default function LandingPage() {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-dvh flex-col">
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          <LogoMark className="h-8 w-8" />
          BlockTask
        </Link>

        <nav className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Log in</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/signup">Sign up</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="bg-hero border-y border-border">
          <div className="mx-auto grid w-full max-w-6xl gap-10 px-6 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-6">
              <h1 className="text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
                Your block&apos;s tasks,
                <br />
                finally in one place.
              </h1>

              <p className="max-w-xl text-lg text-muted-foreground">
                BlockTask is a shared task board for your section. Create a
                class, invite your blockmates with a code, and stop hunting
                through group chats for requirements and deadlines.
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Create your block
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>

              <p className="text-sm text-muted-foreground">
                Sign-up is limited to emails ending in{" "}
                <span className="font-semibold text-foreground">
                  @cvsu.edu.ph
                </span>
                .
              </p>

              {!configured ? (
                <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300">
                  Supabase is not connected yet. Follow{" "}
                  <span className="font-semibold">SETUP-SUPABASE.md</span> and
                  add your keys to <code>.env.local</code> to enable login.
                </p>
              ) : null}
            </div>

            <HeroPreview />
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-6 py-20">
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground">
                <LayoutGrid className="h-3.5 w-3.5 text-primary" />
                Built for blocks
              </span>
              <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                Everything your block needs.
              </h2>
            </div>
            <p className="max-w-sm text-sm text-muted-foreground sm:text-right">
              Hover or tap a block to explore how BlockTask keeps your section in
              sync.
            </p>
          </div>

          <FeatureShowcase />
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-6 text-sm text-muted-foreground">
          <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
            <span>BlockTask — a shared task board for blocks and sections.</span>
            <nav className="flex items-center gap-4">
              <Link
                href="/terms-of-service"
                className="transition-colors hover:text-foreground hover:underline"
              >
                Terms of Service
              </Link>
              <Link
                href="/terms-of-use"
                className="transition-colors hover:text-foreground hover:underline"
              >
                Terms of Use
              </Link>
            </nav>
          </div>
          <p className="max-w-2xl text-xs leading-relaxed">
            Made for Cavite State University students. BlockTask is an
            independent project and is not associated with, affiliated with, or
            endorsed by Cavite State University.
          </p>
        </div>
      </footer>
    </div>
  );
}
