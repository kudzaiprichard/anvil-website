<div align="center">

<img src="./public/anvil-icon-64.png" alt="Anvil" width="72" />

# Anvil — Website

The marketing &amp; download site for **[Anvil](https://github.com/kudzaiprichard/anvil)** — the free,
offline, honest way to master the classic LeetCode &amp; NeetCode questions.

**Next.js 16** (App Router) · React 19 · TypeScript · zero runtime dependencies beyond React.

</div>

---

## Overview

A single-page site that introduces Anvil, makes the case for it, invites contributors, and routes
visitors to the latest release binaries for macOS, Windows, and Linux. It is statically prerendered,
ships no client-side data fetching, and calls no third-party services at runtime — the only network
call happens at build/revalidation time, server-side, to resolve the latest release.

### Key characteristics

- **Release data is live, not hardcoded.** Version, date, file sizes, and download URLs are fetched
  from the GitHub Releases API and cached with hourly ISR, so publishing a release updates the site
  with no code change ([`lib/releases.ts`](./lib/releases.ts)).
- **Platform-aware downloads.** The visitor's OS is detected client-side and the matching build is
  surfaced first, with every artifact still listed in the manifest.
- **Self-contained by design.** Fonts are self-hosted via `next/font`; images are local or generated
  routes; a strict Content-Security-Policy (`default-src 'self'`) is enforced in
  [`next.config.ts`](./next.config.ts) alongside HSTS, `X-Frame-Options`, and a locked-down
  `Permissions-Policy`.
- **Accessible &amp; responsive.** Keyboard focus states, `prefers-reduced-motion` fallbacks on every
  animation, and a layout verified with no horizontal overflow from 320px phones to large monitors.
- **SEO surfaces derive from one source.** Metadata, Open Graph, Twitter cards, the web manifest,
  `robots`, `sitemap`, and JSON-LD all read from [`lib/site.ts`](./lib/site.ts).

## Prerequisites

- **Node.js 20.9+** (CI runs on Node 20; developed on Node 24).
- **npm** (the repo ships a `package-lock.json`; use `npm ci` for reproducible installs).

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
```

Enable the commit-message hook once after cloning (see [Contributing](#contributing)):

```bash
git config core.hooksPath .githooks
```

## Scripts

| Script              | Purpose                                          |
| ------------------- | ------------------------------------------------ |
| `npm run dev`       | Start the dev server with HMR.                   |
| `npm run typecheck` | `tsc --noEmit` — strict type checking, no build. |
| `npm run build`     | Production build (static prerender).             |
| `npm start`         | Serve the production build.                      |

## Configuration

All configuration is optional — the site builds and runs with no `.env` file, falling back to the
canonical Anvil URLs. Copy [`.env.example`](./.env.example) to `.env` to override. Every value is a
public URL; there are no secrets.

| Variable                    | Purpose                                                                        |
| --------------------------- | ------------------------------------------------------------------------------ |
| `NEXT_PUBLIC_SITE_URL`      | Canonical production URL for absolute SEO links (canonical, OG, sitemap, JSON-LD). |
| `NEXT_PUBLIC_ANVIL_REPO`    | `owner/name` of the source repo — drives every GitHub link.                    |
| `NEXT_PUBLIC_RELEASES_REPO` | `owner/name` of the releases repo — drives the download manifest.              |

On Vercel, `NEXT_PUBLIC_SITE_URL` falls back to the injected production domain if unset. See
[`lib/site.ts`](./lib/site.ts) for the exact resolution order.

## Project structure

```
app/            App Router: root layout, page, metadata & generated routes
                (opengraph-image, apple-icon, manifest, robots, sitemap),
                and the global + component stylesheets.
components/     UI and the animated canvas backgrounds (FieldCanvas, GraphField,
                TopoField, LatticeField, ForgeField, StarVoid) plus the section
                components that compose the page.
lib/            releases.ts  — live release data + platform/asset mapping.
                site.ts      — single source of truth for site identity & SEO.
                anvil-mark.tsx — the brand mark as an inline SVG.
public/         Static icons.
```

### How release data flows

`getLatestRelease()` fetches `releases/latest` from the GitHub API for the configured releases repo,
revalidated hourly (ISR). `ASSET_RULES` maps each published asset's filename onto a platform slot
(macOS / Windows / Linux) with a human label. If the API is unreachable (offline build, rate limit),
a pinned `FALLBACK` release is served instead. When release asset naming changes, update `ASSET_RULES`
**and** the fallback in [`lib/releases.ts`](./lib/releases.ts).

## Contributing

Every change lands via pull request into a protected `main`, mirroring the conventions of the main
Anvil repo:

- Short-lived `feat/…`, `fix/…`, `docs/…`, `chore/…` branches off `main`.
- Conventional commits — `type(scope): summary` followed by one `- path: what changed` bullet per
  file, enforced by the `commit-msg` hook in [`.githooks`](./.githooks).
- CI (`Lint & build (web)`) runs typecheck + build and must pass, and a code owner must approve,
  before merge.

## License

[MIT](./LICENSE) © Kudzai P Matizirofa. The Anvil name and icon belong to the
[Anvil project](https://github.com/kudzaiprichard/anvil).
