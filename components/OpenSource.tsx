import Reveal from "./Reveal";
import { ArrowIcon, GitHubIcon } from "./icons";
import { REPO_URL } from "@/lib/releases";

const LINKS = [
  {
    title: "Star the repo",
    body: "MIT-licensed, source-available on GitHub. A star helps other developers find Anvil.",
    href: REPO_URL,
    cta: "kudzaiprichard/anvil",
  },
  {
    title: "Good first issues",
    body: "Code, original problems, docs, design. Browse open issues and pick something to forge.",
    href: `${REPO_URL}/issues`,
    cta: "Browse issues",
  },
  {
    title: "Join the discussion",
    body: "Questions and ideas live in GitHub Discussions. Propose a feature or a new pattern.",
    href: `${REPO_URL}/discussions`,
    cta: "Open discussions",
  },
  {
    title: "Read the guide",
    body: "CONTRIBUTING.md covers dev setup, the PR flow, and the one rule: problem content must be 100% original.",
    href: `${REPO_URL}/blob/main/CONTRIBUTING.md`,
    cta: "Contributing guide",
  },
];

export default function OpenSource() {
  return (
    <section className="section" id="open-source">
      <div className="container">
        <div className="os">
          <Reveal className="os__intro">
            <p className="eyebrow microlabel microlabel--ember">Built in the open</p>
            <h2 className="section-title">Anvil is open source. Come forge it with us.</h2>
            <p className="lead">
              Every change lands via pull request, with passing CI and review — <code>main</code> is
              protected. Whether you write Rust, TypeScript, or original problems, there&apos;s a place
              for your contribution. The goal is a library of 100% original, MIT-licensed problems so no
              external content is ever needed.
            </p>
            <div className="os__cta">
              <a className="btn btn-ember" href={REPO_URL} target="_blank" rel="noreferrer">
                <GitHubIcon width={18} height={18} />
                Contribute on GitHub
                <ArrowIcon width={16} height={16} />
              </a>
            </div>
          </Reveal>

          <Reveal className="os__grid" delay={120}>
            {LINKS.map((l) => (
              <a
                key={l.title}
                className="card os__card"
                href={l.href}
                target="_blank"
                rel="noreferrer"
              >
                <h3 className="os__card-title">{l.title}</h3>
                <p className="os__card-body">{l.body}</p>
                <span className="os__card-cta microlabel microlabel--ember">
                  {l.cta}
                  <ArrowIcon width={14} height={14} />
                </span>
              </a>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
}
