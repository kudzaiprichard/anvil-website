"use client";

import { useEffect, useMemo, useState } from "react";
import Reveal from "./Reveal";
import {
  AppleIcon,
  ArrowIcon,
  DownloadIcon,
  LinuxIcon,
  WindowsIcon,
} from "./icons";
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
    <div className={`card dl-card ${isCurrent ? "dl-card--current" : ""}`}>
      {isCurrent && <span className="dl-card__badge microlabel">Detected</span>}
      <div className="dl-card__head">
        <span className="dl-card__icon">
          <Icon width={26} height={26} />
        </span>
        <div>
          <h3 className="dl-card__name">{p.name}</h3>
          <p className="dl-card__note microlabel">{p.note}</p>
        </div>
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
                <DownloadIcon width={15} height={15} />
                <span className="dl-btn__label">{a.label}</span>
                <span className="dl-btn__detail">{a.detail}</span>
              </span>
              <span className="dl-btn__meta">
                <span className="dl-btn__ver">v{VERSION}</span>
                <span className="dl-btn__size">{a.size}</span>
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
    return [...PLATFORMS].sort((a, b) =>
      a.id === os ? -1 : b.id === os ? 1 : 0,
    );
  }, [os]);

  return (
    <section className="section" id="download">
      <div className="container">
        <Reveal className="section-head dl-head">
          <p className="eyebrow microlabel microlabel--ember">Download</p>
          <h2 className="section-title">Get Anvil for your machine.</h2>
          <p className="lead">
            Free forever. Pick your platform below — every build is the latest release, published to a
            dedicated release repo and signed into the app.
          </p>
          <div className="dl-release">
            <span className="chip">
              <span className="dot" />
              Latest · v{VERSION}
            </span>
            <span className="microlabel dl-release__date">Released {RELEASE_DATE}</span>
            <a className="dl-release__link microlabel microlabel--ember" href={LATEST_RELEASE_URL} target="_blank" rel="noreferrer">
              Release notes
              <ArrowIcon width={13} height={13} />
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
          Looking for older builds or checksums?{" "}
          <a href={RELEASES_URL} target="_blank" rel="noreferrer">
            See all releases on GitHub
          </a>
          . Prefer to build from source? The <code>README</code> has you covered.
        </p>
      </div>
    </section>
  );
}
