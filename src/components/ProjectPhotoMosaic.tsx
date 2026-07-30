"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import PhotoSlider, { type Slide } from "./PhotoSlider";

export default function ProjectPhotoMosaic({ slides }: { slides: Slide[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const active = openIndex !== null ? slides[activeIndex] : null;

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
            onClick={() => {
              setActiveIndex(i);
              setOpenIndex(i);
            }}
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
            background: "#ffffff",
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

          {active && (
            <div
              className="font-sans"
              style={{
                position: "fixed",
                right: 28,
                bottom: 32,
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                color: "oklch(55% 0.18 258)",
                fontSize: 13,
                letterSpacing: "0.02em",
                lineHeight: 1.6,
                whiteSpace: "nowrap",
              }}
            >
              {active.caption ? `${active.caption} — ` : ""}
              {activeIndex + 1} / {slides.length}
            </div>
          )}

          <div onClick={(e) => e.stopPropagation()} style={{ width: "100%", maxWidth: 1100 }}>
            <PhotoSlider
              key={openIndex}
              slides={slides}
              initialIndex={openIndex}
              aspectRatio="16/10"
              showCaption={false}
              onIndexChange={setActiveIndex}
            />
          </div>
        </div>
      )}
    </>
  );
}
