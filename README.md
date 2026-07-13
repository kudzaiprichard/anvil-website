<div align="center">

<img src="./public/anvil-icon-64.png" alt="Anvil" width="72" />

# Anvil — Website

The marketing & download site for **[Anvil](https://github.com/kudzaiprichard/anvil)**, the free,
offline, honest way to master DSA.

Built with **Next.js 16** · React 19 · TypeScript. Themed to match the Anvil desktop app's
"forged iron & ember" design system.

</div>

---

## What this is

A single-page site that introduces Anvil, explains why it exists, invites contributors, and points
visitors at the latest release binaries for macOS, Windows, and Linux. The download buttons link
straight to the assets published on
[**anvil-releases**](https://github.com/kudzaiprichard/anvil-releases/releases) and show the current
version and file sizes.

Highlights:

- **Forge aesthetic** — warm iron neutrals under a single ember-copper accent, lifted from the app's
  OKLCH theme, with an animated canvas of rising embers behind the hero.
- **Platform-aware downloads** — detects the visitor's OS and surfaces the right build first.
- **Accessible & responsive** — keyboard focus states, reduced-motion support, mobile down to 360px.

## Develop

```bash
npm install
npm run dev        # http://localhost:3000
```

## Build

```bash
npm run typecheck  # tsc --noEmit
npm run build      # production build
npm start          # serve the production build
```

## Updating the release links

Release data lives in [`lib/releases.ts`](./lib/releases.ts). When a new Anvil version ships, bump
`VERSION`, `RELEASE_DATE`, and the asset filenames/sizes to match the new
[release](https://github.com/kudzaiprichard/anvil-releases/releases); every download URL derives from
those values.

## Contributing

Every change lands via pull request into a protected `main`, following the same conventions as the
main Anvil repo:

- Short-lived `feat/… · fix/… · docs/… · chore/…` branches.
- Conventional commits — `type(scope): summary` followed by one `- path: what changed` bullet per file
  (enforced by the `commit-msg` hook in [`.githooks`](./.githooks)).
- CI (`Lint & build (web)`) must pass and a code-owner must approve before merge.

Enable the hook after cloning:

```bash
git config core.hooksPath .githooks
```

## License

[MIT](./LICENSE) © Kudzai P Matizirofa. The Anvil name and icon belong to the
[Anvil project](https://github.com/kudzaiprichard/anvil).
