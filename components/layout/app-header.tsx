import type { ReactNode } from "react";
import Link from "next/link";

import { LogoMark } from "@/components/brand/logo";
import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { displayName } from "@/lib/utils";
import type { Profile } from "@/lib/types";

export function AppHeader({
  profile,
  children,
}: {
  profile: Pick<Profile, "email" | "full_name">;
  children?: ReactNode;
}) {
  const name = displayName({
    email: profile.email,
    full_name: profile.full_name,
  });

  return (
    <header className="sticky top-0 z-40 border-b border-primary-foreground/20 bg-primary text-primary-foreground shadow-sm">
      <div className="flex h-16 w-full items-center justify-between gap-4 px-4 sm:px-6 lg:px-8 2xl:px-12">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex shrink-0 items-center gap-2 font-semibold text-primary-foreground"
          >
            <LogoMark mono className="h-8 w-8" />
            <span className="hidden sm:inline">BlockTask</span>
          </Link>
          {children ? (
            <div className="min-w-0 border-l border-primary-foreground/25 pl-3">
              {children}
            </div>
          ) : null}
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle className="border-primary-foreground/25 bg-primary-foreground/10 text-primary-foreground hover:bg-primary-foreground/20" />
          <UserMenu name={name} email={profile.email} />
        </div>
      </div>
    </header>
  );
}
