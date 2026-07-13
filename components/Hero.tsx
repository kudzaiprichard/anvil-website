import { AnvilTile, ArrowIcon, DownloadIcon, GitHubIcon } from "./icons";
import { REPO_URL, VERSION } from "@/lib/releases";

const STATS = [
  { value: "2,900+", label: "Verified test packs" },
  { value: "62", label: "Guided lessons" },
  { value: "0", label: "Accounts · network · AI" },
];

export default function Hero() {
  return (
    <section className="hero" id="top">
      {/* The forge: a breathing heat-glow behind the app tile */}
      <div className="forge" aria-hidden>
        <div className="forge__glow" data-forge-glow />
        <div className="forge__tile">
          <AnvilTile className="forge__icon" />
        </div>
      </div>

      <div className="container hero__inner">
        <p className="eyebrow microlabel microlabel--ember hero__eyebrow">
          Open source · Offline-first · MIT
        </p>

        <h1 className="hero__title">
          Forge the pattern recognition
          <br className="hero__br" /> that{" "}
          <span className="ember-text">survives the interview.</span>
        </h1>

        <p className="lead hero__lead">
          Anvil is a free, open-source desktop app for DSA practice — a guided course of{" "}
          <strong>original</strong> problems you learn with animated diagrams, then solve against real
          test cases in a sandbox on your own machine. Fully offline. No account. No AI crutch.
        </p>

        <div className="hero__cta">
          <a className="btn btn-ember" href="#download">
            <DownloadIcon width={18} height={18} />
            Download Anvil
            <span className="hero__ver">v{VERSION}</span>
          </a>
          <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
            <GitHubIcon width={17} height={17} />
            View source
            <ArrowIcon width={16} height={16} />
          </a>
        </div>

        <dl className="hero__stats">
          {STATS.map((s) => (
            <div className="hero__stat" key={s.label}>
              <dt className="hero__stat-value ember-text">{s.value}</dt>
              <dd className="hero__stat-label microlabel">{s.label}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
