"use client";

import { useEffect, useRef, useState } from "react";

/*
 * The product demoing itself: a faux Anvil window that materializes its
 * solution line by line, then runs the test suite to green, holds, and loops.
 * Reduced motion shows the finished state.
 */

const CODE: Array<Array<[string, string]>> = [
  [["tok-kw", "def "], ["tok-fn", "pair_sum"], ["tok", "(nums, target):"]],
  [["tok-cm", "    # two pointers over sorted input"]],
  [["tok", "    lo, hi = "], ["tok-num", "0"], ["tok", ", "], ["tok-kw", "len"], ["tok", "(nums) - "], ["tok-num", "1"]],
  [["tok-kw", "    while"], ["tok", " lo < hi:"]],
  [["tok", "        s = nums[lo] + nums[hi]"]],
  [["tok-kw", "        if"], ["tok", " s == target:"]],
  [["tok-kw", "            return"], ["tok", " [lo, hi]"]],
  [["tok-kw", "        if"], ["tok", " s < target: lo += "], ["tok-num", "1"]],
  [["tok-kw", "        else"], ["tok", ": hi -= "], ["tok-num", "1"]],
  [["tok-kw", "    return"], ["tok", " []"]],
];

const TESTS = [
  "basic_pair",
  "no_solution",
  "negatives",
  "duplicates",
  "two_elements",
  "large_input",
];

const LINE_MS = 170;
const TEST_MS = 260;
const HOLD_MS = 3200;

export default function AppFrame() {
  const [lines, setLines] = useState(0);
  const [passed, setPassed] = useState(0);
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      frame.classList.add("is-in");
      setLines(CODE.length);
      setPassed(TESTS.length);
      return;
    }

    let cancelled = false;
    const timers: ReturnType<typeof setTimeout>[] = [];
    const after = (ms: number, fn: () => void) => {
      if (!cancelled) timers.push(setTimeout(fn, ms));
    };

    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        frame.classList.add("is-in");
        const cycle = () => {
          setLines(0);
          setPassed(0);
          for (let i = 1; i <= CODE.length; i++) {
            after(300 + i * LINE_MS, () => setLines(i));
          }
          const testsAt = 600 + CODE.length * LINE_MS;
          for (let i = 1; i <= TESTS.length; i++) {
            after(testsAt + i * TEST_MS, () => setPassed(i));
          }
          after(testsAt + TESTS.length * TEST_MS + HOLD_MS, cycle);
        };
        cycle();
      },
      { threshold: 0.35 },
    );
    io.observe(frame);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      io.disconnect();
    };
  }, []);

  const done = passed === TESTS.length;

  return (
    <div className="frame-wrap">
      <div className="frame" ref={frameRef} role="img" aria-label="Anvil desktop app running a two-pointers problem against its test suite">
        <div className="frame__bar">
          <span className="frame__dots" aria-hidden>
            <span />
            <span />
            <span />
          </span>
          <span className="frame__title mono">anvil — arrays/pair-sum.py</span>
          <span className="frame__env mono">Sandbox · Offline</span>
        </div>

        <div className="frame__body">
          <div className="frame__code" aria-hidden>
            {CODE.map((line, i) => (
              <div key={i} className={`frame__line ${i < lines ? "is-on" : ""}`}>
                <span className="frame__ln">{i + 1}</span>
                <span>
                  {line.map(([cls, text], j) => (
                    <span key={j} className={cls}>
                      {text}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>

          <div className="frame__tests" aria-hidden>
            <span className="frame__tests-head mono">Test packs</span>
            {TESTS.map((t, i) => (
              <span key={t} className={`frame__test ${i < passed ? "is-pass" : ""}`}>
                {t}
                <span className="state">{i < passed ? "PASS" : "· · ·"}</span>
              </span>
            ))}
          </div>
        </div>

        <div className="frame__status" aria-hidden>
          <span className="mono">
            Judge · {passed}/{TESTS.length} pass
          </span>
          <span className={`mono ${done ? "mono--ember" : ""}`}>
            {done ? "Verified against oracle · 14 ms" : "Running…"}
          </span>
        </div>
      </div>
    </div>
  );
}
