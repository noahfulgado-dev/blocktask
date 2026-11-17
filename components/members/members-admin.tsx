"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import {
  removeMemberAction,
  setMemberRoleAction,
} from "@/app/actions/members";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MemberRole, MemberWithProfile } from "@/lib/types";
import { displayName } from "@/lib/utils";

export function MembersAdmin({
  classId,
  members,
  currentUserId,
}: {
  classId: string;
  members: MemberWithProfile[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [pendingUserId, setPendingUserId] = React.useState<string | null>(null);
  const [removing, setRemoving] =
    React.useState<MemberWithProfile | null>(null);
  const [pendingRemove, setPendingRemove] = React.useState(false);

  const sorted = [...members].sort((a, b) => {
    if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
    return displayName(a.profile).localeCompare(displayName(b.profile));
  });

  async function handleRoleChange(
    member: MemberWithProfile,
    role: MemberRole,
  ) {
    if (role === member.role) return;
    setPendingUserId(member.user_id);

    try {
      const result = await setMemberRoleAction({
        classId,
        userId: member.user_id,
        role,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Member role updated.");
      router.refresh();
    } finally {
      setPendingUserId(null);
    }
  }

  async function handleRemove() {
    if (!removing) return;
    setPendingRemove(true);

    try {
      const result = await removeMemberAction({
        classId,
        userId: removing.user_id,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }

      toast.success("Member removed.");
      setRemoving(null);
      router.refresh();
    } finally {
      setPendingRemove(false);
    }
  }

  return (
    <div className="space-y-1">
      {sorted.map((member) => {
        const name = displayName(member.profile);
        const isYou = member.user_id === currentUserId;
        const busy = pendingUserId === member.user_id;

        return (
          <div
            key={member.user_id}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-border bg-card px-3 py-2.5"
          >
            <Avatar
              name={name}
              seed={member.user_id}
              className="h-8 w-8 text-[10px]"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {name}
                {isYou ? (
                  <span className="ml-1 text-xs font-normal text-muted-foreground">
                    (you)
                  </span>
                ) : null}
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {member.profile?.email ?? ""}
              </p>
            </div>

            <select
              aria-label={`Role for ${name}`}
              value={member.role}
              onChange={(event) =>
                handleRoleChange(member, event.target.value as MemberRole)
              }
              disabled={isYou || busy}
              className="h-8 rounded-lg border border-input bg-card px-2 text-xs font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-60"
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </select>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-red-600"
              onClick={() => setRemoving(member)}
              disabled={isYou || busy}
              aria-label={`Remove ${name}`}
            >
              {busy ? (
                <Loader2 className="animate-spin" />
              ) : (
                <Trash2 />
              )}
            </Button>
          </div>
        );
      })}

      <Dialog
        open={Boolean(removing)}
        onOpenChange={(open) => {
          if (!open) setRemoving(null);
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Remove member?</DialogTitle>
            <DialogDescription>
              {removing
                ? `${displayName(removing.profile)} will lose access to this class and its task board. They can rejoin later with the invite code.`
                : ""}
            </DialogDescription>
          </DialogHeader>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRemoving(null)}
              disabled={pendingRemove}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={handleRemove}
              disabled={pendingRemove}
            >
              {pendingRemove ? <Loader2 className="animate-spin" /> : null}
              Remove member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
