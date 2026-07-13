"use client";

import { useEffect, useState } from "react";
import { AnvilMark, GitHubIcon } from "./icons";
import { REPO_URL } from "@/lib/releases";

export default function Nav() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`nav ${scrolled ? "nav--scrolled" : ""}`}>
      <div className="container nav__inner">
        <a href="#top" className="brand" aria-label="Anvil home">
          <span className="brand__tile">
            <AnvilMark className="brand__mark" />
          </span>
          <span className="brand__word">Anvil</span>
        </a>

        <nav className="nav__links" aria-label="Primary">
          <a href="#why">Why Anvil</a>
          <a href="#features">Features</a>
          <a href="#open-source">Open source</a>
          <a href="#download">Download</a>
        </nav>

        <div className="nav__actions">
          <a className="nav__gh" href={REPO_URL} target="_blank" rel="noreferrer" aria-label="Anvil on GitHub">
            <GitHubIcon width={18} height={18} />
            <span>Star</span>
          </a>
          <a className="btn btn-ember btn-sm" href="#download">
            Download
          </a>
        </div>
      </div>
    </header>
  );
}
