"use client";

import { useEffect, useState } from "react";
import ImageSlot from "./ImageSlot";
import type { Media } from "@/payload-types";

type GalleryItem = {
  id?: string | null;
  image: number | Media;
  caption?: string | null;
};

export default function GalleryCarousel({ items }: { items: GalleryItem[] }) {
  const [index, setIndex] = useState(0);
  const total = items.length;

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

  const current = items[index];
  const image = typeof current.image === "object" ? current.image : null;

  return (
    <div>
      <ImageSlot
        label={current.caption ?? "slika"}
        aspectRatio="3/2"
        src={image?.url}
        alt={image?.alt ?? current.caption ?? undefined}
        mimeType={image?.mimeType}
        filename={image?.filename}
        focalX={image?.focalX}
        focalY={image?.focalY}
      />
      <div
        style={{
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
          gap: 16,
          marginTop: 20,
          fontSize: 14,
        }}
      >
        <button
          type="button"
          onClick={goPrev}
          disabled={total <= 1}
          className="nav-link"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            cursor: total > 1 ? "pointer" : "default",
            opacity: total > 1 ? 1 : 0.3,
          }}
        >
          ← Prejšnja
        </button>

        <div style={{ textAlign: "center", flex: 1, minWidth: 0 }}>
          {current.caption && (
            <div
              className="font-serif"
              style={{ fontStyle: "italic", fontSize: 15, color: "oklch(20% 0.01 260 / 0.75)", marginBottom: 4 }}
            >
              {current.caption}
            </div>
          )}
          <div style={{ fontSize: 12, color: "oklch(20% 0.01 260 / 0.4)" }}>
            {index + 1} / {total}
          </div>
        </div>

        <button
          type="button"
          onClick={goNext}
          disabled={total <= 1}
          className="nav-link"
          style={{
            background: "none",
            border: "none",
            padding: 0,
            font: "inherit",
            cursor: total > 1 ? "pointer" : "default",
            opacity: total > 1 ? 1 : 0.3,
          }}
        >
          Naslednja →
        </button>
      </div>
    </div>
  );
}
