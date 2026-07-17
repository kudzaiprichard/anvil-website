"use client";

import { useEffect, useState } from "react";

/*
 * The station rail is the site's navigation: a fixed instrument on the left
 * edge with one stop per station. The active station lights ember as its
 * section crosses the viewport, so you always know where you are. Part of
 * the instrument family with the progress hairline (top) and the background
 * console (bottom right). Desktop only; small screens scroll freely.
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

  return (
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
  );
}
