import { OG_SIZE, renderDefaultOgImage } from "@/lib/og-image";

export const alt =
  "BlockTask — a shared task board for CvSU blocks and sections";

export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderDefaultOgImage();
}
