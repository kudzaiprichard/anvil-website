import CountUp from "./CountUp";
import Reveal from "./Reveal";

/*
 * Sticky split: the section header and the numbers hold the left column
 * while the capability cards scroll past on the right in a staggered
 * two-column rhythm. Each card keeps its small, honest visual.
 */

const STATS = [
  { value: "8", label: "stages" },
  { value: "62", label: "lessons" },
  { value: "2,900+", label: "verified test packs" },
  { value: "2", label: "languages — Python & JS" },
];

export default function Features() {
  return (
    <section className="section" id="inside">
      <div className="container container--wide inside">
        <div className="inside__head">
          <Reveal>
            <p className="mono mono--ember">What&apos;s inside</p>
            <h2 className="section-title">
              Everything you need.
              <br />
              Nothing that trains you to cheat.
            </h2>
          </Reveal>
          <Reveal className="inside__stats" delay={100}>
            {STATS.map((s) => (
              <span className="inside__stat" key={s.label}>
                <span className="inside__stat-value">
                  <CountUp value={s.value} />
                </span>
                <span className="mono">{s.label}</span>
              </span>
            ))}
          </Reveal>
        </div>

        <div className="bento bento--split">
          <Reveal className="bento__card bento__card--wide">
            <span className="mono">Course</span>
            <h3 className="bento__title">A mastery-gated climb, not a problem dump</h3>
            <p className="bento__body">
              8 stages, 19 units, 62 lessons — each teaches one sub-pattern with an
              explainer, an animated diagram, and faded practice. Nothing unlocks
              until you&apos;ve earned it.
            </p>
            <div className="viz viz-ladder" aria-hidden>
              {[0.1, 0.22, 0.34, 0.46, 0.58, 0.7, 0.84, 1].map((h, i) => (
                <span
                  key={i}
                  className={i < 5 ? "on" : ""}
                  style={{ "--h": h } as React.CSSProperties}
                />
              ))}
            </div>
          </Reveal>

          <Reveal className="bento__card" delay={80}>
            <span className="mono">Judge</span>
            <h3 className="bento__title">Oracle-verified judging</h3>
            <p className="bento__body">
              Every question ships with a test pack we forged — reference
              solutions cross-checked against an independent brute-force oracle.
            </p>
            <div className="viz viz-checks" aria-hidden>
              <span><i>✓</i>python reference</span>
              <span><i>✓</i>javascript reference</span>
              <span><i>✓</i>brute-force oracle</span>
            </div>
          </Reveal>

          <Reveal className="bento__card">
            <span className="mono">Sandbox</span>
            <h3 className="bento__title">Isolated local runner</h3>
            <p className="bento__body">
              Your code runs in a subprocess with timeouts, memory caps, and
              temp-dir isolation — never in the WebView.
            </p>
            <div className="viz" aria-hidden>
              <div className="viz-term">
                <i>$</i> run --timeout 2s --mem 256mb
                <span className="hero__caret" />
              </div>
            </div>
          </Reveal>

          <Reveal className="bento__card" delay={80}>
            <span className="mono">Trainer</span>
            <h3 className="bento__title">Pattern-recognition drills</h3>
            <p className="bento__body">
              Unlabeled prompts train which technique an unseen problem needs —
              the skill that survives a whiteboard.
            </p>
            <div className="viz viz-chips" aria-hidden>
              <span>sliding window?</span>
              <span className="on">two pointers?</span>
              <span>BFS?</span>
            </div>
          </Reveal>

          <Reveal className="bento__card" delay={160}>
            <span className="mono">Review</span>
            <h3 className="bento__title">FSRS spaced review</h3>
            <p className="bento__body">
              Solved problems return on an on-device spaced, interleaved schedule
              and get re-solved cold. Streaks come with freezes — no guilt.
            </p>
            <div className="viz viz-dots" aria-hidden>
              {["on", "on", "half", "on", "", "on", "half", "", "on", ""].map((c, i) => (
                <span key={i} className={c} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
