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
  // The tile shows the first picture that is not on the page, faded, so it reads
  // as more of the same set rather than as a control.
  const firstHidden = slides.findIndex((slide) => slide.onPage === false && slide.image?.url);
  const teaser = firstHidden === -1 ? null : slides[firstHidden];

  return (
    <>
      {shown.map((slot, i) => {
        const entry = onPage[i];
        const slide = entry?.slide;
        const caption = slide?.caption?.trim();
        const label = caption || slide?.image?.alt?.trim() || `${fallbackTitle} ${i + 1}`;

        return (
          <button
            key={`shot-${i}`}
            type="button"
            className="cell cell-shot"
            style={{ gridColumn: `${slot.col} / span ${slot.span}`, gridRow: slot.row }}
            onClick={() => entry && setOpenAt(entry.index)}
            aria-label={`Odpri galerijo – ${label}`}
          >
            <span className="cell-inner">
              {slide?.image?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={slide.image.url}
                  alt={slide.image.alt ?? label}
                  className={slide.image.showWhole ? "cell-photo is-whole" : "cell-photo"}
                  style={
                    slide.image.showWhole
                      ? undefined
                      : { objectPosition: `${slide.image.focalX ?? 50}% ${slide.image.focalY ?? 50}%` }
                  }
                />
              ) : (
                <span className="cell-blank">{placeholderLabel}</span>
              )}
              {/* Only a written caption is shown; the opening picture has none,
                  and its stored description ("… – naslovna") is not one. */}
              {caption && <span className="cell-shot-caption">{caption}</span>}
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

      {slides.length > 0 ? (
        <button
          type="button"
          className="cell cell-more"
          style={{ gridColumn: BUTTON.col, gridRow: BUTTON.row }}
          onClick={() => setOpenAt(firstHidden === -1 ? 0 : firstHidden)}
          aria-label={`Odpri galerijo – ${slides.length} slik`}
        >
          <span className="cell-inner">
            {teaser?.image?.url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={teaser.image.url} alt="" className="cell-photo cell-more-photo" />
            )}
            <span className="cell-more-label">
              <span className="cell-more-count">{hidden > 0 ? `+${hidden}` : slides.length}</span>
              <span className="cell-more-text">Odpri galerijo</span>
            </span>
          </span>
        </button>
      ) : (
        <span className="cell" style={{ gridColumn: BUTTON.col, gridRow: BUTTON.row }} />
      )}

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
