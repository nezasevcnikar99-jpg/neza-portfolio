"use client";

/**
 * The frames a picture is cut to on the site, measured off the live page at a
 * desktop width, plus the 4:3 stack a phone shows.
 */
const FRAMES = [
  { label: "Širok okvir", ratio: 633 / 277, width: 228 },
  { label: "Kvadrat", ratio: 1, width: 100 },
  { label: "Telefon", ratio: 4 / 3, width: 133 },
];

type Props = {
  url: string;
  x: number;
  y: number;
  whole?: boolean;
  onPick: (x: number, y: number) => void;
};

/**
 * The whole picture to click on, and beneath it each frame exactly as the site
 * will cut it — drawn with the same object-fit the site uses, so what is shown
 * here is what a visitor gets rather than a guess at it.
 *
 * The picture is shown uncropped on purpose: a click can only mean a point on
 * the picture if the picture is all there to click on.
 */
export const CropPreview = ({ url, x, y, whole = false, onPick }: Props) => {
  const place = (event: React.MouseEvent<HTMLDivElement>) => {
    const box = event.currentTarget.getBoundingClientRect();
    const clamp = (n: number) => Math.min(100, Math.max(0, Math.round(n)));
    onPick(clamp(((event.clientX - box.left) / box.width) * 100), clamp(((event.clientY - box.top) / box.height) * 100));
  };

  return (
    <>
      <div
        onClick={whole ? undefined : place}
        style={{
          position: "relative",
          display: "inline-block",
          maxWidth: "100%",
          lineHeight: 0,
          cursor: whole ? "default" : "crosshair",
          border: "1px solid var(--theme-elevation-150, #ccc)",
          borderRadius: 3,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt=""
          draggable={false}
          style={{ display: "block", maxWidth: "100%", maxHeight: 360, userSelect: "none" }}
        />
        {!whole && (
          <span
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: 16,
              height: 16,
              marginLeft: -8,
              marginTop: -8,
              borderRadius: "50%",
              border: "2px solid #fff",
              boxShadow: "0 0 0 1px rgba(0,0,0,0.55)",
              pointerEvents: "none",
            }}
          />
        )}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "flex-end", flexWrap: "wrap", marginTop: 12 }}>
        {FRAMES.map((frame) => (
          <figure key={frame.label} style={{ margin: 0 }}>
            <div
              style={{
                width: frame.width,
                aspectRatio: String(frame.ratio),
                overflow: "hidden",
                background: "#f4f3f1",
                border: "1px solid var(--theme-elevation-150, #ccc)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                style={{
                  display: "block",
                  width: "100%",
                  height: "100%",
                  boxSizing: "border-box",
                  objectFit: whole ? "contain" : "cover",
                  objectPosition: whole ? "50% 50%" : `${x}% ${y}%`,
                  padding: whole ? "3%" : 0,
                }}
              />
            </div>
            <figcaption style={{ marginTop: 4, fontSize: 11, opacity: 0.7 }}>{frame.label}</figcaption>
          </figure>
        ))}
      </div>
    </>
  );
};
