"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, final form: woven iron silk.
 *
 * A single sheet of sparse hairline threads undulates in slow motion — long
 * wavelengths, generous amplitude, drawn as smooth quadratic curves so each
 * thread reads as silk rather than segments. Neighboring threads drift apart
 * and braid back together, and every thread catches light on the rising side
 * of its folds — a shimmer that travels with the wave. Wind gusts billow
 * across the sheet, a satin sheen band sweeps down it, and ember signals run
 * the threads in both directions: when two meet, their glow swells, they
 * burst, and the debris scatters. Now and then something brushes a thread and
 * it vibrates. The sheet lifts around a smoothed cursor, breathes on its own,
 * and scroll velocity stirs it gently. Flat color, crisp lines, no glow.
 * Reduced motion renders a single still weave.
 */

const ROW_GAP = 34;
const X_STEP = 14;
const AMP = 30;
const SIGMA = 150; // cursor influence radius
const LIFT = 44; // max px the sheet lifts around the cursor
const PULSE_RATIO = 0.45; // fraction of threads carrying a signal
const REVERSE_RATIO = 0.35; // fraction of those running right-to-left
const DUPLEX_RATIO = 0.22; // fraction of signal threads with return traffic
const PULSE_LEN = 150;

/* a plucked thread: a vibration rippling out from the pluck point, decaying */
type Pluck = { j: number; x0: number; t0: number };

/* clash debris: when two signals collide they burst into scattering sparks */
type Spark = { x: number; y: number; vx: number; vy: number; t0: number };

/* wind gusts: traveling swells that locally billow the weave */
type Gust = {
  cy: number; // vertical anchor, 0..1
  vx: number; // horizontal crossing speed
  px: number; // crossing phase
  ay: number; // vertical bob amplitude, 0..1
  fy: number; // vertical bob speed
  s: number; // swell strength
  sig2: number;
  cut: number;
  x: number; // per-frame state
  y: number;
};

const makeGust = (seedY: number): Gust => {
  const sig = 200 + Math.random() * 70;
  return {
    cy: seedY,
    vx: 0.09 + Math.random() * 0.05,
    px: Math.random(),
    ay: 0.08 + Math.random() * 0.08,
    fy: 0.3 + Math.random() * 0.3,
    s: 0.55 + Math.random() * 0.3,
    sig2: 2 * sig * sig,
    cut: 9 * sig * sig,
    x: 0,
    y: 0,
  };
};

/* deterministic per-thread hash */
const hash = (j: number) => {
  const s = Math.sin(j * 127.1) * 43758.5453;
  return s - Math.floor(s);
};

export default function SilkField() {
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

    // smoothed cursor with ease-back grip
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

    /* long, layered waves; the strong per-thread phase term makes neighbors
       drift apart and braid back together instead of moving in lockstep */
    const wave = (x: number, j: number, t: number) =>
      Math.sin(x * 0.0021 + t * 0.7 + j * 0.55) * 0.45 +
      Math.sin(x * 0.0009 - t * 0.45 + j * 0.21) * 0.35 +
      Math.sin(x * 0.0004 + t * 0.28 + j * 1.35) * 0.3;

    const gusts = [makeGust(0.3), makeGust(0.7)];
    let plucks: Pluck[] = [];
    let sparks: Spark[] = [];
    let wobbles: Pluck[] = []; // clash shocks: the whole thread rings
    const lastDelta = new Map<number, number>(); // per-thread head separation

    const draw = (t: number, energy: number) => {
      ctx.clearRect(0, 0, w, h);
      // the sheet breathes slowly on its own; scroll adds a gentle swell
      const amp = AMP * (1 + 0.1 * Math.sin(t * 0.45)) * (1 + energy * 0.35);
      const sig2 = 2 * SIGMA * SIGMA;
      const rows = Math.ceil(h / ROW_GAP) + 3;

      // advance the gusts: each crosses the sheet, bobbing gently
      for (const g of gusts) {
        const prog = (t * g.vx + g.px) % 1.5; // >1 range: rests off-screen
        g.x = prog * (w + 700) - 350;
        g.y = (g.cy + g.ay * Math.sin(t * g.fy)) * h;
      }

      // the sheen band sweeps down the fabric, then rests before returning
      const sheenY = ((t * 0.055) % 1.4) * (h + 500) - 250;

      const yOf = (x: number, j: number, baseY: number) => {
        let m = 1;
        for (const g of gusts) {
          const gdx = x - g.x;
          const gdy = baseY - g.y;
          const d2 = gdx * gdx + gdy * gdy;
          if (d2 < g.cut) m += g.s * Math.exp(-d2 / g.sig2);
        }
        let y = baseY + wave(x, j, t) * amp * m;
        const dx = x - sx;
        const dy = baseY - sy;
        y -= grip * Math.exp(-(dx * dx + dy * dy) / sig2) * LIFT;
        for (const p of plucks) {
          if (p.j !== j) continue;
          const age = t - p.t0;
          const dx0 = x - p.x0;
          y +=
            9 *
            Math.exp(-age * 2.2) *
            Math.sin(age * 26 - Math.abs(dx0) * 0.045) *
            Math.exp(-(dx0 * dx0) / 16900);
        }
        // a clash shock rings the entire thread: the wave radiates from the
        // collision point down the full length, decaying as it goes
        for (const wb of wobbles) {
          if (wb.j !== j) continue;
          const age = t - wb.t0;
          const dx0 = x - wb.x0;
          y +=
            7 *
            Math.exp(-age * 1.9) *
            Math.sin(age * 22 - Math.abs(dx0) * 0.018) *
            (0.55 + 0.45 * Math.exp(-(dx0 * dx0) / 360000));
        }
        return y;
      };

      /* one traveling signal on thread j; returns the head x for clashes */
      const drawPulse = (j: number, baseY: number, dir: number, seed: number) => {
        const speed = (120 + hash(j + 99 + seed) * 260) * (1 + energy * 0.5);
        const span = w + 500;
        let head = ((t * speed + hash(j + 7 + seed) * span) % span) - 250;
        if (dir < 0) head = w - head;
        for (let off = 0; off <= PULSE_LEN; off += X_STEP) {
          const x = head - dir * off;
          const x2 = x + dir * X_STEP;
          if (Math.min(x, x2) < 0 || Math.max(x, x2) > w) continue;
          const k = 1 - off / PULSE_LEN; // 0 tail → 1 head
          const a = 0.42 * k * k;
          if (a < 0.02) continue;
          ctx.strokeStyle = `oklch(${0.72 + 0.1 * k} 0.155 50 / ${a})`;
          ctx.lineWidth = 1.3;
          ctx.beginPath();
          ctx.moveTo(x, yOf(x, j, baseY));
          ctx.lineTo(x2, yOf(x2, j, baseY));
          ctx.stroke();
        }
        if (head > 0 && head < w) {
          ctx.fillStyle = "oklch(0.83 0.13 55 / 0.65)";
          ctx.beginPath();
          ctx.arc(head, yOf(head, j, baseY), 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
        return head;
      };

      const pts: number[] = [];
      for (let r = -1; r < rows; r++) {
        const j = r;
        const baseY = r * ROW_GAP;

        // sample the thread once, reuse for both passes
        pts.length = 0;
        for (let x = 0; x <= w + X_STEP; x += X_STEP) {
          pts.push(x, yOf(x, j, baseY));
        }

        // the thread, as a smooth curve, brightened under the sheen band
        const sd = (baseY - sheenY) / 170;
        const sheen = Math.exp(-sd * sd);
        ctx.strokeStyle = `oklch(0.93 0.006 82 / ${0.085 + sheen * 0.08})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let i = 2; i < pts.length - 2; i += 2) {
          const xc = (pts[i] + pts[i + 2]) / 2;
          const yc = (pts[i + 1] + pts[i + 3]) / 2;
          ctx.quadraticCurveTo(pts[i], pts[i + 1], xc, yc);
        }
        ctx.stroke();

        // silk catches light on the rising side of each fold — a shimmer
        // that travels with the wave itself
        ctx.strokeStyle = `oklch(0.93 0.006 82 / ${0.07 + sheen * 0.07})`;
        ctx.beginPath();
        for (let i = 0; i < pts.length - 2; i += 2) {
          if (pts[i + 3] - pts[i + 1] < -2.4) {
            ctx.moveTo(pts[i], pts[i + 1]);
            ctx.lineTo(pts[i + 2], pts[i + 3]);
          }
        }
        ctx.stroke();

        // its signal — some threads carry return traffic too. A clash plays
        // in three acts: the glow grows, they burst, the debris separates.
        if (hash(j) < PULSE_RATIO) {
          const dir = hash(j + 31) < REVERSE_RATIO ? -1 : 1;
          const h1 = drawPulse(j, baseY, dir, 0);
          if (hash(j + 57) < DUPLEX_RATIO) {
            const h2 = drawPulse(j, baseY, -dir, 40);
            const onstage = h1 > 0 && h1 < w && h2 > 0 && h2 < w;
            const delta = h1 - h2;

            // act one: anticipation — the glow swells as they approach
            const d = Math.abs(delta);
            if (onstage && d < 48) {
              const near = 1 - d / 48;
              const xm = (h1 + h2) / 2;
              ctx.fillStyle = `oklch(0.87 0.11 60 / ${0.6 * near * near})`;
              ctx.beginPath();
              ctx.arc(xm, yOf(xm, j, baseY), 1.5 + near * 2.6, 0, Math.PI * 2);
              ctx.fill();
            }

            // act two: the crossing — sign flip means they just collided
            const prev = lastDelta.get(j);
            lastDelta.set(j, delta);
            if (
              onstage &&
              prev !== undefined &&
              Math.sign(prev) !== Math.sign(delta) &&
              d < 60
            ) {
              const xm = (h1 + h2) / 2;
              const ym = yOf(xm, j, baseY);
              for (let i = 0; i < 8; i++) {
                const ang = Math.random() * Math.PI * 2;
                const sp = 0.5 + Math.random() * 1.5;
                sparks.push({
                  x: xm,
                  y: ym,
                  vx: Math.cos(ang) * sp * 1.7, // debris flies along the weave
                  vy: Math.sin(ang) * sp * 0.8,
                  t0: t,
                });
              }
              wobbles.push({ j, x0: xm, t0: t }); // and the thread rings
            }
          }
        }
      }

      // act three: the debris separates, slows, and fades
      sparks = sparks.filter((s) => t - s.t0 < 0.5);
      for (const s of sparks) {
        const age = (t - s.t0) / 0.5;
        s.x += s.vx * (1 - age * 0.6);
        s.y += s.vy * (1 - age * 0.6);
        const a = 0.7 * (1 - age) * (1 - age);
        ctx.fillStyle = `oklch(0.8 0.13 55 / ${a})`;
        ctx.fillRect(s.x - 0.8, s.y - 0.8, 1.6, 1.6);
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(4.2, 0);
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
    let energy = 0;
    let nextPluckT = 1.5;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      t += 0.0075;

      // now and then, something brushes a thread
      plucks = plucks.filter((p) => t - p.t0 < 2);
      wobbles = wobbles.filter((wb) => t - wb.t0 < 2.5);
      if (t >= nextPluckT) {
        const rows = Math.ceil(h / ROW_GAP) + 3;
        plucks.push({
          j: Math.floor(Math.random() * rows) - 1,
          x0: w * (0.1 + Math.random() * 0.8),
          t0: t,
        });
        nextPluckT = t + 1.2 + Math.random() * 1.6;
      }

      const present = tx >= 0;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      // scroll velocity stirs the weave gently; position leaves it alone
      const sc = window.scrollY;
      vel = vel * 0.9 + Math.abs(sc - lastScroll) * 0.1;
      lastScroll = sc;
      energy += (Math.min(0.6, vel * 0.018) - energy) * 0.05;

      draw(t, energy);
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
