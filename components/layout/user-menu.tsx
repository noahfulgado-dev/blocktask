"use client";

import * as React from "react";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { LogOut, User } from "lucide-react";
import { toast } from "sonner";

import { Avatar } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";

export function UserMenu({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const [signingOut, setSigningOut] = React.useState(false);

  async function handleSignOut() {
    if (signingOut) return;
    setSigningOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) {
        toast.error("Could not log out. Please try again.");
        setSigningOut(false);
        return;
      }

      window.location.replace("/login");
    } catch {
      toast.error("Could not log out. Please try again.");
      setSigningOut(false);
    }
  }

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger className="flex items-center gap-2 rounded-full outline-none ring-offset-2 ring-offset-primary focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar name={name} seed={email} />
        <span className="sr-only">Open account menu</span>
      </DropdownMenu.Trigger>

      <DropdownMenu.Portal>
        <DropdownMenu.Content
          align="end"
          sideOffset={8}
          className="z-50 w-60 rounded-xl border border-border bg-card p-1.5 text-card-foreground shadow-lg"
        >
          <div className="flex items-center gap-2 rounded-lg px-2 py-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
              <User className="h-4 w-4 text-muted-foreground" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{email}</p>
            </div>
          </div>

          <div className="my-1 h-px bg-border" />

          <DropdownMenu.Item
            disabled={signingOut}
            onSelect={() => {
              void handleSignOut();
            }}
            className="flex w-full cursor-pointer items-center gap-2 rounded-lg px-2 py-2 text-sm font-medium text-foreground outline-none transition-colors data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 hover:bg-muted focus-visible:bg-muted"
          >
            <LogOut className="h-4 w-4" />
            {signingOut ? "Logging out..." : "Log out"}
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Portal>
    </DropdownMenu.Root>
  );
}
