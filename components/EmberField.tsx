"use client";

import { useEffect, useRef } from "react";

/*
 * The signature: a canvas of embers rising off the forge. Particles spawn low,
 * drift up with a slow horizontal sway, cool from white-hot to deep copper, and
 * fade out. Fixed behind all content, pointer-transparent, motion-safe.
 */

type Ember = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  life: number;
  maxLife: number;
  heat: number;
  sway: number;
  swaySpeed: number;
};

export default function EmberField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    const embers: Ember[] = [];
    let raf = 0;
    let last = performance.now();
    let spawnAcc = 0;

    // ember count scales with viewport width, capped for perf
    const density = () => Math.min(70, Math.round(w / 26));

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function makeEmber(seed = false): Ember {
      const maxLife = 4200 + Math.random() * 4200;
      return {
        x: Math.random() * w,
        y: seed ? Math.random() * h : h + Math.random() * 40,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -(0.18 + Math.random() * 0.42),
        r: 0.7 + Math.random() * 1.8,
        life: seed ? Math.random() * maxLife : 0,
        maxLife,
        heat: Math.random(),
        sway: Math.random() * Math.PI * 2,
        swaySpeed: 0.0006 + Math.random() * 0.0011,
      };
    }

    function color(heat: number, alpha: number) {
      // hot core -> copper -> deep ember as heat drops
      if (heat > 0.72) return `rgba(255, 226, 178, ${alpha})`;
      if (heat > 0.45) return `rgba(255, 165, 92, ${alpha})`;
      if (heat > 0.2) return `rgba(230, 118, 52, ${alpha})`;
      return `rgba(168, 62, 16, ${alpha})`;
    }

    function frame(now: number) {
      const dt = Math.min(now - last, 48);
      last = now;
      ctx!.clearRect(0, 0, w, h);
      ctx!.globalCompositeOperation = "lighter";

      // spawn from the bottom over time
      spawnAcc += dt;
      const target = density();
      const spawnEvery = 90;
      while (spawnAcc > spawnEvery && embers.length < target) {
        spawnAcc -= spawnEvery;
        embers.push(makeEmber(false));
      }

      for (let i = embers.length - 1; i >= 0; i--) {
        const e = embers[i];
        e.life += dt;
        e.sway += e.swaySpeed * dt;
        e.x += (e.vx + Math.sin(e.sway) * 0.22) * (dt / 16);
        e.y += e.vy * (dt / 16);
        e.heat -= 0.00006 * dt;

        const t = e.life / e.maxLife;
        if (t >= 1 || e.y < -20 || e.heat <= 0) {
          embers.splice(i, 1);
          continue;
        }

        // fade in quickly, ease out over the tail
        const fade = t < 0.12 ? t / 0.12 : 1 - (t - 0.12) / 0.88;
        const alpha = Math.max(0, Math.min(1, fade)) * 0.85;
        const r = e.r;

        const grad = ctx!.createRadialGradient(e.x, e.y, 0, e.x, e.y, r * 3.4);
        grad.addColorStop(0, color(Math.max(e.heat, 0.05), alpha));
        grad.addColorStop(1, color(Math.max(e.heat, 0.05), 0));
        ctx!.fillStyle = grad;
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, r * 3.4, 0, Math.PI * 2);
        ctx!.fill();

        // bright core
        ctx!.fillStyle = color(Math.min(e.heat + 0.25, 1), alpha * 0.9);
        ctx!.beginPath();
        ctx!.arc(e.x, e.y, r * 0.7, 0, Math.PI * 2);
        ctx!.fill();
      }

      ctx!.globalCompositeOperation = "source-over";
      raf = requestAnimationFrame(frame);
    }

    resize();
    // seed a field so it isn't empty on load
    for (let i = 0; i < density(); i++) embers.push(makeEmber(true));
    raf = requestAnimationFrame(frame);

    const onResize = () => resize();
    window.addEventListener("resize", onResize);

    // pause when tab is hidden to save cycles
    const onVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(raf);
      } else {
        last = performance.now();
        raf = requestAnimationFrame(frame);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      style={{
        position: "fixed",
        inset: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}
