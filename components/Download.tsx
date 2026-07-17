"use client";

import { Fragment, useEffect, useState } from "react";
import Reveal from "./Reveal";
import { AppleIcon, ArrowIcon, DownloadIcon, LinuxIcon, WindowsIcon } from "./icons";
import { RELEASES_URL, type Platform, type Release } from "@/lib/releases";

/*
 * The command deck: one decisive action on the left — download for the
 * platform you're on — and the full build manifest on the right, styled
 * like the app's own panels. Every build is one row; yours are marked.
 */

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

export default function Download({ release }: { release: Release }) {
  const [os, setOs] = useState<Platform["id"] | null>(null);
  useEffect(() => setOs(detectOS()), []);

  const detected = release.platforms.find((p) => p.id === os) ?? null;
  const primary =
    detected?.assets.find((a) => a.primary) ?? detected?.assets[0] ?? null;
  const others = release.platforms
    .filter((p) => p.id !== detected?.id)
    .map((p) => p.name);

  return (
    <section className="section" id="download">
      <div className="container container--wide deck">
        <div className="deck__copy">
          <Reveal>
            <p className="mono mono--ember">Download</p>
            <h2 className="section-title">Get Anvil for your machine.</h2>
            <div className="dl-release">
              <span className="mono">
                Latest v{release.version} · Released {release.date}
              </span>
              <a
                className="dl-release__link mono mono--ember"
                href={release.url}
                target="_blank"
                rel="noreferrer"
              >
                Release notes
                <ArrowIcon width={12} height={12} />
              </a>
            </div>
          </Reveal>

          <Reveal delay={90}>
            {detected && primary ? (
              <>
                <a className="btn btn-ember deck__main" href={primary.url} download>
                  <DownloadIcon width={17} height={17} />
                  Download for {detected.name}
                </a>
                <p className="deck__meta mono">
                  v{release.version} · {primary.label} · {primary.size}
                </p>
              </>
            ) : (
              <>
                <a
                  className="btn btn-ember deck__main"
                  href={RELEASES_URL}
                  target="_blank"
                  rel="noreferrer"
                >
                  <DownloadIcon width={17} height={17} />
                  Download Anvil
                </a>
                <p className="deck__meta mono">v{release.version} · all platforms</p>
              </>
            )}
            <p className="deck__note">
              {others.length > 0
                ? `Also built for ${others.join(" and ")} — every artifact is in the manifest.`
                : "Every artifact is in the manifest."}
            </p>
          </Reveal>
        </div>

        <Reveal className="deck__panel" delay={140}>
          <div className="deck__bar">
            <span className="frame__dots" aria-hidden>
              <span />
              <span />
              <span />
            </span>
            <span className="mono">anvil — release manifest</span>
            <span className="mono deck__ver">v{release.version}</span>
          </div>
          <ul className="deck__list">
            {release.platforms.map((p) => {
              const Icon = OS_ICON[p.id];
              const here = p.id === os;
              return (
                <Fragment key={p.id}>
                  {/* labeled divider so each device's builds read at a glance;
                      the detected platform keeps its single trailing label */}
                  <li
                    className={`deck__group ${here ? "deck__group--here" : ""}`}
                    aria-hidden
                  >
                    {!here && <span className="mono">{p.name}</span>}
                    <i className="deck__group-line" />
                    <span className="mono">
                      {p.name}
                      {here ? " · detected" : ""}
                    </span>
                  </li>
                  {p.assets.map((a) => (
                    <li key={a.file}>
                      <a
                        className={`deck__row ${here ? "deck__row--here" : ""}`}
                        href={a.url}
                        download
                        title={`${p.name} · ${a.label} · v${release.version}`}
                      >
                        <span className="deck__os" aria-hidden>
                          <Icon width={15} height={15} />
                        </span>
                        <span className="deck__file mono">{a.file}</span>
                        <span className="deck__detail">{a.detail}</span>
                        <span className="deck__size mono">{a.size}</span>
                        <DownloadIcon width={13} height={13} />
                      </a>
                    </li>
                  ))}
                </Fragment>
              );
            })}
          </ul>
          <div className="deck__foot">
            <a
              className="mono"
              href={RELEASES_URL}
              target="_blank"
              rel="noreferrer"
            >
              older builds &amp; checksums
              <ArrowIcon width={11} height={11} />
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
