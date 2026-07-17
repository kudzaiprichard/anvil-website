"use client";

import { useEffect, useState } from "react";

/*
 * The forging loader: the anvil mark is made in front of you. Its outline
 * draws itself in bone hairline (pathLength-normalized stroke animation),
 * then the strike lands — an ember flash, sparks scattering — and the mark
 * fills solid, while a small mono status cycles heating / hammering /
 * quenching. Everything is CSS-driven on server-rendered markup, so the
 * ceremony starts before hydration.
 *
 * It leaves once fonts and the page are ready — but never before the story
 * finishes on a first visit, and never later than MAX_MS. Repeat visits in
 * the same session skip the ceremony and fade through quickly.
 */

const STORY_MS = 1900; // outline → strike → settle
const REPEAT_MS = 250; // seen it already this session
const MAX_MS = 3200;
const FADE_MS = 600;

const MARK_PATHS = [
  "M3.2 5.6h15.2c1.8 0 3.3 1 4.4 2.1.4.4.1 1.1-.5 1.1h-4.1v1.1c0 .7.4 1.3 1 1.6l.9.4c.5.2.5 1 0 1.2-2.3.9-4.8 1-7.1.3-1.6-.5-3.3-.5-4.9 0-1.1.3-2.3.5-3.4.5-.6 0-.9-.7-.5-1.1l1.5-1.4c.5-.5.8-1.1.8-1.8v-.8H3.2c-.6 0-1-.4-1-1V6.6c0-.6.4-1 1-1z",
  "M9.4 14.9h5.2l1 2.3H8.4z",
  "M6.5 18.2h11c.6 0 1 .4 1 1v.6c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1v-.6c0-.6.4-1 1-1z",
];

export default function SiteLoader() {
  const [phase, setPhase] = useState<"on" | "leaving" | "gone">("on");

  useEffect(() => {
    let t1 = 0;
    let t2 = 0;
    const started = performance.now();

    const seen = sessionStorage.getItem("anvil-forged") === "1";
    const minMs = seen ? REPEAT_MS : STORY_MS;

    const leave = () => {
      sessionStorage.setItem("anvil-forged", "1");
      const wait = Math.max(0, minMs - (performance.now() - started));
      t1 = window.setTimeout(() => {
        setPhase("leaving");
        t2 = window.setTimeout(() => setPhase("gone"), FADE_MS);
      }, wait);
    };

    const loaded = new Promise<void>((res) => {
      if (document.readyState === "complete") res();
      else window.addEventListener("load", () => res(), { once: true });
    });
    const fonts: Promise<unknown> =
      "fonts" in document ? document.fonts.ready : Promise.resolve();
    const cap = new Promise<void>((res) => {
      window.setTimeout(res, MAX_MS);
    });

    Promise.race([Promise.all([loaded, fonts]), cap]).then(leave);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`loader ${phase === "leaving" ? "loader--leaving" : ""}`}
      aria-hidden
    >
      <div className="loader__stage">
        <i className="loader__flash" />
        <svg
          className="loader__mark"
          viewBox="0 0 25 26.4"
          width="72"
          height="76"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {MARK_PATHS.map((d, i) => (
            <path key={`fill-${i}`} className="loader__fill" d={d} />
          ))}
          {MARK_PATHS.map((d, i) => (
            <path
              key={`stroke-${i}`}
              className="loader__path"
              d={d}
              pathLength={1}
            />
          ))}
        </svg>
        {Array.from({ length: 8 }, (_, i) => (
          <span key={i} className="loader__spark" />
        ))}
      </div>
      <div className="loader__word mono">
        <span>Heating</span>
        <span>Hammering</span>
        <span>Quenching</span>
      </div>
    </div>
  );
}
