"use client";

import { useState } from "react";
import {
  Check,
  Crown,
  ListTodo,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function AccessVisual() {
  return (
    <div className="relative mt-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative flex flex-col items-center gap-2">
        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <span className="rounded-full border border-border bg-card px-3 py-1 font-mono text-[11px] font-medium">
          @cvsu.edu.ph
        </span>
      </div>
    </div>
  );
}

function BoardVisual() {
  const tasks = ["Finalize proposal", "Review activity", "Print manual"];

  return (
    <div className="relative mt-4 flex h-32 items-center justify-center gap-4 overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="absolute h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
      <LogoMark className="relative h-14 w-14" />
      <div className="relative space-y-1.5">
        {tasks.map((task, index) => (
          <div key={task} className="flex items-center gap-2">
            <span
              className={cn(
                "flex h-4 w-4 items-center justify-center rounded border",
                index === 1
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input",
              )}
            >
              {index === 1 ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className="text-[11px] text-muted-foreground">{task}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function RolesVisual() {
  return (
    <div className="relative mt-4 flex h-32 flex-col items-center justify-center gap-3 overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="flex -space-x-3">
        {["Kai Reyes", "Maya Cruz", "Jose Lim"].map((name) => (
          <Avatar
            key={name}
            name={name}
            className="h-10 w-10 border-2 border-card text-[11px]"
          />
        ))}
        <span className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-card bg-muted text-[11px] font-semibold text-muted-foreground">
          +4
        </span>
      </div>
      <Badge className="gap-1 px-2 py-0 text-[10px]">
        <Crown className="h-3 w-3" />
        Admin controls
      </Badge>
    </div>
  );
}

function LiveVisual() {
  return (
    <div className="relative mt-4 flex h-32 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted/40">
      <div className="relative flex h-16 w-16 items-center justify-center">
        <span className="absolute inset-0 rounded-full border border-primary/30 motion-safe:animate-ping" />
        <span className="absolute h-10 w-10 rounded-full bg-primary/15" />
        <Zap className="relative h-5 w-5 text-primary" />
      </div>
      <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 text-[10px] font-medium text-muted-foreground">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        instant
      </span>
    </div>
  );
}

const features = [
  {
    id: "access",
    icon: ShieldCheck,
    title: "CvSU students only",
    description:
      "Sign-ups are locked to @cvsu.edu.ph emails by a server-side Supabase auth hook.",
    accent:
      "bg-teal-100 text-teal-700 dark:bg-teal-500/15 dark:text-teal-300",
    visual: <AccessVisual />,
  },
  {
    id: "board",
    icon: ListTodo,
    title: "One shared board",
    description:
      "Every requirement, deadline, and group task for your block in a single place.",
    accent:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300",
    visual: <BoardVisual />,
  },
  {
    id: "roles",
    icon: Users,
    title: "Roles that make sense",
    description:
      "Admins manage members and settings. Members can add tasks when allowed.",
    accent:
      "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300",
    visual: <RolesVisual />,
  },
  {
    id: "live",
    icon: Zap,
    title: "Live updates",
    description:
      "New tasks appear instantly for everyone in the class through Supabase Realtime.",
    accent:
      "bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300",
    visual: <LiveVisual />,
  },
] as const;

export function FeatureShowcase() {
  const [active, setActive] = useState(0);

  return (
    <div className="flex flex-col gap-3 lg:h-[380px] lg:flex-row">
      {features.map((feature, index) => {
        const isActive = index === active;
        const Icon = feature.icon;

        return (
          <div
            key={feature.id}
            onMouseEnter={() => setActive(index)}
            className={cn(
              "group relative overflow-hidden rounded-2xl border bg-card transition-all duration-500 ease-out",
              isActive
                ? "border-primary/40 shadow-lg lg:flex-[2.6]"
                : "border-border shadow-sm lg:flex-[1]",
            )}
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent transition-opacity duration-300",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            <span className="pointer-events-none absolute bottom-3 right-4 text-6xl font-black leading-none text-muted-foreground/10">
              {String(index + 1).padStart(2, "0")}
            </span>

            <button
              type="button"
              onClick={() => setActive(index)}
              onFocus={() => setActive(index)}
              aria-expanded={isActive}
              aria-controls={`feature-panel-${feature.id}`}
              className="relative flex w-full items-center gap-3 p-5 text-left lg:flex-col lg:items-start"
            >
              <span
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                  feature.accent,
                )}
              >
                <Icon className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <span className="block text-base font-semibold leading-tight">
                  {feature.title}
                </span>
              </span>
            </button>

            <div
              id={`feature-panel-${feature.id}`}
              className={cn(
                "grid transition-all duration-500 ease-out",
                isActive
                  ? "grid-rows-[1fr] opacity-100"
                  : "grid-rows-[0fr] opacity-0",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-5 pb-5">
                  <p className="text-sm text-muted-foreground">
                    {feature.description}
                  </p>
                  {feature.visual}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
