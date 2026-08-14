"use client";

import { useMemo, useSyncExternalStore } from "react";
import Link from "next/link";
import type { Media } from "@/payload-types";
import { getProjectShape, type Project } from "@/lib/projects";

const WIDE = "(min-width: 1001px)";
const MEDIUM = "(min-width: 701px)";

const subscribeColumns = (onChange: () => void) => {
  const queries = [window.matchMedia(WIDE), window.matchMedia(MEDIUM)];
  queries.forEach((q) => q.addEventListener("change", onChange));
  // Belt and braces: a plain resize covers anything that moves the viewport
  // without firing a media query change.
  window.addEventListener("resize", onChange);
  return () => {
    queries.forEach((q) => q.removeEventListener("change", onChange));
    window.removeEventListener("resize", onChange);
  };
};
const columnSnapshot = () =>
  window.matchMedia(WIDE).matches ? 3 : window.matchMedia(MEDIUM).matches ? 2 : 1;
const columnServerSnapshot = () => 3;

/**
 * How far each column is dropped, in pixels. Without this the first picture in
 * every column starts on one line across the top of the page — the most visible
 * place for the grid to look like a row of boxes.
 */
const OFFSETS: Record<number, number[]> = {
  3: [0, 84, 36],
  2: [0, 64],
  1: [0],
};

/** Rough column width the offsets are converted against when balancing. */
const NOMINAL_COLUMN = 430;
/** Label plus the gap under a picture, as a multiple of the column width. */
const ITEM_CHROME = 0.28;

export default function WorkGrid({ projects }: { projects: Project[] }) {
  const columnCount = useSyncExternalStore(subscribeColumns, columnSnapshot, columnServerSnapshot);

  const columns = useMemo(() => {
    const offsets = OFFSETS[columnCount] ?? OFFSETS[1];
    const buckets: { project: Project; index: number }[][] = offsets.map(() => []);
    // Start each column already "filled" by its offset so the drop is taken into
    // account when balancing, not just painted on afterwards.
    const heights = offsets.map((px) => px / NOMINAL_COLUMN);

    projects.forEach((project, index) => {
      // The first project in each column goes there in order, so the top of the
      // page still reads left to right; the drop given to a column would
      // otherwise send the second project past it to a shallower one.
      let target = index;
      if (index >= heights.length) {
        target = 0;
        for (let c = 1; c < heights.length; c++) {
          if (heights[c] < heights[target]) target = c;
        }
      }
      buckets[target].push({ project, index });
      heights[target] += getProjectShape(project, index).relHeight + ITEM_CHROME;
    });

    return buckets;
  }, [projects, columnCount]);

  const offsets = OFFSETS[columnCount] ?? OFFSETS[1];

  return (
    <div className="work-grid">
      {columns.map((bucket, c) => (
        <div key={c} className="work-col" style={{ paddingTop: offsets[c] }}>
          {bucket.map(({ project: p, index }) => {
            const heroDoc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
            const hero = heroDoc?.mimeType?.startsWith("image/") ? heroDoc : null;
            const quote = p.quote?.trim();
            const { ratio } = getProjectShape(p, index);

            return (
              <Link key={p.slug} href={`/projects/${p.slug}`} className="work-item">
                <div className="work-media" style={{ aspectRatio: ratio }}>
                  {hero?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={hero.url}
                      alt={hero.alt}
                      className="work-image"
                      style={{ objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%` }}
                    />
                  ) : (
                    <span className="work-placeholder">{p.imgLabel ?? "fotografija"}</span>
                  )}

                  {/* Only when there is something to say — an empty quote used to
                      render as the literal word "null" across the picture. */}
                  {quote && (
                    <span className="work-quote">
                      <span className="font-serif">{`"${quote}"`}</span>
                    </span>
                  )}
                </div>

                <span className="work-label">
                  <span className="work-title">{p.title}</span>
                  <span className="work-meta">
                    {p.category}, {p.year}
                  </span>
                </span>
              </Link>
            );
          })}
        </div>
      ))}
    </div>
  );
}
