import {
  lookupInvite,
  normalizeInviteCode,
} from "@/lib/class-invite";
import { OG_SIZE, renderInviteOgImage } from "@/lib/og-image";

export const alt = "You're invited to join a class on BlockTask";

export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: rawCode } = await params;
  const code = normalizeInviteCode(rawCode);
  const { preview } = await lookupInvite(code);

  return renderInviteOgImage(preview, code);
}
