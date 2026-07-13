/*
 * Anvil release data — fetched live from the dedicated release repo
 * github.com/kudzaiprichard/anvil-releases via the GitHub API, revalidated
 * hourly. Every version, date, size, and download URL shown on the site
 * derives from the latest published release; when a new version ships, the
 * site follows automatically. FALLBACK below is only served if the API is
 * unreachable (offline build, rate limit) — keep it pointed at a real
 * release.
 */

export const REPO_URL = "https://github.com/kudzaiprichard/anvil";
export const RELEASES_REPO = "https://github.com/kudzaiprichard/anvil-releases";
export const RELEASES_URL = `${RELEASES_REPO}/releases`;

const API_LATEST =
  "https://api.github.com/repos/kudzaiprichard/anvil-releases/releases/latest";

export type Asset = {
  label: string;
  detail: string;
  file: string;
  size: string;
  url: string;
  primary?: boolean;
};

export type Platform = {
  id: "macos" | "windows" | "linux";
  name: string;
  note: string;
  assets: Asset[];
};

export type Release = {
  version: string; // "0.2.0"
  date: string; // "2026-07-12"
  url: string; // release page
  platforms: Platform[];
};

/* How a release asset's filename maps onto a platform slot. */
const ASSET_RULES: Array<{
  match: (name: string) => boolean;
  platform: Platform["id"];
  label: string;
  detail: string;
  primary?: boolean;
}> = [
  { match: (n) => /aarch64\.dmg$/i.test(n), platform: "macos", label: "Apple Silicon", detail: "M-series · .dmg", primary: true },
  { match: (n) => /x64\.dmg$/i.test(n), platform: "macos", label: "Intel", detail: "x86-64 · .dmg" },
  { match: (n) => /-setup\.exe$/i.test(n), platform: "windows", label: "Installer", detail: "x64 · .exe (setup)", primary: true },
  { match: (n) => /\.msi$/i.test(n), platform: "windows", label: "MSI package", detail: "x64 · .msi" },
  { match: (n) => /\.AppImage$/i.test(n), platform: "linux", label: "AppImage", detail: "portable · .AppImage", primary: true },
  { match: (n) => /\.deb$/i.test(n), platform: "linux", label: "Debian / Ubuntu", detail: "amd64 · .deb" },
  { match: (n) => /\.rpm$/i.test(n), platform: "linux", label: "Fedora / RHEL", detail: "x86-64 · .rpm" },
];

const PLATFORM_META: Array<Pick<Platform, "id" | "name" | "note">> = [
  { id: "macos", name: "macOS", note: "macOS 12+ · universal-ready" },
  { id: "windows", name: "Windows", note: "Windows 10 / 11 · WebView2" },
  { id: "linux", name: "Linux", note: "x86-64 · webkit2gtk" },
];

const formatSize = (bytes: number) => `${(bytes / 1e6).toFixed(1)} MB`;

type ApiAsset = { name: string; size: number; browser_download_url: string };
type ApiRelease = {
  tag_name: string;
  html_url: string;
  published_at: string;
  assets: ApiAsset[];
};

function toRelease(api: ApiRelease): Release {
  const platforms: Platform[] = PLATFORM_META.map((meta) => ({
    ...meta,
    assets: [],
  }));

  for (const asset of api.assets) {
    const rule = ASSET_RULES.find((r) => r.match(asset.name));
    if (!rule) continue;
    platforms
      .find((p) => p.id === rule.platform)!
      .assets.push({
        label: rule.label,
        detail: rule.detail,
        file: asset.name,
        size: formatSize(asset.size),
        url: asset.browser_download_url,
        primary: rule.primary,
      });
  }

  const withAssets = platforms.filter((p) => p.assets.length > 0);
  if (withAssets.length === 0) throw new Error("no recognizable release assets");

  return {
    version: api.tag_name.replace(/^v/, ""),
    date: api.published_at.slice(0, 10),
    url: api.html_url,
    platforms: withAssets,
  };
}

/* Served only when the GitHub API is unreachable. */
const FB_VERSION = "0.2.0";
const FB_DL = `${RELEASES_REPO}/releases/download/v${FB_VERSION}`;
const FALLBACK: Release = {
  version: FB_VERSION,
  date: "2026-07-12",
  url: `${RELEASES_REPO}/releases/tag/v${FB_VERSION}`,
  platforms: [
    {
      id: "macos",
      name: "macOS",
      note: "macOS 12+ · universal-ready",
      assets: [
        { label: "Apple Silicon", detail: "M-series · .dmg", file: `Anvil_${FB_VERSION}_aarch64.dmg`, size: "10.2 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_aarch64.dmg`, primary: true },
        { label: "Intel", detail: "x86-64 · .dmg", file: `Anvil_${FB_VERSION}_x64.dmg`, size: "10.4 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_x64.dmg` },
      ],
    },
    {
      id: "windows",
      name: "Windows",
      note: "Windows 10 / 11 · WebView2",
      assets: [
        { label: "Installer", detail: "x64 · .exe (setup)", file: `Anvil_${FB_VERSION}_x64-setup.exe`, size: "8.2 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_x64-setup.exe`, primary: true },
        { label: "MSI package", detail: "x64 · .msi", file: `Anvil_${FB_VERSION}_x64_en-US.msi`, size: "10.0 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_x64_en-US.msi` },
      ],
    },
    {
      id: "linux",
      name: "Linux",
      note: "x86-64 · webkit2gtk",
      assets: [
        { label: "AppImage", detail: "portable · .AppImage", file: `Anvil_${FB_VERSION}_amd64.AppImage`, size: "87.6 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_amd64.AppImage`, primary: true },
        { label: "Debian / Ubuntu", detail: "amd64 · .deb", file: `Anvil_${FB_VERSION}_amd64.deb`, size: "10.2 MB", url: `${FB_DL}/Anvil_${FB_VERSION}_amd64.deb` },
        { label: "Fedora / RHEL", detail: "x86-64 · .rpm", file: `Anvil-${FB_VERSION}-1.x86_64.rpm`, size: "10.3 MB", url: `${FB_DL}/Anvil-${FB_VERSION}-1.x86_64.rpm` },
      ],
    },
  ],
};

/* Latest release, cached and revalidated hourly (ISR). */
export async function getLatestRelease(): Promise<Release> {
  try {
    const res = await fetch(API_LATEST, {
      headers: { Accept: "application/vnd.github+json" },
      next: { revalidate: 3600 },
    });
    if (!res.ok) throw new Error(`GitHub API ${res.status}`);
    return toRelease((await res.json()) as ApiRelease);
  } catch {
    return FALLBACK;
  }
}
