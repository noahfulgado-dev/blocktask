import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CVSU_EMAIL_DOMAIN = "cvsu.edu.ph";

const EXTRA_ALLOWED_EMAILS = new Set(["zeqdev.1@gmail.com"]);

export function isAllowedEmail(email: string) {
  const normalized = email.trim().toLowerCase();
  return (
    normalized.endsWith(`@${CVSU_EMAIL_DOMAIN}`) ||
    EXTRA_ALLOWED_EMAILS.has(normalized)
  );
}

export function isCvsuEmail(email: string) {
  return isAllowedEmail(email);
}

export function initials(value: string | null | undefined) {
  const source = (value ?? "").trim();
  if (!source) return "?";

  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function displayName(
  profile: { full_name: string | null; email: string } | null | undefined,
) {
  if (!profile) return "Unknown member";
  return profile.full_name?.trim() || profile.email.split("@")[0];
}

export function formatDate(value: string | null | undefined) {
  if (!value) return null;

  const date =
    value.length === 10
      ? new Date(`${value}T12:00:00Z`)
      : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  return new Intl.DateTimeFormat("en-PH", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "Asia/Manila",
  }).format(date);
}

export function formatRelative(
  value: string | null | undefined,
  now: number,
) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const diff = now - date.getTime();
  const minutes = Math.round(diff / 60000);

  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.round(hours / 24);
  if (days < 7) return `${days}d ago`;

  return formatDate(value);
}

/**
 * Supabase surfaces our auth hook message, but sometimes wraps it in
 * "Database error saving new user". Keep the useful part.
 */
export function friendlyAuthError(message: string | undefined | null) {
  if (!message) return "Something went wrong. Please try again.";

  if (/cvsu\.edu\.ph/i.test(message)) {
    return "Only @cvsu.edu.ph emails are allowed to sign up.";
  }

  if (/invalid login credentials/i.test(message)) {
    return "Incorrect email or password.";
  }

  if (/email not confirmed/i.test(message)) {
    return "Please confirm your email first. Check your inbox for the link.";
  }

  if (/user already registered/i.test(message)) {
    return "An account with this email already exists. Try logging in.";
  }

  if (/password should be at least/i.test(message)) {
    return "Password must be at least 6 characters.";
  }

  return message;
}
