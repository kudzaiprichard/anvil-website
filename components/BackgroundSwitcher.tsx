"use client";

import { useEffect, useState, type ComponentType } from "react";
import FieldCanvas from "./FieldCanvas";
import GraphField from "./GraphField";
import TopoField from "./TopoField";
import LatticeField from "./LatticeField";
import ForgeField from "./ForgeField";
import SilkField from "./SilkField";

/*
 * Review tool: cycles through every background candidate with a floating
 * pill showing the current one's name. The choice persists in localStorage
 * so the whole site can be browsed under each background. Not for production
 * — this branch exists so the final background can be picked by eye.
 */

const BACKGROUNDS: Array<{ name: string; Comp: ComponentType }> = [
  { name: "Flow-field streaks", Comp: FieldCanvas },
  { name: "Graph BFS traversal", Comp: GraphField },
  { name: "Topographic contours", Comp: TopoField },
  { name: "Reactive dot lattice", Comp: LatticeField },
  { name: "Molten forge floor", Comp: ForgeField },
  { name: "Woven iron silk", Comp: SilkField },
];

const STORE_KEY = "anvil-bg-preview";

export default function BackgroundSwitcher() {
  const [i, setI] = useState(1); // default to the recommended graph traversal

  useEffect(() => {
    const saved = parseInt(localStorage.getItem(STORE_KEY) ?? "", 10);
    if (!Number.isNaN(saved) && saved >= 0 && saved < BACKGROUNDS.length) {
      setI(saved);
    }
  }, []);

  const go = (n: number) => {
    const next = (n + BACKGROUNDS.length) % BACKGROUNDS.length;
    setI(next);
    localStorage.setItem(STORE_KEY, String(next));
  };

  const { name, Comp } = BACKGROUNDS[i];

  return (
    <>
      {/* key remounts the canvas so each background boots fresh */}
      <Comp key={i} />

      <div className="bg-switch" role="group" aria-label="Background preview switcher">
        <button
          type="button"
          className="bg-switch__btn"
          onClick={() => go(i - 1)}
          aria-label="Previous background"
        >
          ←
        </button>
        <span className="bg-switch__label mono">
          {i + 1}/{BACKGROUNDS.length} · {name}
        </span>
        <button
          type="button"
          className="bg-switch__btn"
          onClick={() => go(i + 1)}
          aria-label="Next background"
        >
          →
        </button>
      </div>
    </>
  );
}
