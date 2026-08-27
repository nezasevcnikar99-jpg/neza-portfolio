import type { Project } from "@/payload-types";

export type { Project };

/**
 * The index is a ruled grid of square cells, four across.
 *
 * Every cell is drawn, including the empty ones — that is what the whole layout
 * rests on. A caption pinned to the corner of a ruled cell reads as belonging
 * to that cell; the same caption floating in open white does not, which is why
 * earlier versions of this page never settled.
 *
 * A picture fills one or two cells across and always one down, so the only
 * thing that varies is width. Each picture reserves the cell beside it for its
 * caption, and the caption sits in the corner nearest the picture.
 */
export const COLUMNS = 4;

export type Cell =
  | { kind: "image"; project: Project; index: number; span: number }
  | { kind: "label"; project: Project; index: number; corner: "tl" | "br" }
  | { kind: "empty" };

/** Legacy stored values — see the field definition in Projects.ts. */
const WIDE_BY_FIELD: Record<string, boolean> = {
  "1x1": false,
  "1x2": false,
  "2x1": true,
  "2x2": true,
};

/** Width order used for projects left on "auto". Five, so it does not fall into
 *  step with the four columns and leave one of them always the same. */
const AUTO_CYCLE = [false, true, false, false, true];

function isWide(project: Project, index: number): boolean {
  const chosen = project.gridSize;
  if (chosen && chosen !== "auto" && chosen in WIDE_BY_FIELD) return WIDE_BY_FIELD[chosen];
  return AUTO_CYCLE[index % AUTO_CYCLE.length];
}

export function buildIndexBands(projects: Project[]): Cell[][] {
  const bands: Cell[][] = [];
  let band: Cell[] = [];
  let used = 0;

  const closeBand = () => {
    while (used < COLUMNS) {
      band.push({ kind: "empty" });
      used += 1;
    }
    bands.push(band);
    band = [];
    used = 0;
  };

  projects.forEach((project, index) => {
    const span = isWide(project, index) ? 2 : 1;
    const needed = span + 1; // the picture plus the cell its caption sits in

    if (used + needed > COLUMNS) closeBand();

    // Alternate which side the caption takes, band by band, so the page does
    // not settle into one repeating figure.
    const labelFirst = bands.length % 2 === 1;
    const image: Cell = { kind: "image", project, index, span };
    const label: Cell = { kind: "label", project, index, corner: labelFirst ? "tl" : "br" };

    band.push(...(labelFirst ? [label, image] : [image, label]));
    used += needed;
  });

  if (band.length) closeBand();

  return bands;
}
