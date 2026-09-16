"use client";

import { useState } from "react";
import ProjectGallery, { type Slide } from "./ProjectGallery";

/**
 * The right-hand column of a written piece: a few of its pictures, whole and
 * captioned, then the way into the full gallery. The writing holds the middle
 * of the page, so the pictures stay beside it rather than breaking it up.
 */
const SHOWN = 3;

export default function EssayFigures({ slides, title }: { slides: Slide[]; title: string }) {
  const [openAt, setOpenAt] = useState<number | null>(null);

  const shown = slides
    .map((slide, index) => ({ slide, index }))
    .filter((entry) => entry.slide.onPage !== false && entry.slide.image?.url)
    .slice(0, SHOWN);
  const rest = slides.length - shown.length;

  return (
    <aside className="cell essay-aside">
      {shown.map(({ slide, index }) => (
        <figure key={index} className="essay-figure">
          <button
            type="button"
            className="essay-figure-button"
            onClick={() => setOpenAt(index)}
            aria-label={`Odpri galerijo — ${slide.caption?.trim() || title}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={slide.image!.url!} alt={slide.image?.alt ?? ""} className="essay-figure-img" />
          </button>
          {slide.caption?.trim() && <figcaption>{slide.caption.trim()}</figcaption>}
        </figure>
      ))}

      {slides.length > 0 && (
        <button type="button" className="essay-more" onClick={() => setOpenAt(0)}>
          <span className="cell-more-count">{rest > 0 ? `+${rest}` : slides.length}</span>
          <span className="cell-more-text">Odpri galerijo</span>
        </button>
      )}

      {openAt !== null && (
        <ProjectGallery slides={slides} startIndex={openAt} fallbackTitle={title} onClose={() => setOpenAt(null)} />
      )}
    </aside>
  );
}
