"use client";

import { useEffect, useState } from "react";

const manilaDate = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Manila",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});

function getToday() {
  const parts = manilaDate.formatToParts(new Date());
  const year = parts.find((part) => part.type === "year")?.value ?? "0000";
  const month = parts.find((part) => part.type === "month")?.value ?? "00";
  const day = parts.find((part) => part.type === "day")?.value ?? "00";
  return `${year}-${month}-${day}`;
}

export function useToday() {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    function update() {
      setToday(getToday());
    }

    update();
    const id = window.setInterval(update, 60_000);
    return () => window.clearInterval(id);
  }, []);

  return today;
}
