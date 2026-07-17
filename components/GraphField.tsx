"use client";

import { useEffect, useRef } from "react";

/*
 * The living background, DSA edition: a drifting graph of nodes and hairline
 * edges. Every few seconds a breadth-first search launches from a random
 * node and its ember wave sweeps the graph hop by hop — you're watching the
 * algorithm run. Nodes parallax gently with scroll and edges reach for the
 * cursor. Flat color only, no glow. Reduced motion renders a single static
 * frame.
 */

const COUNT = 84;
const LINK_D = 150; // max edge length in px
const HOP_MS = 150; // wave delay per BFS hop
const HEAT_MS = 750; // how long a visited node stays hot
const PULSE_GAP_MS = 2600; // rest between traversals
const CURSOR_D = 170;

const EMBER = { l: 0.72, c: 0.155, h: 50 };
const BONE = { l: 0.93, c: 0.006, h: 82 };

type Node = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  depth: number; // scroll-parallax factor
  visitAt: number; // timestamp the BFS wave reaches this node (or Infinity)
};

const col = (c: typeof BONE, a: number) => `oklch(${c.l} ${c.c} ${c.h} / ${a})`;

export default function GraphField() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
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
    };
    resize();
    window.addEventListener("resize", resize);

    // phone-sized viewports get a proportionally smaller graph
    const density = Math.min(
      1,
      Math.max(0.45, (window.innerWidth * window.innerHeight) / (1440 * 900)),
    );
    const count = Math.round(COUNT * density);

    const nodes: Node[] = Array.from({ length: count }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.24,
      vy: (Math.random() - 0.5) * 0.24,
      depth: 0.02 + Math.random() * 0.08,
      visitAt: Infinity,
    }));

    // screen-space position after scroll parallax (wrapped)
    const margin = 30;
    const spanY = () => h + margin * 2;
    const posY = (n: Node, scroll: number) => {
      const y = (n.y - scroll * n.depth) % spanY();
      return (y < 0 ? y + spanY() : y) - margin;
    };

    // smoothed cursor: edges glide toward the pointer and ease back
    let tx = -9999;
    let ty = -9999;
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
      tx = -9999;
      ty = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onLeave);

    /* Launch a BFS from a random node over the graph's current edges,
       stamping each node with the moment the wave will reach it. */
    let nextPulseAt = performance.now() + 1200;
    const launchPulse = (now: number, scroll: number) => {
      const ys = nodes.map((n) => posY(n, scroll));
      const hops = new Array<number>(count).fill(-1);
      const start = Math.floor(Math.random() * count);
      hops[start] = 0;
      const queue = [start];
      let maxHop = 0;
      while (queue.length) {
        const i = queue.shift()!;
        for (let j = 0; j < count; j++) {
          if (hops[j] !== -1) continue;
          const dx = nodes[i].x - nodes[j].x;
          const dy = ys[i] - ys[j];
          if (dx * dx + dy * dy < LINK_D * LINK_D) {
            hops[j] = hops[i] + 1;
            maxHop = Math.max(maxHop, hops[j]);
            queue.push(j);
          }
        }
      }
      nodes.forEach((n, i) => {
        n.visitAt = hops[i] === -1 ? Infinity : now + hops[i] * HOP_MS;
      });
      nextPulseAt = now + maxHop * HOP_MS + HEAT_MS + PULSE_GAP_MS;
    };

    // 0 → not reached yet or cooled off, 1 → wave is here right now
    const heat = (n: Node, now: number) => {
      const dt = now - n.visitAt;
      if (dt < 0 || dt > HEAT_MS) return 0;
      return 1 - dt / HEAT_MS;
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

    const draw = (now: number) => {
      const scroll = window.scrollY;
      ctx.clearRect(0, 0, w, h);

      // edges
      for (let i = 0; i < count; i++) {
        const yi = posY(nodes[i], scroll);
        for (let j = i + 1; j < count; j++) {
          const yj = posY(nodes[j], scroll);
          const dx = nodes[i].x - nodes[j].x;
          const dy = yi - yj;
          const d2 = dx * dx + dy * dy;
          if (d2 > LINK_D * LINK_D) continue;
          const near = 1 - Math.sqrt(d2) / LINK_D;
          const hot = Math.min(heat(nodes[i], now), heat(nodes[j], now));
          ctx.strokeStyle =
            hot > 0
              ? col(EMBER, 0.08 + hot * 0.6)
              : col(BONE, 0.04 + near * 0.09);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(nodes[i].x, yi);
          ctx.lineTo(nodes[j].x, yj);
          ctx.stroke();
        }
      }

      // cursor reaches into the graph
      if (grip > 0.01) {
        for (const n of nodes) {
          const y = posY(n, scroll);
          const dx = n.x - sx;
          const dy = y - sy;
          const d2 = dx * dx + dy * dy;
          if (d2 > CURSOR_D * CURSOR_D) continue;
          const near = 1 - Math.sqrt(d2) / CURSOR_D;
          ctx.strokeStyle = col(EMBER, near * 0.3 * grip);
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(n.x, y);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }
      }

      // nodes
      for (const n of nodes) {
        const y = posY(n, scroll);
        const hot = heat(n, now);
        const r = 1.6 + hot * 2.2;
        ctx.fillStyle = hot > 0 ? col(EMBER, 0.4 + hot * 0.6) : col(BONE, 0.45);
        ctx.beginPath();
        ctx.arc(n.x, y, r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    if (reduced.matches) {
      draw(0);
      return () => {
        window.removeEventListener("resize", resize);
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerout", onLeave);
      };
    }

    let raf = 0;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (document.hidden) return;

      // drift: slow random walk, wrapped at the viewport edges
      for (const n of nodes) {
        n.vx = Math.max(-0.35, Math.min(0.35, n.vx + (Math.random() - 0.5) * 0.012));
        n.vy = Math.max(-0.35, Math.min(0.35, n.vy + (Math.random() - 0.5) * 0.012));
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < -margin) n.x = w + margin;
        if (n.x > w + margin) n.x = -margin;
      }

      const present = tx > -9999;
      grip += ((present ? 1 : 0) - grip) * 0.08;
      if (present) {
        sx += (tx - sx) * 0.1;
        sy += (ty - sy) * 0.1;
      }

      if (now >= nextPulseAt) launchPulse(now, window.scrollY);
      draw(now);
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
