import { ExternalLink, Newspaper } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const FACEBOOK_PAGE_URL = "https://www.facebook.com/csg.cvsuimus";
const FACEBOOK_PAGE_NAME = "CvSU CSG — Imus";

const timelineSrc = `https://www.facebook.com/plugins/page.php?${new URLSearchParams(
  {
    href: FACEBOOK_PAGE_URL,
    tabs: "timeline",
    show_posts: "true",
    width: "318",
    height: "700",
    small_header: "false",
    adapt_container_width: "true",
    hide_cover: "false",
    show_facepile: "false",
  },
).toString()}`;

export function FacebookTimelinePanel() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2">
          <CardTitle className="flex min-w-0 items-center gap-2 text-base">
            <Newspaper className="h-4 w-4 shrink-0 text-muted-foreground" />
            <span className="truncate">{FACEBOOK_PAGE_NAME}</span>
          </CardTitle>
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="inline-flex shrink-0 items-center gap-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>
        <CardDescription>
          Latest updates from the CSG Facebook page.
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="overflow-hidden rounded-lg border border-border bg-white">
          <iframe
            title={`${FACEBOOK_PAGE_NAME} Facebook timeline`}
            src={timelineSrc}
            width="100%"
            loading="eager"
            allow="encrypted-media"
            referrerPolicy="no-referrer-when-downgrade"
            scrolling="no"
            style={{ border: "none", overflow: "hidden" }}
            className="block h-[520px] w-full sm:h-[600px] lg:h-[700px]"
          />
        </div>

        <p className="mt-2 text-xs text-muted-foreground">
          Feed not loading?{" "}
          <a
            href={FACEBOOK_PAGE_URL}
            target="_blank"
            rel="noreferrer"
            className="font-medium underline underline-offset-2 hover:text-foreground"
          >
            Open it on Facebook
          </a>
          .
        </p>
      </CardContent>
    </Card>
  );
}
