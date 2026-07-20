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

/*
 * The hero is a split stage: the argument anchored left, the machine itself
 * on the right — the live editor frame angled in perspective, bleeding past
 * the grid like a monitor on the bench. Stats sit in a bordered spec strip,
 * read like a plate riveted to the workbench.
 */
export default function Hero({
  version,
  releaseUrl,
}: {
  version: string;
  releaseUrl: string;
}) {
  return (
    <section className="hero" id="top">
      <div className="container container--wide hero__grid">
        <div className="hero__copy">
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
              Master
            </span>
            <span className="fade-in" style={{ "--rise-delay": "220ms" } as React.CSSProperties}>
              <TypeCycle />
            </span>
            <span className="fade-in" style={{ "--rise-delay": "340ms" } as React.CSSProperties}>
              on your machine.
            </span>
          </h1>

          <p
            className="lead hero__lead fade-in"
            style={{ "--rise-delay": "460ms" } as React.CSSProperties}
          >
            Anvil is a desktop app that teaches you algorithm patterns, then
            judges your code on the classic LeetCode &amp; NeetCode questions
            — oracle-verified test packs, fully offline. No account. No
            network. No AI crutch.
          </p>

          <div
            className="hero__cta fade-in"
            style={{ "--rise-delay": "560ms" } as React.CSSProperties}
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

          <div
            className="hero__specs fade-in"
            style={{ "--rise-delay": "680ms" } as React.CSSProperties}
          >
            {STATS.map((s) => (
              <span className="hero__spec" key={s.label}>
                <b>
                  <CountUp value={s.value} />
                </b>
                <span className="mono">{s.label}</span>
              </span>
            ))}
          </div>
        </div>

        <div
          className="hero__stage fade-in"
          style={{ "--rise-delay": "420ms" } as React.CSSProperties}
        >
          <AppFrame />
        </div>
      </div>
    </section>
  );
}
