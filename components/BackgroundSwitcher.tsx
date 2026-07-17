"use client";

import { useEffect, useState, type ComponentType } from "react";
import FieldCanvas from "./FieldCanvas";
import GraphField from "./GraphField";
import TopoField from "./TopoField";
import LatticeField from "./LatticeField";
import ForgeField from "./ForgeField";
import StarVoid from "./StarVoid";

/*
 * Daily background rotation: the living background advances to the next
 * candidate every day at 04:00 CAT (UTC+2, no DST — so 02:00 UTC). The
 * active index is derived from the calendar, so every visitor sees the same
 * background on the same day, and a page left open across the boundary
 * swaps live via a scheduled timer.
 */

/* `space` layers the deep-space starfield beneath the background at the
   given intensity — sparse foregrounds ask for a more present void */
const BACKGROUNDS: Array<{ name: string; Comp: ComponentType; space?: number }> = [
  { name: "Flow-field streaks", Comp: FieldCanvas, space: 1.6 },
  { name: "Graph BFS traversal", Comp: GraphField, space: 1 },
  { name: "Topographic contours", Comp: TopoField, space: 1 },
  { name: "Reactive dot lattice", Comp: LatticeField },
  { name: "Molten forge floor", Comp: ForgeField },
];

const DAY_MS = 86_400_000;
const BOUNDARY_MS = 2 * 3_600_000; // 04:00 CAT expressed in UTC

/* which rotation day a UTC timestamp falls in, with days starting 02:00 UTC */
const indexFor = (now: number) => {
  const day = Math.floor((now - BOUNDARY_MS) / DAY_MS);
  return ((day % BACKGROUNDS.length) + BACKGROUNDS.length) % BACKGROUNDS.length;
};

/* ms until the next 04:00 CAT boundary */
const msToNext = (now: number) =>
  DAY_MS - ((((now - BOUNDARY_MS) % DAY_MS) + DAY_MS) % DAY_MS);

const fmt = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  const hh = String(Math.floor(s / 3600)).padStart(2, "0");
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
};

const OFFSET_KEY = "anvil-bg-offset";

export default function BackgroundSwitcher() {
  // resolved on the client only, so server markup never guesses the day
  const [day, setDay] = useState<number | null>(null);
  const [offset, setOffset] = useState(0);
  const [clock, setClock] = useState<string | null>(null);

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(OFFSET_KEY) ?? "0", 10);
    if (!Number.isNaN(saved)) setOffset(saved);

    let timer = 0;
    const apply = () => {
      const now = Date.now();
      setDay(indexFor(now));
      // wake just past the next 04:00 CAT boundary and rotate
      timer = window.setTimeout(apply, msToNext(now) + 1000);
    };
    apply();

    // the quiet corner clock, counting down to the rotation
    setClock(fmt(msToNext(Date.now())));
    const ticker = window.setInterval(
      () => setClock(fmt(msToNext(Date.now()))),
      1000,
    );

    return () => {
      clearTimeout(timer);
      clearInterval(ticker);
    };
  }, []);

  // manual steps ride on top of the daily rotation and persist
  const shift = (d: number) => {
    setOffset((o) => {
      const next = o + d;
      localStorage.setItem(OFFSET_KEY, String(next));
      return next;
    });
  };

  if (day === null) return null;
  const n = BACKGROUNDS.length;
  const i = (((day + offset) % n) + n) % n;
  const { Comp, space } = BACKGROUNDS[i];

  return (
    <>
      {/* key remounts the canvases so each background boots fresh;
          the star void renders first so it sits beneath the foreground layer */}
      {space && <StarVoid key={`void-${i}`} intensity={space} />}
      <Comp key={i} />

      <div className="bg-console">
        <button
          type="button"
          className="bg-console__btn"
          onClick={() => shift(-1)}
          aria-label="Previous background"
        >
          ‹
        </button>
        {clock && (
          <span className="bg-console__clock mono" aria-hidden>
            {clock}
          </span>
        )}
        <button
          type="button"
          className="bg-console__btn"
          onClick={() => shift(1)}
          aria-label="Next background"
        >
          ›
        </button>
      </div>
    </>
  );
}
