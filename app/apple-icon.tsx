import { ImageResponse } from "next/og";
import { AnvilMark } from "@/lib/anvil-mark";

/*
 * Apple touch icon, generated from the same vector mark as the SVG favicon.
 * Full-bleed ember tile — iOS applies its own corner mask.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #f4924b 0%, #d6621f 42%, #a83e10 100%)",
        }}
      >
        <AnvilMark size={116} color="#fdf9f1" />
      </div>
    ),
    { ...size },
  );
}
