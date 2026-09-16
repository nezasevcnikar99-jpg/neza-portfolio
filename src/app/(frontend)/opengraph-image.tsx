import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/settings";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Neža Sevčnikar — Portfolio";

/** The card people see when the site is shared. Set like the landing screen. */
export default async function OpengraphImage() {
  const settings = await getSettings();

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#111111",
          color: "#ffffff",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: 84,
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div style={{ fontSize: 76, letterSpacing: -2, lineHeight: 1.05 }}>{settings.name}</div>
        <div style={{ marginTop: 20, fontSize: 30, opacity: 0.7 }}>
          Portfolio
        </div>
      </div>
    ),
    size
  );
}
