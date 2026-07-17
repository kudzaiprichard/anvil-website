"use client";

import { useEffect, useState } from "react";
import { AnvilMark } from "@/lib/anvil-mark";

/*
 * The forge-warming loader: a full-screen iron plate with the breathing
 * anvil mark and three ember sparks, shown from the very first paint (it's
 * server-rendered, so it appears before hydration). It leaves once fonts and
 * the page are ready — never sooner than MIN_MS (no flash), never later than
 * MAX_MS (never a hostage) — then fades and unmounts.
 */

const MIN_MS = 700;
const MAX_MS = 2600;
const FADE_MS = 650;

export default function SiteLoader() {
  const [phase, setPhase] = useState<"on" | "leaving" | "gone">("on");

  useEffect(() => {
    let t1 = 0;
    let t2 = 0;
    const started = performance.now();

    const leave = () => {
      const wait = Math.max(0, MIN_MS - (performance.now() - started));
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
      <div className="loader__mark">
        <AnvilMark size={56} color="currentColor" />
      </div>
      <div className="loader__sparks">
        <span />
        <span />
        <span />
      </div>
    </div>
  );
}
