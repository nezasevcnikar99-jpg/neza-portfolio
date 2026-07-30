"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import type { Media } from "@/payload-types";

export type Slide = {
  image: Media | null;
  caption?: string | null;
};

export default function PhotoSlider({
  slides,
  initialIndex = 0,
  aspectRatio = "3/2",
  fallbackLabel = "fotografija",
  dark = false,
}: {
  slides: Slide[];
  initialIndex?: number;
  aspectRatio?: string;
  fallbackLabel?: string;
  dark?: boolean;
}) {
  const [index, setIndex] = useState(initialIndex);
  const total = slides.length;

  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

  useEffect(() => {
    if (total <= 1) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + total) % total);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % total);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [total]);

  if (total === 0) {
    return <ImageSlot label={fallbackLabel} aspectRatio={aspectRatio} className="block" fit="contain" />;
  }

  const current = slides[index];

  return (
    <div>
      <div style={{ position: "relative" }}>
        <ImageSlot
          label={current.caption ?? fallbackLabel}
          aspectRatio={aspectRatio}
          className="block"
          fit="contain"
          src={current.image?.url}
          alt={current.image?.alt ?? current.caption ?? undefined}
          mimeType={current.image?.mimeType}
          filename={current.image?.filename}
        />
        {total > 1 && (
          <>
            <button type="button" className="slider-arrow left" onClick={goPrev} aria-label="Prejšnja fotografija">
              ‹
            </button>
            <button type="button" className="slider-arrow right" onClick={goNext} aria-label="Naslednja fotografija">
              ›
            </button>
          </>
        )}
      </div>
      {(current.caption || total > 1) && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          {current.caption && (
            <div
              className="font-serif"
              style={{
                fontStyle: "italic",
                fontSize: 14,
                color: dark ? "oklch(100% 0 0 / 0.85)" : "oklch(20% 0.01 260 / 0.7)",
                marginBottom: 4,
              }}
            >
              {current.caption}
            </div>
          )}
          {total > 1 && (
            <div style={{ fontSize: 12, color: dark ? "oklch(100% 0 0 / 0.5)" : "oklch(20% 0.01 260 / 0.4)" }}>
              {index + 1} / {total}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
