"use client";

import { useEffect, useRef } from "react";

/*
 * The living background: a flow-field of particle streaks drifting across the
 * iron plate. Particles follow a smooth sine/cosine vector field that slowly
 * evolves with time, shifts as you scroll, and bends away from the cursor.
 * Mostly faint bone with a few ember sparks — flat color, no glow. Reduced
 * motion renders nothing.
 */

const COUNT = 160;
const EMBER_RATIO = 0.16;
const TRAIL = 0.085; // per-frame fade; lower = longer trails

type P = { x: number; y: number; vx: number; vy: number; ember: boolean };

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
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

    const resize = () => {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
    };
    resize();
    window.addEventListener("resize", resize);

    const parts: P[] = Array.from({ length: COUNT }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: 0,
      vy: 0,
      ember: Math.random() < EMBER_RATIO,
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

    let raf = 0;
    let t = 0;

    const tick = () => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;
      t += 0.0035;
      const scroll = window.scrollY * 0.0006;

      // fade previous frame out instead of clearing — gives streak trails
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = `rgba(0, 0, 0, ${TRAIL})`;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = "source-over";

      for (const p of parts) {
        // smooth pseudo-noise vector field, phase-shifted by time and scroll
        const a =
          Math.sin(p.y * 0.0013 + t + scroll) +
          Math.cos(p.x * 0.0011 - t * 1.3) +
          Math.sin((p.x + p.y) * 0.0005 + t * 0.7);
        const angle = a * Math.PI;
        let ax = Math.cos(angle) * 0.06;
        let ay = Math.sin(angle) * 0.06;

        // gentle repulsion from the cursor
        const dx = p.x - mx;
        const dy = p.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < 32400) {
          const d = Math.sqrt(d2) || 1;
          const f = ((180 - d) / 180) * 0.6;
          ax += (dx / d) * f;
          ay += (dy / d) * f;
        }

        p.vx = (p.vx + ax) * 0.96;
        p.vy = (p.vy + ay) * 0.96;
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;

        ctx.strokeStyle = p.ember
          ? "oklch(0.72 0.155 50 / 0.5)"
          : "oklch(0.93 0.006 82 / 0.14)";
        ctx.lineWidth = p.ember ? 1.2 : 1;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.x = nx;
        p.y = ny;
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
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
