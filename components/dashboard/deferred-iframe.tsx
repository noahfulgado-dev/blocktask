"use client";

import * as React from "react";

type DeferredIframeProps = {
  title: string;
  src: string;
  className?: string;
  allow?: string;
  referrerPolicy?: React.HTMLAttributeReferrerPolicy;
  scrolling?: "yes" | "no" | "auto";
};

/**
 * Mounts a third-party iframe only once it is near the viewport. This keeps
 * heavy embeds from blocking the initial load and hydration of the page.
 */
export function DeferredIframe({
  title,
  src,
  className,
  allow,
  referrerPolicy,
  scrolling,
}: DeferredIframeProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = React.useState(false);

  React.useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { rootMargin: "400px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {shouldLoad ? (
        <iframe
          title={title}
          src={src}
          width="100%"
          loading="lazy"
          allow={allow}
          referrerPolicy={referrerPolicy}
          scrolling={scrolling}
          style={{ border: "none", overflow: "hidden" }}
          className="block h-full w-full"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-muted/40 text-xs text-muted-foreground">
          Loading feed
        </div>
      )}
    </div>
  );
}
