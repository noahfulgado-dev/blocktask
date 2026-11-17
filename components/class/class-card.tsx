import Link from "next/link";
import { ArrowUpRight, CircleDot, Users } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import type { MemberRole } from "@/lib/types";

export function ClassCard({
  id,
  name,
  description,
  role,
  memberCount,
  openTasks,
}: {
  id: string;
  name: string;
  description: string | null;
  role: MemberRole;
  memberCount: number;
  openTasks: number;
}) {
  return (
    <Link
      href={`/class/${id}`}
      className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="line-clamp-1 font-semibold">{name}</h3>
        <Badge variant={role === "admin" ? "default" : "secondary"}>
          {role === "admin" ? "Admin" : "Member"}
        </Badge>
      </div>

      <p className="mt-1.5 line-clamp-2 min-h-10 text-sm text-muted-foreground">
        {description?.trim() || "No description yet."}
      </p>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5">
            <Users className="h-3.5 w-3.5" />
            {memberCount} {memberCount === 1 ? "member" : "members"}
          </span>
          <span className="flex items-center gap-1.5">
            <CircleDot className="h-3.5 w-3.5" />
            {openTasks} open
          </span>
        </div>
        <ArrowUpRight className="h-4 w-4 opacity-0 transition-opacity group-hover:opacity-100" />
      </div>
    </Link>
  );
}
