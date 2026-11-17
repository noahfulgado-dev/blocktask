import type { Metadata } from "next";

export const SITE_NAME = "BlockTask";
export const SITE_TITLE = "BlockTask — Shared task board for your block";
export const SITE_DESCRIPTION =
  "A shared task board for CvSU blocks and sections. Sign in with your @cvsu.edu.ph email, create a class, and keep every task in one place.";
export const SITE_KEYWORDS = [
  "BlockTask",
  "CvSU",
  "Cavite State University",
  "student task board",
  "class task board",
  "group tasks",
  "block tasks",
];

export function getSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return normalizeUrl(configured);

  const vercel =
    process.env.VERCEL_PROJECT_PRODUCTION_URL?.trim() ||
    process.env.VERCEL_URL?.trim();

  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "")}`;

  return "http://localhost:3000";
}

function normalizeUrl(value: string) {
  const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
  return withProtocol.replace(/\/+$/, "");
}

type PageMetadataOptions = {
  title: string;
  description?: string;
  path?: string;
  noIndex?: boolean;
  imagePath?: string;
  twitterImagePath?: string;
};

export function pageMetadata({
  title,
  description = SITE_DESCRIPTION,
  path,
  noIndex = false,
  imagePath = "/opengraph-image",
  twitterImagePath = "/twitter-image",
}: PageMetadataOptions): Metadata {
  const socialTitle = `${title} — ${SITE_NAME}`;

  return {
    title,
    description,
    alternates: path ? { canonical: path } : undefined,
    openGraph: {
      type: "website",
      locale: "en_PH",
      url: path,
      siteName: SITE_NAME,
      title: socialTitle,
      description,
      images: [
        {
          url: imagePath,
          width: 1200,
          height: 630,
          alt: socialTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [twitterImagePath],
    },
    robots: noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  };
}
