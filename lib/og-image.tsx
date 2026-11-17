import { ImageResponse } from "next/og";

import type { InvitePreview } from "@/lib/class-invite";

export const OG_SIZE = {
  width: 1200,
  height: 630,
};

const BACKGROUND =
  "linear-gradient(135deg, #0b1120 0%, #0f172a 55%, #042f2e 100%)";

function LogoSquare({ filled = false }: { filled?: boolean }) {
  return (
    <div
      style={{
        display: "flex",
        width: 26,
        height: 26,
        borderRadius: 8,
        border: "3px solid #ccfbf1",
        background: filled ? "#14b8a6" : "transparent",
      }}
    />
  );
}

function LogoMark() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <div style={{ display: "flex", gap: 6 }}>
        <LogoSquare />
        <LogoSquare filled />
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <LogoSquare />
        <LogoSquare />
      </div>
    </div>
  );
}

function Brand() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
      <LogoMark />
      <div style={{ display: "flex", fontSize: 40, fontWeight: 700, color: "#f0fdfa" }}>
        BlockTask
      </div>
    </div>
  );
}

function clip(value: string, max: number) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1).trimEnd()}…`;
}

export function renderDefaultOgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BACKGROUND,
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Brand />
          <div
            style={{
              display: "flex",
              border: "2px solid rgba(45, 212, 191, 0.45)",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 21,
              letterSpacing: 3,
              color: "#5eead4",
            }}
          >
            FOR CVSU BLOCKS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#f8fafc",
            }}
          >
            Your block&apos;s tasks,
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#2dd4bf",
            }}
          >
            finally in one place.
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 28,
              maxWidth: 930,
              fontSize: 29,
              lineHeight: 1.35,
              color: "#94a3b8",
            }}
          >
            A shared task board for your section. Invite your blockmates with a
            code and keep every requirement, deadline, and update in sync.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(148, 163, 184, 0.18)",
            paddingTop: 26,
            fontSize: 23,
            color: "#64748b",
          }}
        >
          <div style={{ display: "flex" }}>blocktask</div>
          <div style={{ display: "flex", color: "#5eead4" }}>
            Sign in with @cvsu.edu.ph
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}

export function renderInviteOgImage(
  preview: InvitePreview | null,
  code: string,
) {
  const name = clip(preview?.name?.trim() || "a class on BlockTask", 48);
  const description = clip(
    preview?.description?.trim() ||
      "You've been invited to a shared task board for your block.",
    150,
  );
  const nameSize = name.length > 30 ? 64 : 80;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: BACKGROUND,
          padding: "64px 72px",
          fontFamily: "sans-serif",
          color: "#e2e8f0",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Brand />
          <div
            style={{
              display: "flex",
              border: "2px solid rgba(45, 212, 191, 0.45)",
              borderRadius: 999,
              padding: "10px 22px",
              fontSize: 21,
              letterSpacing: 3,
              color: "#5eead4",
            }}
          >
            CLASS INVITATION
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              fontSize: 24,
              letterSpacing: 4,
              color: "#5eead4",
            }}
          >
            YOU&apos;RE INVITED TO JOIN
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 18,
              maxWidth: 1050,
              fontSize: nameSize,
              fontWeight: 800,
              letterSpacing: -2,
              lineHeight: 1.05,
              color: "#f8fafc",
            }}
          >
            {name}
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 22,
              maxWidth: 1050,
              fontSize: 29,
              lineHeight: 1.35,
              color: "#94a3b8",
            }}
          >
            {description}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderTop: "2px solid rgba(148, 163, 184, 0.18)",
            paddingTop: 26,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", fontSize: 23, color: "#64748b" }}>
              Invite code
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 34,
                fontWeight: 700,
                letterSpacing: 6,
                color: "#f0fdfa",
              }}
            >
              {code || "—"}
            </div>
          </div>
          <div style={{ display: "flex", fontSize: 23, color: "#5eead4" }}>
            blocktask
          </div>
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
