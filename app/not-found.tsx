import type { Metadata } from "next";
import Link from "next/link";
import { GITHUB_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Not found",
  robots: { index: false },
};

/*
 * On-brand 404: the BFS ran out of edges. A small traversal diagram walks
 * ember nodes across the dark iron and dead-ends at a hollow one.
 */
export default function NotFound() {
  return (
    <div className="nf">
      <main className="container nf__inner" id="main">
        <svg
          className="nf__graph"
          viewBox="0 0 340 120"
          width="340"
          height="120"
          aria-hidden
        >
          {/* visited path */}
          <line x1="24" y1="92" x2="92" y2="52" className="nf__edge" />
          <line x1="92" y1="52" x2="163" y2="78" className="nf__edge" />
          <line x1="163" y1="78" x2="232" y2="44" className="nf__edge" />
          {/* the edge that isn't there */}
          <line x1="232" y1="44" x2="304" y2="72" className="nf__edge nf__edge--broken" />
          <circle cx="24" cy="92" r="5" className="nf__node" />
          <circle cx="92" cy="52" r="5" className="nf__node" />
          <circle cx="163" cy="78" r="5" className="nf__node" />
          <circle cx="232" cy="44" r="6" className="nf__node nf__node--head" />
          {/* the page you asked for */}
          <circle cx="304" cy="72" r="7" className="nf__node nf__node--missing" />
        </svg>

        <p className="mono mono--ember">Err 404 · node unreachable</p>
        <h1 className="nf__title">Nothing forged here.</h1>
        <p className="lead nf__lead">
          The traversal ran out of edges — this address has no neighbors in the
          graph. Head back and take a marked path instead.
        </p>

        <div className="nf__actions">
          <Link className="btn btn-ember" href="/">
            Back to the forge
          </Link>
          <a
            className="btn btn-ghost"
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
          >
            Report a broken link
          </a>
        </div>
      </main>
    </div>
  );
}
