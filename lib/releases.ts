/*
 * Anvil release data — points at the dedicated release repo
 * github.com/kudzaiprichard/anvil-releases. Bump VERSION and the asset
 * filenames when a new release ships; the download URLs derive from them.
 */

export const VERSION = "0.2.0";
export const RELEASE_TAG = `v${VERSION}`;
export const RELEASE_DATE = "2026-07-12";

export const REPO_URL = "https://github.com/kudzaiprichard/anvil";
export const RELEASES_REPO = "https://github.com/kudzaiprichard/anvil-releases";
export const RELEASES_URL = `${RELEASES_REPO}/releases`;
export const LATEST_RELEASE_URL = `${RELEASES_REPO}/releases/tag/${RELEASE_TAG}`;

const DL = `${RELEASES_REPO}/releases/download/${RELEASE_TAG}`;

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

export const PLATFORMS: Platform[] = [
  {
    id: "macos",
    name: "macOS",
    note: "macOS 12+ · universal-ready",
    assets: [
      {
        label: "Apple Silicon",
        detail: "M1 / M2 / M3 · .dmg",
        file: "Anvil_0.2.0_aarch64.dmg",
        size: "10.2 MB",
        url: `${DL}/Anvil_0.2.0_aarch64.dmg`,
        primary: true,
      },
      {
        label: "Intel",
        detail: "x86-64 · .dmg",
        file: "Anvil_0.2.0_x64.dmg",
        size: "10.4 MB",
        url: `${DL}/Anvil_0.2.0_x64.dmg`,
      },
    ],
  },
  {
    id: "windows",
    name: "Windows",
    note: "Windows 10 / 11 · WebView2",
    assets: [
      {
        label: "Installer",
        detail: "x64 · .exe (setup)",
        file: "Anvil_0.2.0_x64-setup.exe",
        size: "8.2 MB",
        url: `${DL}/Anvil_0.2.0_x64-setup.exe`,
        primary: true,
      },
      {
        label: "MSI package",
        detail: "x64 · .msi",
        file: "Anvil_0.2.0_x64_en-US.msi",
        size: "10.0 MB",
        url: `${DL}/Anvil_0.2.0_x64_en-US.msi`,
      },
    ],
  },
  {
    id: "linux",
    name: "Linux",
    note: "x86-64 · webkit2gtk",
    assets: [
      {
        label: "AppImage",
        detail: "portable · .AppImage",
        file: "Anvil_0.2.0_amd64.AppImage",
        size: "87.6 MB",
        url: `${DL}/Anvil_0.2.0_amd64.AppImage`,
        primary: true,
      },
      {
        label: "Debian / Ubuntu",
        detail: "amd64 · .deb",
        file: "Anvil_0.2.0_amd64.deb",
        size: "10.2 MB",
        url: `${DL}/Anvil_0.2.0_amd64.deb`,
      },
      {
        label: "Fedora / RHEL",
        detail: "x86-64 · .rpm",
        file: "Anvil-0.2.0-1.x86_64.rpm",
        size: "10.3 MB",
        url: `${DL}/Anvil-0.2.0-1.x86_64.rpm`,
      },
    ],
  },
];
