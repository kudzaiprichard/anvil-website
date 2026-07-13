"use client";

import { useEffect, useRef } from "react";

/*
 * Counts a stat up from zero when it scrolls into view. Accepts display
 * strings like "2,900+" or "62" — digits animate, prefix/suffix stay put.
 * Reduced motion (or no number) renders the final value immediately.
 */
export default function CountUp({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const match = value.match(/[\d,]+/);
    const target = match ? parseInt(match[0].replace(/,/g, ""), 10) : NaN;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (Number.isNaN(target) || target === 0 || reduced || !("IntersectionObserver" in window)) {
      return;
    }

    const format = (n: number) => value.replace(match![0], n.toLocaleString("en-US"));
    el.textContent = format(0);

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const duration = 1200;
        const step = (now: number) => {
          const t = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - t, 3);
          el.textContent = format(Math.round(target * eased));
          if (t < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
      },
      { threshold: 0.6 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return <span ref={ref}>{value}</span>;
}
