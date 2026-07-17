"use client";

import { useEffect, useRef } from "react";

/*
 * The void: a deep-space starfield beneath the foreground background layer.
 *
 * Three prerendered dust layers (hundreds of near-subliminal points, brightness
 * exponentially skewed dim) parallax at different depths under a whisper-faint
 * nebular haze, giving the abyss its depth. A small cast of brighter stars is
 * drawn live with slow scintillation — two incommensurate sines, gentle
 * amplitude, never off — and the brightest carry a soft halo. The whole field
 * drifts sidereally slowly, scroll glides with inertia (eased, per-depth
 * parallax) and fast scrolling adds only a capped motion blur. Everything sits
 * in the site's bone palette with rare ember-warm giants, kept dimmer than the
 * foreground line-work so the two layers read as one scene.
 * Reduced motion renders one still night.
 */

/* dust layers, far → near */
const LAYERS = [
  { count: 420, depth: 0.015, rMax: 0.7, aMax: 0.15, drift: 1.4 },
  { count: 260, depth: 0.045, rMax: 1.0, aMax: 0.2, drift: 2.6 },
  { count: 130, depth: 0.09, rMax: 1.4, aMax: 0.26, drift: 4.2 },
];
const BRIGHT_COUNT = 44;
const BLUR_CAP = 9; // max px of scroll motion blur
const METEOR_GAP_MS: [number, number] = [12000, 12000]; // min, extra random
const METEOR_LIFE_MS = 1100;

type Bright = {
  x: number; // 0..1 of width
  y: number; // 0..1 of height
  r: number;
  base: number; // base alpha
  amp: number; // scintillation amplitude (fraction of base)
  speed: number; // scintillation speed, rad/s
  p1: number;
  p2: number;
  depth: number;
  tint: string;
};

type Meteor = { x: number; y: number; vx: number; vy: number; bornAt: number };

/* star color temperatures, in the site's oklch language */
const NEUTRAL = "0.93 0.006 82"; // bone white
const COOL = "0.9 0.028 250"; // blue-white
const WARM = "0.89 0.04 72"; // warm white
const EMBER = "0.78 0.1 50"; // rare orange giant, echoes the accent

const pickTint = () => {
  const r = Math.random();
  if (r < 0.58) return NEUTRAL;
  if (r < 0.82) return COOL;
  if (r < 0.96) return WARM;
  return EMBER;
};

/* many dim, few bright */
const skew = (pow: number) => Math.pow(Math.random(), pow);

/*
 * intensity scales how present the void is: 1 is the quiet sky tuned to sit
 * under busy line-work; sparser foregrounds (the flow-field) ask for more —
 * denser dust, stronger haze, more bright stars — so the abyss carries the
 * frame on its own.
 */
export default function StarVoid({ intensity = 1 }: { intensity?: number }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const boost = 0.7 + 0.3 * intensity; // gentler ramp for alphas

    let w = 0;
    let h = 0;
    let dpr = 1;
    let layerCanvases: HTMLCanvasElement[] = [];

    /* stable normalized star positions so resize keeps the same sky */
    const layerStars = LAYERS.map((l) =>
      Array.from({ length: Math.round(l.count * intensity) }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: skew(2.6), // radius factor, heavily small-skewed
        mag: skew(2.2), // brightness factor, heavily dim-skewed
        tint: pickTint(),
      })),
    );

    /* nebular haze blobs along a loose diagonal band, on the deepest layer */
    const haze = Array.from({ length: 7 }, (_, i) => {
      const f = i / 6;
      return {
        x: 0.08 + f * 0.86 + (Math.random() - 0.5) * 0.22,
        y: 0.82 - f * 0.62 + (Math.random() - 0.5) * 0.26,
        r: 0.18 + Math.random() * 0.22, // fraction of the larger viewport side
        a: (0.008 + Math.random() * 0.009) * intensity,
        tint: Math.random() < 0.75 ? NEUTRAL : EMBER,
      };
    });

    /* paint at every wrapped position so prerendered tiles are seamless */
    const wrapped = (
      x: number,
      y: number,
      r: number,
      paint: (px: number, py: number) => void,
    ) => {
      for (const ox of [-w, 0, w]) {
        for (const oy of [-h, 0, h]) {
          const px = x + ox;
          const py = y + oy;
          if (px + r < 0 || px - r > w || py + r < 0 || py - r > h) continue;
          paint(px, py);
        }
      }
    };

    const buildLayers = () => {
      layerCanvases = LAYERS.map((l, li) => {
        const off = document.createElement("canvas");
        off.width = Math.max(1, Math.round(w * dpr));
        off.height = Math.max(1, Math.round(h * dpr));
        const c = off.getContext("2d")!;
        c.setTransform(dpr, 0, 0, dpr, 0, 0);

        if (li === 0) {
          const side = Math.max(w, h);
          for (const b of haze) {
            const r = b.r * side;
            wrapped(b.x * w, b.y * h, r, (px, py) => {
              const g = c.createRadialGradient(px, py, 0, px, py, r);
              g.addColorStop(0, `oklch(${b.tint} / ${b.a})`);
              g.addColorStop(1, `oklch(${b.tint} / 0)`);
              c.fillStyle = g;
              c.fillRect(px - r, py - r, r * 2, r * 2);
            });
          }
        }

        for (const st of layerStars[li]) {
          const r = 0.3 + st.size * (l.rMax - 0.3);
          const a = (0.03 + st.mag * (l.aMax - 0.03)) * boost;
          const halo = r > 1.05;
          wrapped(st.x * w, st.y * h, halo ? r * 4 : r, (px, py) => {
            if (halo) {
              const g = c.createRadialGradient(px, py, 0, px, py, r * 4);
              g.addColorStop(0, `oklch(${st.tint} / ${a * 0.35})`);
              g.addColorStop(1, `oklch(${st.tint} / 0)`);
              c.fillStyle = g;
              c.fillRect(px - r * 4, py - r * 4, r * 8, r * 8);
            }
            c.fillStyle = `oklch(${st.tint} / ${a})`;
            c.beginPath();
            c.arc(px, py, r, 0, Math.PI * 2);
            c.fill();
          });
        }
        return off;
      });
    };

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildLayers();
    };
    resize();
    window.addEventListener("resize", resize);

    const bright: Bright[] = Array.from(
      { length: Math.round(BRIGHT_COUNT * intensity) },
      () => {
        const size = skew(2.4);
        return {
          x: Math.random(),
          y: Math.random(),
          r: 0.7 + size * 1.4,
          base: (0.16 + skew(1.8) * 0.3) * boost,
          amp: 0.1 + size * 0.16, // brighter stars scintillate more, still subtle
          speed: 0.35 + Math.random() * 0.55,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
          depth: 0.055 + Math.random() * 0.05,
          tint: pickTint(),
        };
      },
    );

    let meteor: Meteor | null = null;
    let nextMeteorAt = performance.now() + 7000;

    const drawMeteor = (now: number) => {
      if (!meteor) {
        if (now >= nextMeteorAt) {
          const leftward = Math.random() < 0.4;
          meteor = {
            x: leftward ? w * (0.3 + Math.random() * 0.7) : w * Math.random() * 0.7,
            y: h * Math.random() * 0.45,
            vx: (5 + Math.random() * 4) * (leftward ? -1 : 1),
            vy: 2 + Math.random() * 2.5,
            bornAt: now,
          };
        }
        return;
      }
      const age = (now - meteor.bornAt) / METEOR_LIFE_MS;
      if (age >= 1 || meteor.x < -90 || meteor.x > w + 90 || meteor.y > h + 90) {
        meteor = null;
        nextMeteorAt = now + METEOR_GAP_MS[0] + Math.random() * METEOR_GAP_MS[1];
        return;
      }
      meteor.x += meteor.vx;
      meteor.y += meteor.vy;

      // eased brightness: fades in, peaks, burns out
      const glow = Math.sin(Math.PI * age) * 0.55;
      const tx = meteor.x - meteor.vx * 11;
      const ty = meteor.y - meteor.vy * 11;
      const g = ctx.createLinearGradient(meteor.x, meteor.y, tx, ty);
      g.addColorStop(0, `oklch(${NEUTRAL} / ${glow})`);
      g.addColorStop(0.25, `oklch(${WARM} / ${glow * 0.4})`);
      g.addColorStop(1, `oklch(${WARM} / 0)`);
      ctx.strokeStyle = g;
      ctx.lineWidth = 1.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(meteor.x, meteor.y);
      ctx.lineTo(tx, ty);
      ctx.stroke();
      ctx.lineCap = "butt";
    };

    /* tile a prerendered layer across the viewport at a wrapped offset */
    const tile = (img: HTMLCanvasElement, ox: number, oy: number) => {
      ox = ((ox % w) + w) % w;
      oy = ((oy % h) + h) % h;
      ctx.drawImage(img, ox - w, oy - h, w, h);
      ctx.drawImage(img, ox, oy - h, w, h);
      ctx.drawImage(img, ox - w, oy, w, h);
      ctx.drawImage(img, ox, oy, w, h);
    };

    const draw = (tSec: number, scroll: number, vel: number, animate: boolean) => {
      ctx.clearRect(0, 0, w, h);

      // dust layers: sidereal drift + eased scroll parallax + capped motion blur
      LAYERS.forEach((l, li) => {
        const dx = -tSec * (l.drift / 60);
        const dy = -tSec * (l.drift / 36) - scroll * l.depth;
        const blur = Math.max(-BLUR_CAP, Math.min(BLUR_CAP, vel * l.depth * 6));
        if (animate && Math.abs(blur) > 0.8) {
          ctx.globalAlpha = 0.35;
          tile(layerCanvases[li], dx, dy + blur);
          ctx.globalAlpha = 1;
        }
        tile(layerCanvases[li], dx, dy);
      });

      // bright stars, drawn live with slow scintillation
      const span = h + 40;
      for (const st of bright) {
        let y = (st.y * h - tSec * 0.12 - scroll * st.depth) % span;
        if (y < 0) y += span;
        y -= 20;
        const x = st.x * w;

        // two incommensurate sines: a slow shimmer that never strobes
        const s = animate
          ? 0.5 + 0.5 * Math.sin(tSec * st.speed + st.p1) * Math.sin(tSec * st.speed * 1.71 + st.p2)
          : 0.5;
        const a = st.base * (1 - st.amp + st.amp * (0.4 + 1.2 * s));

        if (st.r > 1.3) {
          const hr = st.r * 5;
          const g = ctx.createRadialGradient(x, y, 0, x, y, hr);
          g.addColorStop(0, `oklch(${st.tint} / ${a * 0.3})`);
          g.addColorStop(1, `oklch(${st.tint} / 0)`);
          ctx.fillStyle = g;
          ctx.fillRect(x - hr, y - hr, hr * 2, hr * 2);
        }

        const blur = Math.max(-BLUR_CAP, Math.min(BLUR_CAP, vel * st.depth * 6));
        ctx.fillStyle = `oklch(${st.tint} / ${a})`;
        if (animate && Math.abs(blur) > 1.2) {
          ctx.strokeStyle = `oklch(${st.tint} / ${a * 0.8})`;
          ctx.lineWidth = st.r * 1.6;
          ctx.lineCap = "round";
          ctx.beginPath();
          ctx.moveTo(x, y);
          ctx.lineTo(x, y - blur);
          ctx.stroke();
          ctx.lineCap = "butt";
        } else {
          ctx.beginPath();
          ctx.arc(x, y, st.r, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      if (animate) drawMeteor(performance.now());
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(0, 0, 0, false);
      return () => window.removeEventListener("resize", resize);
    }

    let raf = 0;
    const t0 = performance.now();
    let lastScroll = window.scrollY;
    let smooth = window.scrollY; // eased scroll → inertial parallax glide
    let vel = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      const sc = window.scrollY;
      vel = vel * 0.88 + (sc - lastScroll) * 0.12; // smoothed scroll velocity
      lastScroll = sc;
      smooth += (sc - smooth) * 0.12;

      draw((now - t0) / 1000, smooth, vel, true);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, [intensity]);

  return <canvas className="field" ref={ref} aria-hidden />;
}
