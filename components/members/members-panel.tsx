import { LeaveClassButton } from "@/components/class/leave-class-button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { MemberWithProfile } from "@/lib/types";
import { displayName } from "@/lib/utils";

export function MembersPanel({
  classId,
  members,
  currentUserId,
}: {
  classId: string;
  members: MemberWithProfile[];
  currentUserId: string;
}) {
  const sorted = [...members].sort((a, b) => {
    if (a.role !== b.role) return a.role === "admin" ? -1 : 1;
    return displayName(a.profile).localeCompare(displayName(b.profile));
  });

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Members</CardTitle>
          <Badge variant="secondary">{members.length}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-1 pt-0">
        {sorted.map((member) => {
          const name = displayName(member.profile);
          const isYou = member.user_id === currentUserId;

          return (
            <div
              key={member.user_id}
              className="flex items-center gap-2.5 rounded-lg px-1.5 py-1.5"
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
              <Badge
                variant={member.role === "admin" ? "default" : "secondary"}
              >
                {member.role}
              </Badge>
            </div>
          );
        })}

        <div className="pt-2">
          <LeaveClassButton classId={classId} className="w-full justify-start" />
        </div>
      </CardContent>
    </Card>
  );
}
