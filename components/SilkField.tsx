"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, final form: woven iron silk.
 *
 * A full-page sheet of fine hairline wires undulates like fabric in slow
 * motion. Ember signal pulses travel along the wires at their own speeds —
 * data moving through the machine — each with a bright comet head and a
 * fading tail. The sheet lifts and parts around a smoothed cursor that eases
 * back, and scroll velocity agitates the weave: amplitude, flow, and pulse
 * speed all surge, and the sheet drifts with the page. Flat color, crisp
 * lines, no glow. Reduced motion renders a single still weave.
 */

const ROW_GAP = 18;
const X_STEP = 12;
const AMP = 24;
const SIGMA = 150; // cursor influence radius
const LIFT = 44; // max px the sheet lifts around the cursor
const PULSE_RATIO = 0.5; // fraction of wires carrying a signal
const PULSE_LEN = 150;

const WIRE = "oklch(0.93 0.006 82 / 0.075)";

/* deterministic per-wire hash */
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

    const wave = (x: number, j: number, t: number) =>
      Math.sin(x * 0.0026 + t * 0.8 + j * 0.35) * 0.55 +
      Math.sin(x * 0.0011 - t * 0.5 + j * 0.12) * 0.45;

    const draw = (t: number, scroll: number, energy: number) => {
      ctx.clearRect(0, 0, w, h);
      const amp = AMP * (1 + energy * 0.9);
      const sig2 = 2 * SIGMA * SIGMA;
      const slide = scroll * 0.06;
      const offY = slide % ROW_GAP;
      const rowBase = Math.floor(slide / ROW_GAP);
      const rows = Math.ceil(h / ROW_GAP) + 4;

      const yOf = (x: number, j: number, baseY: number) => {
        let y = baseY + wave(x, j, t) * amp;
        const dx = x - sx;
        const dy = baseY - sy;
        y -= grip * Math.exp(-(dx * dx + dy * dy) / sig2) * LIFT;
        return y;
      };

      for (let r = -2; r < rows; r++) {
        const j = r + rowBase; // world wire index — stable while sliding
        const baseY = r * ROW_GAP - offY;

        // the wire
        ctx.strokeStyle = WIRE;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= w + X_STEP; x += X_STEP) {
          const y = yOf(x, j, baseY);
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // its signal pulse
        if (hash(j) < PULSE_RATIO) {
          const speed = (120 + hash(j + 99) * 260) * (1 + energy * 1.6);
          const span = w + 500;
          const head = ((t * speed + hash(j + 7) * span) % span) - 250;
          for (
            let x = Math.max(0, head - PULSE_LEN);
            x <= Math.min(w, head);
            x += X_STEP
          ) {
            const k = 1 - (head - x) / PULSE_LEN; // 0 tail → 1 head
            const a = 0.55 * k * k;
            if (a < 0.02) continue;
            const x2 = Math.min(x + X_STEP, w);
            ctx.strokeStyle = `oklch(${0.72 + 0.1 * k} 0.155 50 / ${a})`;
            ctx.lineWidth = 1.3;
            ctx.beginPath();
            ctx.moveTo(x, yOf(x, j, baseY));
            ctx.lineTo(x2, yOf(x2, j, baseY));
            ctx.stroke();
          }
          // comet head
          if (head > 0 && head < w) {
            ctx.fillStyle = "oklch(0.85 0.13 55 / 0.8)";
            ctx.beginPath();
            ctx.arc(head, yOf(head, j, baseY), 1.7, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      draw(4.2, 0, 0);
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
      const energy = Math.min(Math.abs(vel) / 40, 1);

      t += 0.0075 + energy * 0.006;

      const present = tx >= 0;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      draw(t, sc, energy);
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
