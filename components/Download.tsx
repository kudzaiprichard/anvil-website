"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import { AppleIcon, ArrowIcon, DownloadIcon, LinuxIcon, WindowsIcon } from "./icons";
import {
  PLATFORMS,
  VERSION,
  RELEASE_DATE,
  RELEASES_URL,
  LATEST_RELEASE_URL,
  type Platform,
} from "@/lib/releases";

const OS_ICON = {
  macos: AppleIcon,
  windows: WindowsIcon,
  linux: LinuxIcon,
} as const;

function detectOS(): Platform["id"] | null {
  if (typeof navigator === "undefined") return null;
  const s = `${navigator.userAgent} ${navigator.platform}`.toLowerCase();
  if (s.includes("mac")) return "macos";
  if (s.includes("win")) return "windows";
  if (s.includes("linux") || s.includes("x11")) return "linux";
  return null;
}

function PlatformCard({ p, isCurrent }: { p: Platform; isCurrent: boolean }) {
  const Icon = OS_ICON[p.id];
  return (
    <div className={`dl-card ${isCurrent ? "dl-card--current" : ""}`}>
      <div className="dl-card__head">
        <div className="dl-card__id">
          <span className="dl-card__icon">
            <Icon width={22} height={22} />
          </span>
          <div>
            <h3 className="dl-card__name">{p.name}</h3>
            <span className="dl-card__note mono">{p.note}</span>
          </div>
        </div>
        {isCurrent && <span className="dl-card__badge mono">Detected</span>}
      </div>

      <ul className="dl-card__assets">
        {p.assets.map((a) => (
          <li key={a.file}>
            <a
              className={`dl-btn ${a.primary ? "dl-btn--primary" : ""}`}
              href={a.url}
              download
            >
              <span className="dl-btn__main">
                <span className="dl-btn__label">{a.label}</span>
                <span className="dl-btn__detail">{a.detail}</span>
              </span>
              <span className="dl-btn__meta">
                <span>{a.size}</span>
                <DownloadIcon width={14} height={14} />
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Download() {
  const [os, setOs] = useState<Platform["id"] | null>(null);
  useEffect(() => setOs(detectOS()), []);

  const ordered = useMemo(() => {
    if (!os) return PLATFORMS;
    return [...PLATFORMS].sort((a, b) => (a.id === os ? -1 : b.id === os ? 1 : 0));
  }, [os]);

  return (
    <section className="section" id="download">
      <div className="container">
        <Reveal className="dl-head">
          <p className="mono mono--ember">Download</p>
          <h2 className="section-title">Get Anvil for your machine.</h2>
          <div className="dl-release">
            <span className="mono">
              Latest v{VERSION} · Released {RELEASE_DATE}
            </span>
            <a
              className="dl-release__link mono mono--ember"
              href={LATEST_RELEASE_URL}
              target="_blank"
              rel="noreferrer"
            >
              Release notes
              <ArrowIcon width={12} height={12} />
            </a>
          </div>
        </Reveal>

        <div className="dl-grid">
          {ordered.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <PlatformCard p={p} isCurrent={p.id === os} />
            </Reveal>
          ))}
        </div>

        <p className="dl-foot">
          Older builds and checksums live on{" "}
          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
            GitHub releases
          </a>
          . Prefer to build from source? The <code>README</code> has you covered.
        </p>
      </div>
    </section>
  );
}
