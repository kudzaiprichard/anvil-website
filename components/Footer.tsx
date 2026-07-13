import { AnvilMark, GitHubIcon } from "./icons";
import { REPO_URL, RELEASES_URL, VERSION } from "@/lib/releases";

const COLS = [
  {
    heading: "Product",
    links: [
      { label: "Why Anvil", href: "#why" },
      { label: "Features", href: "#features" },
      { label: "Download", href: "#download" },
      { label: "Releases", href: RELEASES_URL },
    ],
  },
  {
    heading: "Open source",
    links: [
      { label: "GitHub repo", href: REPO_URL },
      { label: "Issues", href: `${REPO_URL}/issues` },
      { label: "Discussions", href: `${REPO_URL}/discussions` },
      { label: "Contributing", href: `${REPO_URL}/blob/main/CONTRIBUTING.md` },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "License (MIT)", href: `${REPO_URL}/blob/main/LICENSE` },
      { label: "Disclaimer", href: `${REPO_URL}/blob/main/DISCLAIMER.md` },
      { label: "Code of Conduct", href: `${REPO_URL}/blob/main/CODE_OF_CONDUCT.md` },
      { label: "Security", href: `${REPO_URL}/blob/main/SECURITY.md` },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div>
          <a href="#top" className="brand" aria-label="Anvil home">
            <AnvilMark className="brand__mark" />
            <span className="brand__word">Anvil</span>
          </a>
          <p className="footer__tag">
            The free, offline, honest way to master DSA. Built with Tauri,
            Next.js &amp; Rust.
          </p>
          <a
            className="btn btn-ghost btn-sm footer__gh"
            href={REPO_URL}
            target="_blank"
            rel="noreferrer"
          >
            <GitHubIcon width={15} height={15} />
            Star on GitHub
          </a>
        </div>

        <nav className="footer__cols" aria-label="Footer">
          {COLS.map((c) => (
            <div className="footer__col" key={c.heading}>
              <p className="mono">{c.heading}</p>
              <ul>
                {c.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      target={l.href.startsWith("#") ? undefined : "_blank"}
                      rel="noreferrer"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="container footer__base">
        <span className="mono">© {new Date().getFullYear()} Kudzai P Matizirofa · MIT</span>
        <span className="mono">Anvil v{VERSION}</span>
      </div>

      <span className="footer__mark" aria-hidden>
        ANVIL
      </span>
    </footer>
  );
}
