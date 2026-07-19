/*
 * Central site identity — every SEO surface (metadata, OG image, manifest,
 * robots, sitemap, JSON-LD) reads from here so the story stays consistent.
 * Swap SITE_URL for the production domain when it exists.
 */

/* Resolution order: explicit override → Vercel's production domain env →
   the known production URL. Absolute URLs (canonical, og:image, sitemap)
   are built from this, so it must always be a domain that actually serves
   the site — a wrong value here silently breaks social share covers. */
const envUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  process.env.VERCEL_PROJECT_PRODUCTION_URL ??
  process.env.VERCEL_URL;

export const SITE_URL = envUrl
  ? envUrl.startsWith("http")
    ? envUrl
    : `https://${envUrl}`
  : "https://anvil-website.vercel.app";
export const SITE_NAME = "Anvil";
export const SITE_TITLE = "Anvil — The free, offline, honest way to master DSA";
export const SITE_DESCRIPTION =
  "Anvil is an open-source, offline-first desktop app for coding-interview & DSA practice. A guided course of original problems, judged against real test cases. No account. No AI crutch. MIT-licensed.";
export const SITE_TAGLINE =
  "Free · Offline · Open source — no account, no telemetry, no AI crutch.";

/* GitHub repos as "owner/name" slugs, overridable via env (see lib/releases.ts
   for the same resolution). Literal reads so NEXT_PUBLIC_ values inline at build. */
const ANVIL_REPO = process.env.NEXT_PUBLIC_ANVIL_REPO ?? "kudzaiprichard/anvil";
const RELEASES_REPO_SLUG =
  process.env.NEXT_PUBLIC_RELEASES_REPO ?? "kudzaiprichard/anvil-releases";

export const GITHUB_URL = `https://github.com/${ANVIL_REPO}`;
export const RELEASES_URL = `https://github.com/${RELEASES_REPO_SLUG}`;
export const AUTHOR_NAME = "Kudzai P Matizirofa";

/* the site's dark iron ground, as hex for surfaces that can't speak oklch */
export const THEME_COLOR = "#1a1815";
