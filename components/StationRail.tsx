"use client";

import { useEffect, useRef, useState } from "react";

/*
 * The station instruments — the site's navigation, in two forms sharing one
 * active-station tracker:
 *
 * ≥1020px  the rail: a fixed instrument on the left edge, one stop per
 *          station, the active one lit ember as its section crosses the
 *          viewport. Part of the instrument family with the background
 *          console (bottom right).
 *
 * <1020px  the dock + station map: the rail has no room, so a compact
 *          readout pill floats top-right showing the current station
 *          (01 / 06). Tapping it opens a full-screen station map — the
 *          same numbered stops, writ large, staggering in — pick one and
 *          the map folds away.
 */

const STATIONS = [
  { id: "top", n: "01", label: "Forge" },
  { id: "why", n: "02", label: "Why" },
  { id: "inside", n: "03", label: "Inside" },
  { id: "open-source", n: "04", label: "Source" },
  { id: "download", n: "05", label: "Get" },
  { id: "end", n: "06", label: "End" },
];

export default function StationRail() {
  const [active, setActive] = useState("top");
  const [open, setOpen] = useState(false);
  const dockRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = STATIONS.map((s) => document.getElementById(s.id)).filter(
      (el): el is HTMLElement => el !== null,
    );
    if (sections.length === 0) return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-38% 0px -52% 0px" },
    );
    sections.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* while the map is open: lock scroll, close on Escape, close if the
     viewport grows back into rail territory, and keep focus sensible */
  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const mq = window.matchMedia("(min-width: 1020px)");
    const onGrow = () => {
      if (mq.matches) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    mq.addEventListener("change", onGrow);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onGrow);
      document.body.style.overflow = prevOverflow;
      dockRef.current?.focus();
    };
  }, [open]);

  const current = STATIONS.find((s) => s.id === active) ?? STATIONS[0];

  /* picking a stop: the browser's own anchor scroll would fire while the
     body is still scroll-locked and die there — so unlock synchronously,
     drive the scroll ourselves, then let the map fold away over it */
  const goTo = (id: string) => (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    document.body.style.overflow = "";
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    history.replaceState(null, "", `#${id}`);
    setOpen(false);
  };

  return (
    <>
      <nav className="rail" aria-label="Page stations">
        {STATIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className={`rail__stop ${active === s.id ? "is-active" : ""}`}
          >
            <span className="rail__num mono">{s.n}</span>
            <i className="rail__tick" aria-hidden />
            <span className="rail__label mono">{s.label}</span>
          </a>
        ))}
      </nav>

      <button
        ref={dockRef}
        type="button"
        className="dock"
        aria-label={`Open navigation — currently at ${current.label}`}
        aria-expanded={open}
        aria-controls="station-map"
        onClick={() => setOpen(true)}
      >
        <span className="dock__ticks" aria-hidden>
          <i />
          <i />
          <i />
        </span>
        <span className="mono">Menu</span>
      </button>

      <div
        id="station-map"
        className={`map ${open ? "map--open" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label="Stations"
      >
        <div className="map__head">
          <span className="mono mono--ember">Stations</span>
          <button
            ref={closeRef}
            type="button"
            className="map__close"
            aria-label="Close stations"
            onClick={() => setOpen(false)}
          >
            ×
          </button>
        </div>
        <nav className="map__list" aria-label="Page stations">
          {STATIONS.map((s, i) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className={`map__stop ${active === s.id ? "is-active" : ""}`}
              style={{ "--stop-delay": `${i * 45}ms` } as React.CSSProperties}
              onClick={goTo(s.id)}
            >
              <span className="map__num mono">{s.n}</span>
              <span className="map__label">{s.label}</span>
              <i className="map__line" aria-hidden />
              {active === s.id && <i className="map__here" aria-hidden />}
            </a>
          ))}
        </nav>
        <p className="map__foot mono" aria-hidden>
          Anvil · six stations
        </p>
      </div>
    </>
  );
}
