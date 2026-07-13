import Reveal from "./Reveal";
import { ArrowIcon, GitHubIcon } from "./icons";
import { REPO_URL } from "@/lib/releases";

const LINKS = [
  { label: "Good first issues", href: `${REPO_URL}/issues` },
  { label: "Discussions", href: `${REPO_URL}/discussions` },
  { label: "Contributing guide", href: `${REPO_URL}/blob/main/CONTRIBUTING.md` },
];

export default function OpenSource() {
  return (
    <section className="section" id="open-source">
      <div className="container os">
        <Reveal>
          <p className="mono mono--ember">Built in the open</p>
          <h2 className="section-title">Open source. Come forge it.</h2>
          <p className="lead" style={{ marginTop: 22 }}>
            MIT-licensed, <code>main</code> protected, every change lands by pull
            request. Code, docs, design, or original problems — pick an issue and
            start.
          </p>
          <div className="os__cta">
            <a className="btn btn-ghost" href={REPO_URL} target="_blank" rel="noreferrer">
              <GitHubIcon width={16} height={16} />
              kudzaiprichard/anvil
            </a>
          </div>
        </Reveal>

        <Reveal className="os__links" delay={120}>
          {LINKS.map((l) => (
            <a key={l.label} className="os__link" href={l.href} target="_blank" rel="noreferrer">
              {l.label}
              <ArrowIcon width={16} height={16} />
            </a>
          ))}
        </Reveal>
      </div>
    </section>
  );
}
