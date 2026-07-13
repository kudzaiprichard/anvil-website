import Reveal from "./Reveal";
import { CheckIcon } from "./icons";

const POINTS = [
  "Taught, not just tested — a lesson, an animated diagram, and a quiz before every practice set.",
  "A real path — concepts stack in a mastery ladder; nothing unlocks until you've earned it.",
  "Trustworthy judging — reference solutions checked against an independent brute-force oracle.",
  "Yours to own — MIT-licensed, 100% original content, no accounts, no tracking.",
];

const STACK = ["Tauri 2", "Rust", "Next.js 16", "React 19", "TypeScript", "CodeMirror 6"];

export default function Thesis() {
  return (
    <section className="section section--tight" id="why">
      <div className="container thesis">
        <Reveal className="thesis__lead-col">
          <p className="eyebrow microlabel microlabel--ember">Why Anvil</p>
          <h2 className="section-title thesis__title">
            Interview prep forces a trade-off. Anvil refuses it.
          </h2>
          <p className="lead">
            Online judges are convenient but need an account, a network, and increasingly assume you&apos;ll
            have an AI copilot. Offline tools fix the privacy problem but hand you a bare judge and a flat
            list of problems — no teaching, no path. Anvil is the best of both: a real course you own.
          </p>
          <div className="stack">
            {STACK.map((s) => (
              <span className="chip stack__chip" key={s}>
                {s}
              </span>
            ))}
          </div>
        </Reveal>

        <Reveal className="thesis__points" delay={120}>
          <ul className="points">
            {POINTS.map((p) => (
              <li className="points__item" key={p}>
                <span className="points__check">
                  <CheckIcon width={13} height={13} />
                </span>
                <span>{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
