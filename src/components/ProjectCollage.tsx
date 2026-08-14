"use client";

import { useState } from "react";
import ProjectGallery, { type Slide } from "./ProjectGallery";

export type { Slide };

/**
 * The collage shows a handful of pictures, not the whole set — the rest live in
 * the gallery. Slots are placed by hand on a six-column square module so the
 * composition reads as deliberate rather than as a contact sheet, with empty
 * modules doing the spacing.
 */
const SLOTS = [
  { col: 1, colSpan: 4, row: 1, rowSpan: 3 },
  { col: 5, colSpan: 2, row: 2, rowSpan: 3 },
  { col: 2, colSpan: 2, row: 5, rowSpan: 2 },
  { col: 4, colSpan: 3, row: 6, rowSpan: 2 },
  { col: 1, colSpan: 3, row: 8, rowSpan: 2 },
];

export default function ProjectCollage({
  slides,
  fallbackTitle,
  placeholderLabel,
}: {
  slides: Slide[];
  fallbackTitle: string;
  placeholderLabel: string;
}) {
  const [openAt, setOpenAt] = useState<number | null>(null);
  const featured = slides.slice(0, SLOTS.length);
  const hidden = slides.length - featured.length;

  if (slides.length === 0) {
    return <div className="collage-empty">{placeholderLabel}</div>;
  }

  return (
    <div className="collage">
      <div className="collage-grid">
        {featured.map((slide, i) => {
          const slot = SLOTS[i];
          const label = slide.caption?.trim() || slide.image?.alt?.trim() || `${fallbackTitle} ${i + 1}`;

          return (
            <button
              key={i}
              type="button"
              className="collage-tile"
              style={{
                gridColumn: `${slot.col} / span ${slot.colSpan}`,
                gridRow: `${slot.row} / span ${slot.rowSpan}`,
              }}
              onClick={() => setOpenAt(i)}
              aria-label={`Odpri galerijo — ${label}`}
            >
              {slide.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image.url}
                  alt={slide.image.alt ?? label}
                  className="collage-image"
                  style={{ objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%` }}
                />
              ) : (
                <span className="collage-placeholder">{placeholderLabel}</span>
              )}
              <span className="collage-caption">{label}</span>
            </button>
          );
        })}
      </div>

      {slides.length > 1 && (
        <button type="button" className="collage-all" onClick={() => setOpenAt(0)}>
          {hidden > 0 ? `Vse fotografije (${slides.length})` : "Odpri galerijo"} →
        </button>
      )}

      {openAt !== null && (
        <ProjectGallery
          slides={slides}
          startIndex={openAt}
          fallbackTitle={fallbackTitle}
          onClose={() => setOpenAt(null)}
        />
      )}
    </div>
  );
}
