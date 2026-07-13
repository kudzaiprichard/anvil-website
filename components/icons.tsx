import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

/* The Anvil mark — the bone anvil glyph from the app icon, drawn in
   currentColor so it can be tinted (bone on the tile, ember on hover). */
export function AnvilMark({ title, ...props }: IconProps & { title?: string }) {
  return (
    <svg viewBox="0 0 25 26" fill="currentColor" aria-hidden={title ? undefined : true} {...props}>
      {title ? <title>{title}</title> : null}
      <path d="M3.2 5.6h15.2c1.8 0 3.3 1 4.4 2.1.4.4.1 1.1-.5 1.1h-4.1v1.1c0 .7.4 1.3 1 1.6l.9.4c.5.2.5 1 0 1.2-2.3.9-4.8 1-7.1.3-1.6-.5-3.3-.5-4.9 0-1.1.3-2.3.5-3.4.5-.6 0-.9-.7-.5-1.1l1.5-1.4c.5-.5.8-1.1.8-1.8v-.8H3.2c-.6 0-1-.4-1-1V6.6c0-.6.4-1 1-1z" />
      <path d="M9.4 14.9h5.2l1 2.3H8.4z" />
      <path d="M6.5 18.2h11c.6 0 1 .4 1 1v.6c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1v-.6c0-.6.4-1 1-1z" />
    </svg>
  );
}

/* The full app icon tile — ember gradient with the bone anvil, for the hero. */
export function AnvilTile(props: IconProps) {
  return (
    <svg viewBox="0 0 1024 1024" {...props}>
      <defs>
        <linearGradient id="tile" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#F4924B" />
          <stop offset="0.42" stopColor="#D6621F" />
          <stop offset="1" stopColor="#A83E10" />
        </linearGradient>
        <radialGradient id="glow" cx="0.5" cy="0.42" r="0.62">
          <stop offset="0" stopColor="#FFB871" stopOpacity="0.85" />
          <stop offset="0.55" stopColor="#FFB871" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sheen" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.30" />
          <stop offset="0.14" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="bone" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" />
          <stop offset="1" stopColor="#F1EADE" />
        </linearGradient>
        <clipPath id="tileClip">
          <rect x="100" y="100" width="824" height="824" rx="184.988" ry="184.988" />
        </clipPath>
      </defs>
      <g clipPath="url(#tileClip)">
        <rect x="100" y="100" width="824" height="824" fill="url(#tile)" />
        <rect x="100" y="100" width="824" height="824" fill="url(#glow)" />
        <rect x="100" y="100" width="824" height="824" fill="url(#sheen)" />
        <g transform="translate(512 522) scale(24) translate(-12.5 -13.2)">
          <path
            d="M3.2 5.6h15.2c1.8 0 3.3 1 4.4 2.1.4.4.1 1.1-.5 1.1h-4.1v1.1c0 .7.4 1.3 1 1.6l.9.4c.5.2.5 1 0 1.2-2.3.9-4.8 1-7.1.3-1.6-.5-3.3-.5-4.9 0-1.1.3-2.3.5-3.4.5-.6 0-.9-.7-.5-1.1l1.5-1.4c.5-.5.8-1.1.8-1.8v-.8H3.2c-.6 0-1-.4-1-1V6.6c0-.6.4-1 1-1z"
            fill="url(#bone)"
          />
          <path d="M9.4 14.9h5.2l1 2.3H8.4z" fill="url(#bone)" />
          <path
            d="M6.5 18.2h11c.6 0 1 .4 1 1v.6c0 .6-.4 1-1 1h-11c-.6 0-1-.4-1-1v-.6c0-.6.4-1 1-1z"
            fill="url(#bone)"
          />
        </g>
      </g>
      <rect
        x="100.75"
        y="100.75"
        width="822.5"
        height="822.5"
        rx="184.988"
        ry="184.988"
        fill="none"
        stroke="#ffffff"
        strokeOpacity="0.16"
        strokeWidth="1.5"
      />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58v-2.03c-3.34.73-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.5.99.11-.78.42-1.31.76-1.61-2.67-.3-5.47-1.34-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02 0 2.05.14 3 .4 2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.6-2.81 5.62-5.49 5.92.43.37.82 1.1.82 2.22v3.29c0 .32.22.7.83.58C20.56 22.3 24 17.8 24 12.5 24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M17.05 12.54c-.03-2.6 2.12-3.85 2.22-3.91-1.21-1.77-3.09-2.01-3.76-2.04-1.6-.16-3.12.94-3.93.94-.81 0-2.06-.92-3.39-.9-1.74.03-3.35 1.01-4.25 2.57-1.81 3.14-.46 7.79 1.3 10.34.86 1.25 1.89 2.65 3.24 2.6 1.3-.05 1.79-.84 3.36-.84 1.57 0 2.01.84 3.39.81 1.4-.02 2.28-1.27 3.14-2.53.99-1.45 1.4-2.85 1.42-2.93-.03-.01-2.72-1.04-2.75-4.13zM14.6 4.86c.72-.87 1.2-2.08 1.07-3.29-1.03.04-2.28.69-3.02 1.56-.66.77-1.24 2-1.09 3.18 1.15.09 2.32-.58 3.04-1.45z" />
    </svg>
  );
}

export function WindowsIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M3 5.6 10.4 4.6v7.1H3V5.6zM10.4 12.7v7.1L3 18.8v-6.1h7.4zM11.4 4.4 21 3v8.7h-9.6V4.4zM21 12.7V21l-9.6-1.3v-7h9.6z" />
    </svg>
  );
}

export function LinuxIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 2c-2.2 0-3.6 1.9-3.6 4.2 0 1.3.3 2.1.3 3.2 0 1.2-1 2.2-1.9 3.7-.9 1.5-1.9 3.1-2.6 4.4-.4.7-.2 1.3.3 1.6.4.2.9.1 1.3-.2.2.6.6 1.1 1.3 1.3.9.3 2.1.2 3.1-.4.5.2 1.1.3 1.5.3s1-.1 1.5-.3c1 .6 2.2.7 3.1.4.7-.2 1.1-.7 1.3-1.3.4.3.9.4 1.3.2.5-.3.7-.9.3-1.6-.7-1.3-1.7-2.9-2.6-4.4-.9-1.5-1.9-2.5-1.9-3.7 0-1.1.3-1.9.3-3.2C15.6 3.9 14.2 2 12 2zm-1.5 4.1c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9zm3 0c.4 0 .7.4.7.9s-.3.9-.7.9-.7-.4-.7-.9.3-.9.7-.9zM12 8.8c.8 0 1.9.5 1.9.9 0 .3-.5.5-1 .8-.3.2-.6.5-.9.5s-.6-.3-.9-.5c-.5-.3-1-.5-1-.8 0-.4 1.1-.9 1.9-.9z" />
    </svg>
  );
}

export function DownloadIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M12 3v12M7 11l5 5 5-5M4 20h16" />
    </svg>
  );
}

export function ArrowIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
