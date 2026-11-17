"use client";

import { useEffect, useState } from "react";
import {
  Check,
  CheckCircle2,
  Copy,
  Crown,
  LayoutGrid,
  Lock,
  Radio,
  ShieldCheck,
  Users,
  Zap,
} from "lucide-react";

import { LogoMark } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const showcases = [
  { id: "board", label: "Board", icon: LayoutGrid },
  { id: "live", label: "Live", icon: Radio },
  { id: "roles", label: "Roles", icon: Users },
  { id: "access", label: "Access", icon: ShieldCheck },
] as const;

const AUTO_ADVANCE_MS = 4800;

function BoardPanel() {
  const tasks = [
    {
      title: "Finalize capstone proposal",
      tag: "In progress",
      tone: "warning",
      done: false,
    },
    {
      title: "Review data structures activity",
      tag: "Done",
      tone: "success",
      done: true,
    },
    {
      title: "Print lab manual for Friday",
      tag: "Pending",
      tone: "secondary",
      done: false,
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold">CS 3-A · Shared board</p>
          <p className="text-[11px] text-muted-foreground">3 of 8 tasks done</p>
        </div>
        <div className="flex -space-x-2">
          {["Kai Reyes", "Maya Cruz", "Jose Lim"].map((name) => (
            <Avatar
              key={name}
              name={name}
              className="h-7 w-7 border-2 border-card text-[10px]"
            />
          ))}
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-semibold text-muted-foreground">
            +4
          </span>
        </div>
      </div>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="group flex items-center gap-3 rounded-xl border border-border bg-background/80 px-3 py-2.5 transition-colors hover:border-primary/40"
          >
            <span
              className={cn(
                "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors",
                task.done
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-input text-transparent group-hover:border-primary/50",
              )}
            >
              <Check className="h-3.5 w-3.5" />
            </span>
            <span
              className={cn(
                "min-w-0 flex-1 truncate text-[13px] font-medium",
                task.done && "text-muted-foreground line-through",
              )}
            >
              {task.title}
            </span>
            <Badge
              variant={task.tone}
              className="shrink-0 px-2 py-0 text-[10px]"
            >
              {task.tag}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3 py-2 text-[12px] text-muted-foreground">
        <Zap className="h-3.5 w-3.5 shrink-0 text-primary" />
        Everyone sees updates the moment they happen.
      </div>
    </div>
  );
}

function LivePanel() {
  const events = [
    {
      name: "Kai Reyes",
      action: "added",
      target: "Print lab manual",
      time: "just now",
    },
    {
      name: "Maya Cruz",
      action: "marked done",
      target: "Data structures",
      time: "12s ago",
    },
    {
      name: "Jose Lim",
      action: "joined the block",
      target: "",
      time: "1m ago",
    },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Live activity</p>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Connected
        </span>
      </div>

      <div className="space-y-2">
        {events.map((event) => (
          <div
            key={`${event.name}-${event.action}`}
            className="flex items-start gap-3 rounded-xl border border-border bg-background/80 px-3 py-2.5"
          >
            <Avatar name={event.name} className="h-8 w-8 text-[10px]" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[13px]">
                <span className="font-semibold">{event.name}</span>{" "}
                {event.action}
                {event.target ? (
                  <>
                    {" "}
                    <span className="font-medium text-primary">
                      {event.target}
                    </span>
                  </>
                ) : null}
              </p>
              <p className="text-[10px] text-muted-foreground">{event.time}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
        <Radio className="h-3.5 w-3.5 shrink-0 text-primary" />
        Powered by Supabase Realtime
      </div>
    </div>
  );
}

function RolesPanel() {
  const members = [
    { name: "Kai Reyes", role: "Admin", admin: true },
    { name: "Maya Cruz", role: "Member", admin: false },
    { name: "Jose Lim", role: "Member", admin: false },
  ] as const;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Block members</p>
        <span className="text-[11px] text-muted-foreground">7 members</span>
      </div>

      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.name}
            className="flex items-center gap-3 rounded-xl border border-border bg-background/80 px-3 py-2.5"
          >
            <Avatar name={member.name} className="h-8 w-8 text-[10px]" />
            <span className="min-w-0 flex-1 truncate text-[13px] font-medium">
              {member.name}
            </span>
            <Badge
              variant={member.admin ? "default" : "secondary"}
              className="gap-1 px-2 py-0 text-[10px]"
            >
              {member.admin ? <Crown className="h-3 w-3" /> : null}
              {member.role}
            </Badge>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 rounded-xl bg-muted/60 px-3 py-2 text-[11px] text-muted-foreground">
        <Users className="h-3.5 w-3.5 shrink-0 text-primary" />
        Admins manage members. Members add tasks when allowed.
      </div>
    </div>
  );
}

function AccessPanel() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold">Invite your block</p>
        <Badge variant="success" className="gap-1 px-2 py-0 text-[10px]">
          <ShieldCheck className="h-3 w-3" />
          Locked
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-background/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Invite code
        </p>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="font-mono text-lg font-semibold tracking-[0.25em]">
            BLK3TASK
          </span>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-muted text-muted-foreground">
            <Copy className="h-3.5 w-3.5" />
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-background/80 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
          Allowed email
        </p>
        <div className="mt-1 flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Lock className="h-3.5 w-3.5" />
          </span>
          <span className="text-[13px] font-medium">@cvsu.edu.ph</span>
          <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-500" />
        </div>
      </div>

      <p className="text-[11px] leading-relaxed text-muted-foreground">
        Sign-ups are verified server-side, so only your blockmates get in.
      </p>
    </div>
  );
}

const panels = [
  <BoardPanel key="board" />,
  <LivePanel key="live" />,
  <RolesPanel key="roles" />,
  <AccessPanel key="access" />,
];

export function HeroPreview() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return (
    <div className="relative">
      <div className="absolute -inset-4 rounded-3xl bg-primary/10 blur-2xl" />

      <div
        className="relative overflow-hidden rounded-2xl border border-border bg-card/85 shadow-xl backdrop-blur-sm"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocusCapture={() => setPaused(true)}
        onBlurCapture={() => setPaused(false)}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

        <div className="flex items-center justify-between border-b border-border/70 px-4 py-3">
          <div className="flex items-center gap-2 text-[13px] font-semibold">
            <LogoMark className="h-5 w-5" />
            blocktask.app
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-muted-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Live demo
          </span>
        </div>

        <div className="p-4">
          <div
            role="tablist"
            aria-label="Feature preview"
            className="grid grid-cols-4 gap-1 rounded-xl bg-muted/60 p-1"
          >
            {showcases.map((item, index) => {
              const isActive = index === active;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`hero-tab-${item.id}`}
                  aria-selected={isActive}
                  aria-controls={`hero-panel-${item.id}`}
                  onClick={() => setActive(index)}
                  onKeyDown={(event) => {
                    if (event.key === "ArrowRight") {
                      setActive((index + 1) % showcases.length);
                    }
                    if (event.key === "ArrowLeft") {
                      setActive(
                        (index - 1 + showcases.length) % showcases.length,
                      );
                    }
                  }}
                  className={cn(
                    "relative flex flex-col items-center gap-1 rounded-lg px-1 py-2 text-[11px] font-medium transition-colors",
                    isActive
                      ? "bg-card text-primary shadow-sm ring-1 ring-primary/20"
                      : "text-muted-foreground hover:bg-card/60 hover:text-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                  {isActive && !reducedMotion ? (
                    <span className="absolute inset-x-2 bottom-1 h-0.5 overflow-hidden rounded-full bg-primary/15">
                      <span
                        key={active}
                        className="block h-full origin-left rounded-full bg-primary"
                        style={{
                          animation: `hero-progress ${AUTO_ADVANCE_MS}ms linear forwards`,
                          animationPlayState: paused ? "paused" : "running",
                        }}
                        onAnimationEnd={() =>
                          setActive((current) =>
                            (current + 1) % showcases.length,
                          )
                        }
                      />
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          <div className="relative mt-4 h-[292px]">
            {panels.map((panel, index) => (
              <div
                key={showcases[index].id}
                role="tabpanel"
                id={`hero-panel-${showcases[index].id}`}
                aria-labelledby={`hero-tab-${showcases[index].id}`}
                aria-hidden={index !== active}
                inert={index !== active}
                className={cn(
                  "absolute inset-0 transition-all duration-500 ease-out",
                  index === active
                    ? "translate-y-0 opacity-100"
                    : "pointer-events-none translate-y-2 opacity-0",
                )}
              >
                {panel}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
