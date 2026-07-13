import Reveal from "./Reveal";

type Feature = {
  k: string;
  title: string;
  body: string;
};

const FEATURES: Feature[] = [
  {
    k: "Course",
    title: "A guided course, not a problem dump",
    body: "One mastery-gated climb — 8 stages, 19 units, 62 lessons. Each teaches one sub-pattern with an explainer, trigger signals, an interactive prediction diagram, and faded → independent practice.",
  },
  {
    k: "Trainer",
    title: "Pattern-recognition trainer",
    body: "Prompt-only, unlabeled pattern-picker drills train which technique an unfamiliar problem needs — the skill that actually survives a whiteboard or AI-restricted interview.",
  },
  {
    k: "Judge",
    title: "Oracle-verified judging",
    body: "2,900+ test packs with no hand-typed answer keys. Expected outputs are computed by executing reference solutions and cross-checking Python vs JavaScript vs a brute-force oracle.",
  },
  {
    k: "Sandbox",
    title: "Sandboxed local runner",
    body: "Runs Python & JavaScript in an isolated subprocess with a per-run timeout, memory cap, and temp-dir isolation. Your code never executes in the WebView.",
  },
  {
    k: "Offline",
    title: "Honest by design",
    body: "Fully offline — no account, no telemetry, no AI assistant to lean on. Take it on a plane; it just works. Everything lives on your own machine.",
  },
  {
    k: "Review",
    title: "FSRS spaced review",
    body: "Solved problems return on an on-device spaced, interleaved schedule and are re-solved cold. Streaks with freezes — no XP, no leaderboards, no dark patterns.",
  },
];

export default function Features() {
  return (
    <section className="section" id="features">
      <div className="container">
        <Reveal className="section-head">
          <p className="eyebrow microlabel microlabel--ember">What&apos;s inside</p>
          <h2 className="section-title">
            Everything you need to master DSA — and nothing that trains you to cheat.
          </h2>
        </Reveal>

        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <Reveal key={f.k} className="card feature" delay={(i % 3) * 80}>
              <span className="feature__k microlabel">{f.k}</span>
              <h3 className="feature__title">{f.title}</h3>
              <p className="feature__body">{f.body}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
