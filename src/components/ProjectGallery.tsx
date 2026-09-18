"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Media } from "@/payload-types";

export type Slide = {
  image: Media | null;
  caption?: string | null;
  /** Shown on the project page itself, not only inside the gallery. */
  onPage?: boolean;
};

function Chevron({ direction }: { direction: "left" | "right" }) {
  const points = direction === "left" ? "17,4 7,15 17,26" : "9,4 19,15 9,26";
  return (
    <svg width="20" height="30" viewBox="0 0 26 30" fill="none" aria-hidden="true">
      <polyline
        points={points}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProjectGallery({
  slides,
  startIndex,
  fallbackTitle,
  onClose,
}: {
  slides: Slide[];
  startIndex: number;
  fallbackTitle: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const total = slides.length;

  const dialogRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** Where the keyboard was before this opened, so it can be handed back. */
  const openerRef = useRef<Element | null>(null);

  const step = useCallback(
    (delta: number) => setIndex((i) => (i + delta + total) % total),
    [total]
  );

  // Take the keyboard on open and give it back on close. Without this the
  // gallery covers the page but Tab walks straight into the links behind it.
  useEffect(() => {
    openerRef.current = document.activeElement;
    closeRef.current?.focus();
    return () => {
      const opener = openerRef.current;
      if (opener instanceof HTMLElement) opener.focus();
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key === "ArrowLeft") step(-1);
      if (e.key === "ArrowRight") step(1);

      if (e.key === "Tab") {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button, [href], [tabindex]:not([tabindex="-1"])'
        );
        if (!focusable?.length) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        const active = document.activeElement;

        // Keep the cycle inside the dialog, in both directions.
        if (e.shiftKey && (active === first || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && (active === last || !dialogRef.current?.contains(active))) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [step, onClose]);

  if (total === 0) return null;

  const current = slides[index];
  const title =
    current.caption?.trim() || current.image?.alt?.trim().replace(/\s+[–—]\s+naslovna$/, "") || fallbackTitle;

  return (
    <div
      ref={dialogRef}
      className="gallery"
      role="dialog"
      aria-modal="true"
      aria-label="Galerija projekta"
    >
      <button
        ref={closeRef}
        type="button"
        className="gallery-close"
        onClick={onClose}
        aria-label="Zapri galerijo"
      >
        ×
      </button>

      <div className="gallery-stage">
        {current.image?.url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={current.image.url} alt={current.image.alt ?? title} className="gallery-image" />
        ) : (
          <div className="gallery-placeholder">{title}</div>
        )}
      </div>

      {total > 1 && (
        <>
          <button
            type="button"
            className="gallery-arrow left"
            onClick={() => step(-1)}
            aria-label="Prejšnja fotografija"
          >
            <Chevron direction="left" />
          </button>
          <button
            type="button"
            className="gallery-arrow right"
            onClick={() => step(1)}
            aria-label="Naslednja fotografija"
          >
            <Chevron direction="right" />
          </button>
        </>
      )}

      <div className="gallery-bar">
        <span className="gallery-title">{title}</span>
        <span className="gallery-count">
          {String(index + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}
        </span>
      </div>
    </div>
  );
}
