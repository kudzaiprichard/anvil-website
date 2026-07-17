import { AnvilMark, GitHubIcon } from "./icons";
import { REPO_URL } from "@/lib/releases";

/*
 * The nav lives at the top of the page and scrolls away with it — the
 * station rail and the download CTA take over once you're inside.
 */
export default function Nav({ version }: { version: string }) {
  return (
    <header className="nav">
      <div className="container nav__inner">
        <a href="#top" className="brand" aria-label="Anvil home">
          <AnvilMark className="brand__mark" />
          <span className="brand__word">Anvil</span>
          <span className="brand__ver mono">v{version}</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#why">Why</a>
          <a href="#inside">Inside</a>
          <a href="#open-source">Open source</a>
        </nav>

        <div className="nav__actions">
          <a
            className="nav__gh"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
            aria-label="Anvil on GitHub"
          >
            <GitHubIcon width={17} height={17} />
          </a>
          <a className="btn btn-ember btn-sm" href="#download">
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
