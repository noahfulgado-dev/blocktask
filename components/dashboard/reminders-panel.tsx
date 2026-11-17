import Link from "next/link";
import { Bell } from "lucide-react";

import { RelativeTime } from "@/components/time/relative-time";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type ReminderItem = {
  classId: string;
  className: string;
  reminder: string;
  updatedAt: string | null;
  openTasks: number;
};

export function RemindersPanel({ reminders }: { reminders: ReminderItem[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Reminders
          </CardTitle>
          {reminders.length > 0 ? (
            <Badge variant="secondary">{reminders.length}</Badge>
          ) : null}
        </div>
        <CardDescription>
          Pending and recent reminders across your classes.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        {reminders.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border px-3 py-8 text-center">
            <p className="text-sm text-muted-foreground">
              No reminders right now.
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Class admins can post notes on each board.
            </p>
          </div>
        ) : (
          <ul className="space-y-2.5">
            {reminders.map((item) => (
              <li key={item.classId}>
                <Link
                  href={`/class/${item.classId}`}
                  className="block rounded-lg border border-border bg-muted/30 p-3 transition-colors hover:border-primary/40 hover:bg-accent"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-sm font-medium">
                      {item.className}
                    </span>
                    {item.openTasks > 0 ? (
                      <Badge variant="warning" className="shrink-0">
                        {item.openTasks} open
                      </Badge>
                    ) : (
                      <Badge variant="success" className="shrink-0">
                        Clear
                      </Badge>
                    )}
                  </div>

                  <p className="mt-1 line-clamp-3 whitespace-pre-wrap text-sm text-muted-foreground">
                    {item.reminder}
                  </p>

                  <p className="mt-1.5 text-xs text-muted-foreground">
                    <RelativeTime value={item.updatedAt} fallback="Recently" />
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
