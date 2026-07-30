"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import PhotoSlider, { type Slide } from "./PhotoSlider";

export default function ProjectPhotoMosaic({ slides }: { slides: Slide[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    if (openIndex === null) return;
    document.body.style.overflow = "hidden";
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenIndex(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [openIndex]);

  if (slides.length === 0) return null;

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 12,
        }}
      >
        {slides.map((slide, i) => (
          <button
            key={i}
            type="button"
            className="mosaic-thumb"
            onClick={() => setOpenIndex(i)}
            aria-label={slide.caption ?? `Odpri fotografijo ${i + 1}`}
          >
            <ImageSlot
              label={slide.caption ?? "slika"}
              aspectRatio="1"
              src={slide.image?.url}
              alt={slide.image?.alt ?? slide.caption ?? undefined}
              mimeType={slide.image?.mimeType}
              filename={slide.image?.filename}
              focalX={slide.image?.focalX}
              focalY={slide.image?.focalY}
            />
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <div
          onClick={() => setOpenIndex(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "oklch(15% 0.01 260 / 0.94)",
            zIndex: 50,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 48,
          }}
        >
          <button type="button" className="lightbox-close" onClick={() => setOpenIndex(null)} aria-label="Zapri">
            ×
          </button>
          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 1100 }}>
            <PhotoSlider key={openIndex} slides={slides} initialIndex={openIndex} aspectRatio="16/10" dark />
          </div>
        </div>
      )}
    </>
  );
}
