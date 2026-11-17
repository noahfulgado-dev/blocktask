"use client";

import * as React from "react";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const [theme, setTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      setTheme(root.classList.contains("dark") ? "dark" : "light");
    };

    sync();

    const observer = new MutationObserver(sync);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  return <SonnerToaster richColors position="top-right" theme={theme} />;
}
