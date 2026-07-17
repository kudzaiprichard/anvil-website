"use client";

import { useEffect, useRef } from "react";

/*
 * The living background: a flow-field of particle streaks drifting across the
 * iron plate. Instead of wandering noise, the field cycles through a
 * choreographed set of designed patterns — laminar silk waves, a spiral ring
 * vortex, twin counter-rotating vortices slowly orbiting each other, and a
 * precessing dipole rosette — crossfading smoothly from one to the next so the
 * streaks keep organizing into deliberate compositions. Each particle draws
 * its own comet trail (tapering alpha, crisp on a cleared canvas — no
 * accumulation smudge), embers carry a bright head like the silk field's
 * signals. Scroll shifts the field's phase, the cursor bends nearby streaks
 * away. Flat color, no glow. Reduced motion renders nothing.
 */

const COUNT = 175;
const EMBER_RATIO = 0.11;
const DRIFT_RATIO = 0.35; // fraction that always rides the waves field
const HISTORY = 44; // trail points per particle
const BUCKETS = 8; // alpha bands the trails are batched into
const DWELL = 12; // seconds a pattern holds its shape
const FADE = 4; // seconds to morph into the next pattern
const SPEED = 1.15;

const BONE_HEAD = 0.2; // trail alpha at the head — quiet, behind the content
const EMBER_HEAD = 0.4;

type P = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ember: boolean;
  drifter: boolean; // ambient ensemble vs. pattern soloist
  pace: number; // per-particle speed factor
  hx: number[]; // trail history, oldest first
  hy: number[];
};
type Vec = { x: number; y: number };

export default function FieldCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let sc = 0; // scroll phase, set once per frame
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    /* ---- the designed patterns; each writes a unit direction into v ---- */

    // laminar ribbons undulating gently to the right
    const waves = (x: number, y: number, t: number, v: Vec) => {
      const a =
        -0.3 +
        0.6 * Math.sin(y * 0.0042 + t * 0.55 + sc) +
        0.22 * Math.sin(x * 0.0021 - t * 0.35);
      v.x = Math.cos(a);
      v.y = Math.sin(a);
    };

    // one grand vortex: orbits steer toward a breathing ring, arms spiral in
    const vortex = (x: number, y: number, t: number, v: Vec) => {
      const cx = w * 0.5;
      const cy = h * 0.46;
      const dx = x - cx;
      const dy = y - cy;
      const r = Math.hypot(dx, dy) || 1;
      const R = Math.min(w, h) * (0.3 + 0.05 * Math.sin(t * 0.4));
      const tilt = Math.max(-0.35, Math.min(0.35, ((r - R) / R) * 0.5));
      const a = Math.atan2(dy, dx) + Math.PI / 2 + tilt + sc * 0.4;
      v.x = Math.cos(a);
      v.y = Math.sin(a);
    };

    // twin counter-rotating vortices, the pair itself slowly orbiting
    const twin = (x: number, y: number, t: number, v: Vec) => {
      const s2 = Math.min(w, h) ** 2;
      const rot = t * 0.06 + sc * 0.3;
      const ox = Math.cos(rot) * w * 0.2;
      const oy = Math.sin(rot) * h * 0.16;
      let vx = 0;
      let vy = 0;
      for (const spin of [1, -1]) {
        const dx = x - (w * 0.5 + ox * spin);
        const dy = y - (h * 0.5 + oy * spin);
        // tighter falloff than the grand vortex so both swirls read clearly
        const fall = (s2 * 0.05) / (dx * dx + dy * dy + s2 * 0.008);
        vx += -dy * spin * fall;
        vy += dx * spin * fall;
      }
      const m = Math.hypot(vx, vy) || 1;
      v.x = vx / m;
      v.y = vy / m;
    };

    // dipole rosette: field-line lobes around the center, slowly precessing
    const rose = (x: number, y: number, t: number, v: Vec) => {
      const th = Math.atan2(y - h * 0.46, x - w * 0.5);
      const a = 2 * th + Math.PI / 2 + t * 0.12 + sc * 0.4;
      v.x = Math.cos(a);
      v.y = Math.sin(a);
    };

    const patterns = [waves, vortex, twin, rose];
    const va: Vec = { x: 0, y: 0 };
    const vb: Vec = { x: 0, y: 0 };

    const parts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      ember: Math.random() < EMBER_RATIO,
      drifter: Math.random() < DRIFT_RATIO,
      pace: 0.8 + Math.random() * 0.5,
      hx: [],
      hy: [],
    }));

    let mx = -9999;
    let my = -9999;
    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
    };
    const onLeave = () => {
      mx = -9999;
      my = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    /* trail segments batched into alpha bands: one stroke per band per color
       instead of one per segment — the whole field is ~2×BUCKETS strokes */
    const strokeTrails = (ember: boolean) => {
      const head = ember ? EMBER_HEAD : BONE_HEAD;
      ctx.lineWidth = ember ? 1.1 : 1;
      for (let b = 0; b < BUCKETS; b++) {
        const fade = (b + 0.5) / BUCKETS; // 0 head → 1 tail
        const a = head * (1 - fade) * (1 - fade);
        ctx.strokeStyle = ember
          ? `oklch(0.72 0.155 50 / ${a})`
          : `oklch(0.93 0.006 82 / ${a})`;
        ctx.beginPath();
        for (const p of parts) {
          if (p.ember !== ember) continue;
          const n = p.hx.length;
          if (n < 2) continue;
          // history is oldest-first; bucket 0 holds the newest segments
          const from = Math.max(0, n - 1 - Math.round(((b + 1) / BUCKETS) * (n - 1)));
          const to = n - 1 - Math.round((b / BUCKETS) * (n - 1));
          if (to <= from) continue;
          ctx.moveTo(p.hx[from], p.hy[from]);
          for (let k = from + 1; k <= to; k++) ctx.lineTo(p.hx[k], p.hy[k]);
        }
        ctx.stroke();
      }
    };

    let raf = 0;
    let t0 = -1;

    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      if (t0 < 0) t0 = now; // rAF timestamps can predate mount-time clocks
      const t = (now - t0) / 1000;
      sc = window.scrollY * 0.0006;

      // which pattern is on stage, and how far into the morph to the next
      const cycle = DWELL + FADE;
      const ph = (t / cycle) % patterns.length;
      const i = Math.floor(ph);
      const into = (ph - i) * cycle;
      const raw = Math.max(0, (into - DWELL) / FADE);
      const mix = raw * raw * (3 - 2 * raw); // smoothstep crossfade
      const cur = patterns[i];
      const nxt = patterns[(i + 1) % patterns.length];

      for (const p of parts) {
        // drifters keep the whole frame alive while the soloists gather
        // into the vortex / twin / rosette figures
        if (p.drifter) {
          waves(p.x, p.y, t, va);
        } else {
          cur(p.x, p.y, t, va);
        }
        let dx = va.x;
        let dy = va.y;
        if (!p.drifter && mix > 0) {
          nxt(p.x, p.y, t, vb);
          dx = dx * (1 - mix) + vb.x * mix;
          dy = dy * (1 - mix) + vb.y * mix;
        }
        const m = Math.hypot(dx, dy) || 1;
        const spd = SPEED * p.pace * (p.ember ? 1.2 : 1);
        let tx = (dx / m) * spd;
        let ty = (dy / m) * spd;

        // gentle repulsion from the cursor
        const rx = p.x - mx;
        const ry = p.y - my;
        const d2 = rx * rx + ry * ry;
        if (d2 < 32400) {
          const d = Math.sqrt(d2) || 1;
          const f = ((180 - d) / 180) * 1.4;
          tx += (rx / d) * f;
          ty += (ry / d) * f;
        }

        // ease toward the field — smooth, curving turns
        p.vx += (tx - p.vx) * 0.07;
        p.vy += (ty - p.vy) * 0.07;
        p.x += p.vx;
        p.y += p.vy;

        // wrap breaks the trail so no line shoots across the screen
        if (p.x < -10 || p.x > w + 10 || p.y < -10 || p.y > h + 10) {
          if (p.x < -10) p.x = w + 10;
          if (p.x > w + 10) p.x = -10;
          if (p.y < -10) p.y = h + 10;
          if (p.y > h + 10) p.y = -10;
          p.hx.length = 0;
          p.hy.length = 0;
        }

        p.hx.push(p.x);
        p.hy.push(p.y);
        if (p.hx.length > HISTORY) {
          p.hx.shift();
          p.hy.shift();
        }
      }

      ctx.clearRect(0, 0, w, h);
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      strokeTrails(false);
      strokeTrails(true);

      // embers carry a dim comet head, kin to the silk field's signals
      ctx.fillStyle = "oklch(0.8 0.12 52 / 0.45)";
      for (const p of parts) {
        if (!p.ember || p.hx.length < 2) continue;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
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
