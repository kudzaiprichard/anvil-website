"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, cartography edition: an animated topographic map.
 * A smooth scalar "terrain" evolves slowly with time; marching squares traces
 * its elevation contours as hairlines — bone for regular contours, ember for
 * index contours. Scrolling drifts the landscape, and the terrain rises under
 * the cursor so contours bulge around it. Quiet enough to sit behind text.
 * Reduced motion renders one static survey.
 */

const CELL = 26; // sampling grid pitch in px
const LEVELS = 12;
const INDEX_EVERY = 4; // every Nth contour is an ember index line
const BUMP_R = 130; // cursor bump radius
const BUMP_H = 0.4; // cursor bump height

const BONE_LINE = "oklch(0.93 0.006 82 / 0.095)";
const EMBER_LINE = "oklch(0.72 0.155 50 / 0.21)";

export default function TopoField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let cols = 0;
    let rows = 0;
    let vals = new Float32Array(0);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cols = Math.ceil(w / CELL) + 2;
      rows = Math.ceil(h / CELL) + 2;
      vals = new Float32Array(cols * rows);
    };
    resize();
    window.addEventListener("resize", resize);

    let mx = -99999;
    let my = -99999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -99999;
      my = -99999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    /* layered-sine terrain, normalized to roughly 0..1 */
    const sample = (t: number, scroll: number) => {
      const s = scroll * 0.00045;
      const sigma2 = 2 * BUMP_R * BUMP_R;
      for (let gy = 0; gy < rows; gy++) {
        const y = gy * CELL;
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * CELL;
          let n =
            0.5 +
            0.24 * Math.sin(x * 0.0015 + t * 0.9 + s) +
            0.24 * Math.cos(y * 0.0017 - t * 0.7 + s * 1.4) +
            0.17 * Math.sin((x + y) * 0.001 + t * 0.5) +
            0.13 * Math.sin(Math.hypot(x - w * 0.5, y - h * 0.5) * 0.0021 - t * 0.8);
          if (mx > -9999) {
            const dx = x - mx;
            const dy = y - my;
            n += BUMP_H * Math.exp(-(dx * dx + dy * dy) / sigma2);
          }
          vals[gy * cols + gx] = n;
        }
      }
    };

    /* marching squares over the cached grid for one iso-level */
    const trace = (level: number) => {
      for (let gy = 0; gy < rows - 1; gy++) {
        const y0 = gy * CELL;
        const y1 = y0 + CELL;
        for (let gx = 0; gx < cols - 1; gx++) {
          const x0 = gx * CELL;
          const x1 = x0 + CELL;
          const tl = vals[gy * cols + gx];
          const tr = vals[gy * cols + gx + 1];
          const br = vals[(gy + 1) * cols + gx + 1];
          const bl = vals[(gy + 1) * cols + gx];
          let idx = 0;
          if (tl > level) idx |= 8;
          if (tr > level) idx |= 4;
          if (br > level) idx |= 2;
          if (bl > level) idx |= 1;
          if (idx === 0 || idx === 15) continue;

          // interpolated crossing points on each edge
          const top = () => [x0 + (CELL * (level - tl)) / (tr - tl), y0] as const;
          const right = () => [x1, y0 + (CELL * (level - tr)) / (br - tr)] as const;
          const bottom = () => [x0 + (CELL * (level - bl)) / (br - bl), y1] as const;
          const left = () => [x0, y0 + (CELL * (level - tl)) / (bl - tl)] as const;

          const seg = (a: readonly [number, number], b: readonly [number, number]) => {
            ctx.moveTo(a[0], a[1]);
            ctx.lineTo(b[0], b[1]);
          };

          switch (idx) {
            case 1:
            case 14:
              seg(left(), bottom());
              break;
            case 2:
            case 13:
              seg(bottom(), right());
              break;
            case 3:
            case 12:
              seg(left(), right());
              break;
            case 4:
            case 11:
              seg(top(), right());
              break;
            case 5:
              seg(left(), top());
              seg(bottom(), right());
              break;
            case 6:
            case 9:
              seg(top(), bottom());
              break;
            case 7:
            case 8:
              seg(left(), top());
              break;
            case 10:
              seg(top(), right());
              seg(left(), bottom());
              break;
          }
        }
      }
    };

    const draw = (t: number) => {
      sample(t, window.scrollY);
      ctx.clearRect(0, 0, w, h);
      ctx.lineWidth = 1;
      for (let l = 0; l < LEVELS; l++) {
        const level = 0.08 + (l * 0.88) / (LEVELS - 1);
        ctx.strokeStyle = l % INDEX_EVERY === 0 ? EMBER_LINE : BONE_LINE;
        ctx.beginPath();
        trace(level);
        ctx.stroke();
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1.7);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
      };
    }

    let raf = 0;
    let t = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      t += 0.0038;
      draw(t);
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
