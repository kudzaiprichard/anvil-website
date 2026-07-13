import AppFrame from "./AppFrame";
import CountUp from "./CountUp";
import TypeCycle from "./TypeCycle";
import { ArrowIcon, DownloadIcon, GitHubIcon } from "./icons";
import { REPO_URL } from "@/lib/releases";

const STATS = [
  { value: "62", label: "guided lessons" },
  { value: "2,900+", label: "test packs" },
  { value: "0", label: "accounts · telemetry · AI" },
];

export default function Hero({
  version,
  releaseUrl,
}: {
  version: string;
  releaseUrl: string;
}) {
  return (
    <section className="hero" id="top">
      <div className="container">
        <a
          className="hero__badge mono fade-in"
          href={releaseUrl}
          target="_blank"
          rel="noreferrer"
        >
          <span className="dot" aria-hidden />
          v{version} · free &amp; open source
        </a>

        <h1 className="hero__title">
          <span className="fade-in" style={{ "--rise-delay": "100ms" } as React.CSSProperties}>
            Master <TypeCycle />
          </span>
          <br />
          <span className="fade-in" style={{ "--rise-delay": "220ms" } as React.CSSProperties}>
            on your machine.
          </span>
        </h1>

        <p
          className="lead hero__lead fade-in"
          style={{ "--rise-delay": "380ms" } as React.CSSProperties}
        >
          Anvil is a desktop app that teaches you algorithm patterns, then judges
          your code against real test cases — fully offline. No account. No
          network. No AI crutch.
        </p>

        <div
          className="hero__cta fade-in"
          style={{ "--rise-delay": "500ms" } as React.CSSProperties}
        >
          <a className="btn btn-ember" href="#download">
            <DownloadIcon width={17} height={17} />
            Download Anvil
          </a>
          <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
            <GitHubIcon width={16} height={16} />
            Star on GitHub
            <ArrowIcon width={15} height={15} />
          </a>
        </div>

        <p
          className="hero__stats fade-in"
          style={{ "--rise-delay": "620ms" } as React.CSSProperties}
        >
          {STATS.map((s) => (
            <span className="hero__stat" key={s.label}>
              <b>
                <CountUp value={s.value} />
              </b>
              <span className="mono">{s.label}</span>
            </span>
          ))}
        </p>

        <AppFrame />
      </div>
    </section>
  );
}
