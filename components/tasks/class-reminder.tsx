"use client";

import * as React from "react";
import { Bell, Save } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createClient } from "@/lib/supabase/client";
import type { MemberRole } from "@/lib/types";

export function ClassReminder({
  classId,
  reminder,
  role,
  onChange,
}: {
  classId: string;
  reminder: string;
  role: MemberRole;
  onChange: (reminder: string) => void;
}) {
  const isAdmin = role === "admin";
  const [draft, setDraft] = React.useState(reminder);
  const [syncedReminder, setSyncedReminder] = React.useState(reminder);
  const [saving, setSaving] = React.useState(false);

  // Sync with live updates unless the admin has unsaved edits.
  if (reminder !== syncedReminder) {
    const wasClean = draft.trim() === syncedReminder.trim();
    setSyncedReminder(reminder);
    if (wasClean) {
      setDraft(reminder);
    }
  }

  const trimmed = draft.trim();
  const dirty = trimmed !== reminder.trim();
  const canSave = isAdmin && !saving && dirty;

  async function save() {
    if (!canSave) return;

    const previous = reminder;
    setSaving(true);
    onChange(trimmed);

    const supabase = createClient();
    const { error } = await supabase
      .from("classes")
      .update({ reminder: trimmed || null })
      .eq("id", classId);

    if (error) {
      onChange(previous);
      setDraft(previous);
      toast.error(error.message || "Could not save the reminder.");
      setSaving(false);
      return;
    }

    toast.success("Reminder saved.");
    setSaving(false);
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Bell className="h-4 w-4 text-muted-foreground" />
            Reminders
          </CardTitle>

          {isAdmin ? (
            <Button size="sm" onClick={save} disabled={!canSave}>
              <Save />
              {saving ? "Saving..." : "Save reminder"}
            </Button>
          ) : null}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {isAdmin ? (
          <div className="space-y-2">
            <Textarea
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
              placeholder="Add a reminder for your block..."
              maxLength={2000}
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Only admins can edit this. Changes appear live for everyone.
            </p>
          </div>
        ) : reminder.trim() ? (
          <p className="whitespace-pre-wrap text-sm text-muted-foreground">
            {reminder}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground">No reminders yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
