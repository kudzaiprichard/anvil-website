"use client";

import { useEffect, useRef } from "react";

/*
 * Scroll-fill manifesto: the argument for Anvil, one big paragraph whose words
 * light up from faint to bone as it crosses the viewport. Words wrapped in
 * *asterisks* light up ember instead. Reduced motion shows it fully lit.
 */

const TEXT =
  "Online judges want an account, a network, and an AI copilot doing the thinking. " +
  "Offline tools hand you a bare judge and a flat list of problems. " +
  "Anvil refuses both: *a guided course* of 100% original problems, " +
  "judged by *an independent oracle,* entirely *on your machine.*";

// pre-split words, tracking which fall inside *ember phrases*
const WORDS = (() => {
  let inPhrase = false;
  return TEXT.split(" ").map((raw) => {
    if (raw.startsWith("*")) inPhrase = true;
    const ember = inPhrase;
    if (raw.length > 1 && raw.indexOf("*", 1) !== -1) inPhrase = false;
    return { word: raw.replace(/\*/g, ""), ember };
  });
})();

export default function Manifesto() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const words = Array.from(el.querySelectorAll<HTMLElement>(".w"));

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      words.forEach((w) => w.classList.add("is-lit"));
      return;
    }

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = el.getBoundingClientRect();
      const start = window.innerHeight * 0.85;
      const end = window.innerHeight * 0.35;
      const progress = Math.min(
        Math.max((start - rect.top) / (rect.height + start - end), 0),
        1,
      );
      const lit = Math.round(progress * words.length);
      words.forEach((w, i) => w.classList.toggle("is-lit", i < lit));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <section className="section" id="why">
      <div className="container manifesto">
        <p className="mono mono--ember">Why Anvil</p>
        <p className="manifesto__text" ref={ref}>
          {WORDS.map(({ word, ember }, i) => (
            <span key={i} className={`w ${ember ? "w--ember" : ""}`}>
              {word}{" "}
            </span>
          ))}
        </p>
      </div>
    </section>
  );
}
