"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, cartography edition: an animated topographic map.
 * A domain-warped scalar "terrain" evolves slowly with time — the warp bends
 * the field so contours flow like real ridge lines instead of pooling into
 * blobs. Marching squares traces the elevation contours as hairlines — bone
 * for regular contours, ember for index contours — and each line's alpha
 * rises with elevation, lighting the relief from above. Scroll drifts the
 * landscape on an eased spring, and the terrain swells under a smoothed
 * cursor. Quiet enough to sit behind text. Reduced motion renders one
 * static survey.
 */

const CELL = 20; // sampling grid pitch in px — finer = smoother curves
const LEVELS = 12;
const INDEX_EVERY = 4; // every Nth contour is an ember index line
const BUMP_R = 130; // cursor bump radius
const BUMP_H = 0.38; // cursor bump height
const WARP = 70; // domain-warp amplitude in px

/* autonomous terrain features: peaks and basins that wander slowly and
   breathe on their own lifecycles — bullseyes emerge, merge into saddles,
   and sink away without any cursor involved */
type Peak = {
  cx: number; // anchor, 0..1 of viewport
  cy: number;
  ax: number; // wander amplitude, 0..1 of viewport
  ay: number;
  fx: number; // wander speeds
  fy: number;
  px: number; // wander phases
  py: number;
  sig2: number; // 2σ² of the gaussian footprint, px²
  hgt: number; // height (negative = basin)
  lf: number; // lifecycle speed
  lp: number; // lifecycle phase
  // per-frame state
  x: number;
  y: number;
  h: number;
  cut: number;
};

const makePeak = (basin: boolean): Peak => {
  const sig = 85 + Math.random() * 75;
  return {
    cx: 0.15 + Math.random() * 0.7,
    cy: 0.15 + Math.random() * 0.7,
    ax: 0.12 + Math.random() * 0.16,
    ay: 0.1 + Math.random() * 0.14,
    fx: 0.25 + Math.random() * 0.3,
    fy: 0.2 + Math.random() * 0.3,
    px: Math.random() * Math.PI * 2,
    py: Math.random() * Math.PI * 2,
    sig2: 2 * sig * sig,
    hgt: (basin ? -1 : 1) * (0.4 + Math.random() * 0.2),
    lf: 0.8 + Math.random() * 0.6,
    lp: Math.random() * Math.PI * 2,
    x: 0,
    y: 0,
    h: 0,
    cut: 9 * sig * sig,
  };
};

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

    // smoothed cursor with ease-back grip, matching the other fields
    let tx = -1;
    let ty = -1;
    let sx = 0;
    let sy = 0;
    let grip = 0;
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
      tx = -1;
      ty = -1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    /* three peaks and two basins, living their own slow lives */
    const peaks = [
      makePeak(false),
      makePeak(false),
      makePeak(false),
      makePeak(true),
      makePeak(true),
    ];

    /* domain-warped layered-sine terrain, normalized to roughly 0..1 —
       the warp bends the sample space so contours meander like ridge lines,
       and the wandering peaks raise their bullseyes on top */
    const sample = (t: number, scroll: number) => {
      const s = scroll * 0.00045;
      const sigma2 = 2 * BUMP_R * BUMP_R;

      // advance each feature: wander position + breathe height
      const active: Peak[] = [];
      for (const p of peaks) {
        const life = Math.max(0, Math.sin(t * p.lf + p.lp)) ** 1.3;
        p.h = p.hgt * life;
        if (Math.abs(p.h) < 0.03) continue; // dormant
        p.x = (p.cx + p.ax * Math.sin(t * p.fx + p.px)) * w;
        p.y = (p.cy + p.ay * Math.cos(t * p.fy + p.py)) * h;
        active.push(p);
      }

      for (let gy = 0; gy < rows; gy++) {
        const y = gy * CELL;
        for (let gx = 0; gx < cols; gx++) {
          const x = gx * CELL;
          const wx = x + WARP * Math.sin(y * 0.004 + t * 0.35);
          const wy = y + WARP * Math.cos(x * 0.0034 - t * 0.28);
          let n =
            0.5 +
            0.21 * Math.sin(wx * 0.0016 + t * 0.8 + s) +
            0.21 * Math.cos(wy * 0.0018 - t * 0.6 + s * 1.3) +
            0.13 * Math.sin((wx + wy) * 0.001 + t * 0.45) +
            0.09 * Math.sin(Math.hypot(x - w * 0.55, y - h * 0.4) * 0.002 - t * 0.7);
          for (const p of active) {
            const dx = x - p.x;
            const dy = y - p.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < p.cut) n += p.h * Math.exp(-d2 / p.sig2);
          }
          if (grip > 0.01) {
            const dx = x - sx;
            const dy = y - sy;
            n += grip * BUMP_H * Math.exp(-(dx * dx + dy * dy) / sigma2);
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

    const draw = (t: number, scroll: number) => {
      sample(t, scroll);
      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      // a luminous survey sweep climbs from the valleys to the summits,
      // brightening each contour ring as it passes; >1 range rests between
      const phase = (t * 0.38) % 1.35;
      for (let l = 0; l < LEVELS; l++) {
        const level = 0.08 + (l * 0.88) / (LEVELS - 1);
        const rise = l / (LEVELS - 1); // 0 valley floor → 1 summit
        const dp = (rise - phase) / 0.16;
        const sweep = Math.exp(-dp * dp);
        if (l % INDEX_EVERY === 0) {
          ctx.strokeStyle = `oklch(${0.72 + sweep * 0.08} 0.155 50 / ${
            0.2 + rise * 0.14 + sweep * 0.3
          })`;
          ctx.lineWidth = 1.2 + sweep * 0.5;
        } else {
          ctx.strokeStyle = `oklch(0.93 0.006 82 / ${0.09 + rise * 0.08 + sweep * 0.22})`;
          ctx.lineWidth = 1 + sweep * 0.3;
        }
        ctx.beginPath();
        trace(level);
        ctx.stroke();
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(1.7, 0);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
      };
    }

    let raf = 0;
    let t = 0;
    let smooth = window.scrollY; // eased scroll → the landscape glides
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      t += 0.0048;
      smooth += (window.scrollY - smooth) * 0.1;

      const present = tx >= 0;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      draw(t, smooth);
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
