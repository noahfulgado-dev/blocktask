import { cn } from "@/lib/utils";

export function LogoMark({
  className,
  mono = false,
}: {
  className?: string;
  mono?: boolean;
}) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={cn("h-8 w-8", className)}
    >
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="17.5"
        y="1.5"
        width="13"
        height="13"
        rx="3.5"
        fill={mono ? "currentColor" : "var(--color-primary)"}
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 8l2.5 2.5L27.5 5.5"
        stroke={
          mono ? "var(--color-primary)" : "var(--color-primary-foreground)"
        }
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="1.5"
        y="17.5"
        width="13"
        height="13"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <rect
        x="17.5"
        y="17.5"
        width="13"
        height="13"
        rx="3.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M5 6h6M5 10h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M21 22h6M21 26h6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Logo({
  className,
  markClassName,
  mono = false,
}: {
  className?: string;
  markClassName?: string;
  mono?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 font-semibold", className)}>
      <LogoMark className={markClassName} mono={mono} />
      <span>BlockTask</span>
    </span>
  );
}
