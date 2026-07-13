const PATTERNS = [
  "Two pointers",
  "Sliding window",
  "Binary search",
  "Hashing",
  "BFS",
  "DFS",
  "Heaps",
  "Intervals",
  "Backtracking",
  "Dynamic programming",
  "Prefix sums",
  "Monotonic stacks",
];

/*
 * Infinite pattern marquee — the course's vocabulary scrolling past. The
 * track holds two copies so the CSS loop is seamless; reduced motion stops it.
 */
export default function Marquee() {
  return (
    <div className="marquee" aria-hidden>
      <div className="marquee__track">
        {[0, 1].map((copy) => (
          <span className="marquee__group" key={copy}>
            {PATTERNS.map((p) => (
              <span className="marquee__item mono" key={p}>
                {p}
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
