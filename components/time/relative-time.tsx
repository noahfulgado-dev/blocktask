"use client";

import * as React from "react";

import { formatRelative } from "@/lib/utils";

export function RelativeTime({
  value,
  fallback = null,
}: {
  value: string | null | undefined;
  fallback?: React.ReactNode;
}) {
  const [now, setNow] = React.useState<number | null>(null);

  React.useEffect(() => {
    function update() {
      setNow(Date.now());
    }

    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  if (now === null) return <>{fallback}</>;

  return <>{formatRelative(value, now) ?? fallback}</>;
}
