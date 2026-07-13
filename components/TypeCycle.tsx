"use client";

import { useEffect, useState } from "react";

/*
 * The hero's typed headline: cycles through DSA patterns, typing and deleting
 * each with a block caret. Reduced motion pins the first word.
 */

/* every term fits one hero line — longer ones make the layout jump */
const WORDS = [
  "two pointers",
  "binary search",
  "sliding window",
  "backtracking",
  "recursion",
  "graphs",
  "heaps",
];

const TYPE_MS = 65;
const DELETE_MS = 32;
const HOLD_MS = 1700;

export default function TypeCycle() {
  const [text, setText] = useState(WORDS[0]);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    setAnimate(true);
    let word = 0;
    let len = WORDS[0].length;
    let deleting = true;
    let timer: ReturnType<typeof setTimeout>;

    const step = () => {
      const target = WORDS[word];
      if (deleting) {
        len--;
        if (len === 0) {
          deleting = false;
          word = (word + 1) % WORDS.length;
        }
      } else {
        len++;
      }
      setText(WORDS[word].slice(0, len));
      let delay = deleting ? DELETE_MS : TYPE_MS;
      if (!deleting && len === target.length) {
        deleting = true;
        delay = HOLD_MS;
      }
      timer = setTimeout(step, delay);
    };
    timer = setTimeout(step, HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <span className="typed">
      {text}
      {animate && <span className="hero__caret" aria-hidden />}
    </span>
  );
}
