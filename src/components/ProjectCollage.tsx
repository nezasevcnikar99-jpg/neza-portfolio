"use client";

import { useState } from "react";
import ProjectGallery, { type Slide } from "./ProjectGallery";

export type { Slide };

/**
 * The collage occupies the three right-hand columns of the project's grid — the
 * first belongs to the writing. Cells are the same square module as the index,
 * so the two pages read as one grid.
 *
 * It shows four pictures at most; the rest are in the gallery. Empty cells are
 * emitted alongside them so every rule is drawn, as on the index.
 */
const SLOTS = [
  { col: 2, span: 2, row: 1 },
  { col: 3, span: 2, row: 2 },
  { col: 2, span: 2, row: 3 },
  { col: 4, span: 1, row: 3 },
];

/** Cells the pictures leave open, plus the one the gallery button sits in. */
const BLANKS = [
  { col: 4, row: 1 },
  { col: 2, row: 2 },
  { col: 2, row: 4 },
  { col: 3, row: 4 },
];

const BUTTON = { col: 4, row: 4 };

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

  // Which pictures stand on the page is chosen in the admin, one tick per row;
  // the slots only limit how many of them fit. Each keeps its place in the full
  // run so a click opens the gallery on the same picture.
  const onPage = slides
    .map((slide, index) => ({ slide, index }))
    .filter((entry) => entry.slide.onPage !== false)
    .slice(0, SLOTS.length);

  const shown = SLOTS.slice(0, Math.max(onPage.length, 1));
  const hidden = Math.max(0, slides.length - onPage.length);

  return (
    <>
      {shown.map((slot, i) => {
        const entry = onPage[i];
        const slide = entry?.slide;
        const label =
          slide?.caption?.trim() || slide?.image?.alt?.trim() || `${fallbackTitle} ${i + 1}`;

        return (
          <button
            key={`shot-${i}`}
            type="button"
            className="cell cell-shot"
            style={{ gridColumn: `${slot.col} / span ${slot.span}`, gridRow: slot.row }}
            onClick={() => entry && setOpenAt(entry.index)}
            aria-label={`Odpri galerijo — ${label}`}
          >
            <span className="cell-inner">
              {slide?.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image.url}
                  alt={slide.image.alt ?? label}
                  className="cell-photo"
                  style={{
                    objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%`,
                  }}
                />
              ) : (
                <span className="cell-blank">{placeholderLabel}</span>
              )}
              <span className="cell-shot-caption">{label}</span>
            </span>
          </button>
        );
      })}

      {/* The slots the pictures did not fill, so the rules still run through. */}
      {SLOTS.slice(shown.length).map((slot, i) => (
        <span
          key={`unused-${i}`}
          className="cell"
          style={{ gridColumn: `${slot.col} / span ${slot.span}`, gridRow: slot.row }}
        />
      ))}

      {BLANKS.map((cell, i) => (
        <span
          key={`blank-${i}`}
          className="cell"
          style={{ gridColumn: cell.col, gridRow: cell.row }}
        />
      ))}

      <div className="cell cell-action" style={{ gridColumn: BUTTON.col, gridRow: BUTTON.row }}>
        {slides.length > 0 && (
          <button type="button" className="gallery-open" onClick={() => setOpenAt(0)}>
            <span className="gallery-open-label">Galerija</span>
            <span className="gallery-open-count">
              {hidden > 0 ? `${slides.length} fotografij` : `${slides.length} v galeriji`}
            </span>
          </button>
        )}
      </div>

      {openAt !== null && (
        <ProjectGallery
          slides={slides}
          startIndex={openAt}
          fallbackTitle={fallbackTitle}
          onClose={() => setOpenAt(null)}
        />
      )}
    </>
  );
}
