"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import type { Media } from "@/payload-types";

export type Slide = {
  image: Media | null;
  caption?: string | null;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  const points = direction === "left" ? "18,4 8,16 18,28" : "10,4 20,16 10,28";
  return (
    <svg width="20" height="28" viewBox="0 0 28 32" fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function PhotoSlider({
  slides,
  initialIndex = 0,
  aspectRatio = "3/2",
  fallbackLabel = "fotografija",
  showCaption = true,
  onIndexChange,
}: {
  slides: Slide[];
  initialIndex?: number;
  aspectRatio?: string;
  fallbackLabel?: string;
  showCaption?: boolean;
  onIndexChange?: (index: number) => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const total = slides.length;

  useEffect(() => {
    onIndexChange?.(index);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

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
  const goPrev = () => setIndex((i) => (i - 1 + total) % total);
  const goNext = () => setIndex((i) => (i + 1) % total);

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
              <ArrowIcon direction="left" />
            </button>
            <button type="button" className="slider-arrow right" onClick={goNext} aria-label="Naslednja fotografija">
              <ArrowIcon direction="right" />
            </button>
          </>
        )}
      </div>
      {showCaption && (current.caption || total > 1) && (
        <div style={{ textAlign: "center", marginTop: 14 }}>
          {current.caption && (
            <div
              className="font-serif"
              style={{ fontStyle: "italic", fontSize: 14, color: "oklch(20% 0.01 260 / 0.7)", marginBottom: 4 }}
            >
              {current.caption}
            </div>
          )}
          {total > 1 && <div style={{ fontSize: 12, color: "oklch(20% 0.01 260 / 0.4)" }}>{index + 1} / {total}</div>}
        </div>
      )}
    </div>
  );
}
