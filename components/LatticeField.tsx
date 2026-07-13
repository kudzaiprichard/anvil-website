"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, final form: a reactive dot lattice.
 *
 * A precise grid of tiny bone studs — the machined-plate answer to the subtle
 * grids that define the dark devtool aesthetic. Three layers of life:
 *   ambient — a slow luminance wave breathes diagonally across the lattice;
 *   cursor  — dots swell, warm to ember, and part around a smoothed cursor
 *             that eases back (never 1:1 tracking);
 *   scroll  — velocity energizes the wave and slides the lattice slightly.
 * A few permanent ember studs stud the plate. Flat color, no glow, and
 * reduced motion renders one static plate.
 */

const SPACING = 34;
const BASE_R = 1.15;
const SIGMA = 115; // cursor influence radius
const CUTOFF2 = (SIGMA * 3) * (SIGMA * 3);
const PUSH = 11; // max px a dot is displaced away from the cursor
const EMBER_RATIO = 0.02; // fraction of studs that are permanently ember
const SCROLL_SLIDE = 0.06; // lattice parallax factor

/* deterministic per-stud hash so ember studs stay put as the lattice slides */
const hash = (i: number, j: number) => {
  const s = Math.sin(i * 127.1 + j * 311.7) * 43758.5453;
  return s - Math.floor(s);
};

export default function LatticeField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    // cursor target + smoothed position (gravitate / ease-back)
    let tx = -99999;
    let ty = -99999;
    let sx = 0;
    let sy = 0;
    let grip = 0; // eased 0..1 — how present the cursor is
    let hasCursor = false;
    const onMove = (e: PointerEvent) => {
      if (!hasCursor) {
        sx = e.clientX;
        sy = e.clientY;
        hasCursor = true;
      }
      tx = e.clientX;
      ty = e.clientY;
    };
    const onLeave = () => {
      tx = -99999;
      ty = -99999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    const draw = (t: number, scroll: number, cursorOn: boolean) => {
      ctx.clearRect(0, 0, w, h);
      const slide = scroll * SCROLL_SLIDE;
      const offY = slide % SPACING;
      const rowBase = Math.floor(slide / SPACING);
      const cols = Math.ceil(w / SPACING) + 2;
      const rows = Math.ceil(h / SPACING) + 2;

      for (let gy = 0; gy < rows; gy++) {
        const y = gy * SPACING - offY;
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * SPACING;

          // ambient luminance wave, two crossing fronts
          const wave =
            0.5 +
            0.25 * Math.sin(x * 0.005 + y * 0.0035 + t) +
            0.25 * Math.sin(y * 0.006 - t * 0.7);

          // cursor influence (eased position, gaussian falloff)
          let inf = 0;
          let px = x;
          let py = y;
          if (cursorOn) {
            const dx = x - sx;
            const dy = y - sy;
            const d2 = dx * dx + dy * dy;
            if (d2 < CUTOFF2) {
              inf = grip * Math.exp(-d2 / (2 * SIGMA * SIGMA));
              const d = Math.sqrt(d2) + 1;
              px = x + (dx / d) * inf * PUSH;
              py = y + (dy / d) * inf * PUSH;
            }
          }

          const ember = hash(gx, gy + rowBase) < EMBER_RATIO;

          // color mixes from bone toward ember as influence rises
          const m = ember ? 1 : Math.min(inf * 1.5, 1);
          const l = 0.93 - 0.21 * m;
          const c = 0.006 + 0.149 * m;
          const hue = 82 - 32 * m;
          const a = ember
            ? 0.28 + 0.2 * wave + 0.4 * inf
            : 0.09 + 0.1 * wave + 0.55 * inf;
          const r = BASE_R + 0.3 * wave + 1.8 * inf + (ember ? 0.2 : 0);

          ctx.fillStyle = `oklch(${l} ${c} ${hue} / ${a})`;
          ctx.beginPath();
          ctx.arc(px, py, r, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(2.1, 0, false);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
      };
    }

    let raf = 0;
    let t = 0;
    let lastScroll = window.scrollY;
    let vel = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      const sc = window.scrollY;
      vel = vel * 0.86 + (sc - lastScroll) * 0.14;
      lastScroll = sc;
      const energy = Math.min(Math.abs(vel), 40);

      // scrolling energizes the ambient wave
      t += 0.0095 + energy * 0.0011;

      // cursor eases toward its target; grip fades in/out
      const present = tx > -9999;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      draw(t, sc, grip > 0.01);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onLeave);
    };
  }, []);

  return <canvas className="field" ref={ref} aria-hidden />;
}
