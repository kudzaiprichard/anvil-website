import { ImageResponse } from "next/og";
import { AnvilMark } from "@/lib/anvil-mark";
import { SITE_NAME } from "@/lib/site";

/*
 * The social share card: dark iron ground, ember glow rising from below,
 * the anvil mark on its ember tile, and the site's own headline. Rendered
 * at request time by satori — always crisp, no binary asset to go stale.
 */

export const alt =
  "Anvil — the free, offline, honest way to master DSA. Open-source desktop app for coding-interview practice.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "64px 72px",
          background: "linear-gradient(180deg, #16130f 0%, #1f1a14 100%)",
          position: "relative",
        }}
      >
        {/* ember heat rising from the forge floor */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: -320,
            height: 560,
            background:
              "radial-gradient(ellipse at 50% 100%, rgba(214,98,31,0.32) 0%, rgba(214,98,31,0) 65%)",
          }}
        />
        {/* faint contour hairlines, the site's cartography motif */}
        <div
          style={{
            position: "absolute",
            top: 90,
            right: -140,
            width: 520,
            height: 520,
            borderRadius: 9999,
            border: "1.5px solid rgba(241,234,222,0.07)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 160,
            right: -70,
            width: 380,
            height: 380,
            borderRadius: 9999,
            border: "1.5px solid rgba(241,234,222,0.09)",
          }}
        />
        <div
          style={{
            position: "absolute",
            top: 230,
            right: 0,
            width: 240,
            height: 240,
            borderRadius: 9999,
            border: "1.5px solid rgba(214,98,31,0.22)",
          }}
        />

        {/* brand row */}
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 84,
              height: 84,
              borderRadius: 20,
              background: "linear-gradient(180deg, #f4924b 0%, #d6621f 42%, #a83e10 100%)",
              boxShadow: "0 8px 24px rgba(0,0,0,0.45)",
            }}
          >
            <AnvilMark size={52} color="#fdf9f1" />
          </div>
          <div
            style={{
              fontSize: 44,
              fontWeight: 700,
              color: "#f1eade",
              letterSpacing: -1,
            }}
          >
            {SITE_NAME}
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              padding: "6px 16px",
              borderRadius: 9999,
              border: "1px solid rgba(241,234,222,0.22)",
              color: "#b3a996",
              fontSize: 22,
              letterSpacing: 2,
            }}
          >
            FREE &amp; OPEN SOURCE
          </div>
        </div>

        {/* headline */}
        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 96,
              fontWeight: 800,
              lineHeight: 1.02,
              letterSpacing: -3,
              color: "#f1eade",
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>
              Master <span style={{ color: "#e07030", marginLeft: 20 }}>DSA</span>
            </span>
            <span>on your machine.</span>
          </div>
        </div>

        {/* footer strip, in the ticker's voice */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            color: "#b3a996",
            fontSize: 25,
            letterSpacing: 3,
          }}
        >
          <span>OFFLINE</span>
          <div style={{ width: 9, height: 9, background: "#d6621f", transform: "rotate(45deg)" }} />
          <span>NO ACCOUNT</span>
          <div style={{ width: 9, height: 9, background: "#d6621f", transform: "rotate(45deg)" }} />
          <span>NO AI CRUTCH</span>
          <div style={{ width: 9, height: 9, background: "#d6621f", transform: "rotate(45deg)" }} />
          <span>MIT</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
