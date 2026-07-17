/*
 * The anvil brand mark as inline SVG, shared by the generated image routes
 * (OG image, apple icon). Satori renders inline SVG, so the mark stays
 * vector-crisp at any output size.
 */

export function AnvilMark({ size, color }: { size: number; color: string }) {
  return (
    <svg
      width={size}
      height={size * (26.4 / 25)}
      viewBox="0 0 25 26.4"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M3.2 5.6h15.2c1.8 0 3.3 1 4.4 2.1.4.4.1 1.1-.5 1.1h-4.1v1.1c0 .7.4 1.3 1 1.6l.9.4c.5.2.5 1 0 1.2-2.3.9-4.8 1-7.1.3-1.6-.5-3.3-.5-4.9 0-1.1.3-2.3.5-3.4.5-.6 0-.9-.7-.5-1.1l1.5-1.4c.5-.5.8-1.1.8-1.8v-.8H3.2c-.6 0-1-.4-1-1V6.6c0-.6.4-1 1-1z"
        fill={color}
      />
      <path d="M9.4 14.9h5.2l1 2.3H8.4z" fill={color} />
      <path
        d="M6.5 18.2h11c.6 0 1 .4 1 1v.6c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1v-.6c0-.6.4-1 1-1z"
        fill={color}
      />
    </svg>
  );
}
