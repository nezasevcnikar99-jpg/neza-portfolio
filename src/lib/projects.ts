import type { Project } from "@/payload-types";

export type { Project };

/**
 * Home composition: a six-column grid built on one square module.
 *
 * Three footprints only — a square, a double square, and a landscape two
 * squares wide — so every picture is a whole number of modules and the grid
 * stays readable however the sizes are mixed.
 *
 * Rows are half modules, which lets bands sit closer together than a full
 * module would allow while pictures stay exactly square.
 *
 * Each picture keeps the column to its left empty. That is where its vertical
 * label goes, and it is also what keeps the composition open.
 */
export type SizeKey = "small" | "big" | "landscape";

/** Width in columns, height in half-module rows. */
const SIZES: Record<SizeKey, { w: number; h: number }> = {
  small: { w: 1, h: 2 },
  big: { w: 2, h: 4 },
  landscape: { w: 2, h: 2 },
};

/**
 * Maps the stored field value onto a size. The keys are legacy names kept to
 * avoid a Postgres enum migration — see the field definition in Projects.ts.
 */
const SIZE_BY_FIELD: Record<string, SizeKey> = {
  "1x1": "small",
  "2x2": "big",
  "2x1": "landscape",
  "1x2": "small",
};

/** Shape order used for projects left on "auto". */
const AUTO_CYCLE: SizeKey[] = [
  "landscape",
  "small",
  "small",
  "big",
  "small",
  "landscape",
  "small",
  "small",
];

const COLUMNS = 6;

function resolveSize(project: Project, index: number): SizeKey {
  const chosen = project.gridSize;
  if (chosen && chosen !== "auto" && SIZE_BY_FIELD[chosen]) return SIZE_BY_FIELD[chosen];
  return AUTO_CYCLE[index % AUTO_CYCLE.length];
}

export type Slot = { gridColumn: string; gridRow: string };

export function buildScatterLayout(projects: Project[]): Slot[] {
  const slots: Slot[] = [];

  let bandIndex = 0;
  let bandRow = 1;
  let bandHeight = 0;
  let cursor = 1;
  let firstInBand = true;

  projects.forEach((project, index) => {
    const { w, h } = SIZES[resolveSize(project, index)];

    // Every picture but the first in a band leaves a column free on its left.
    let col = firstInBand ? cursor : cursor + 1;

    if (col + w - 1 > COLUMNS) {
      bandRow += bandHeight + 1;
      bandHeight = 0;
      bandIndex += 1;
      // Bands alternate between starting flush left and one column in, so the
      // page does not read as a single left-hand stack.
      cursor = bandIndex % 2 === 0 ? 1 : 2;
      firstInBand = true;
      col = cursor;
    }

    slots[index] = {
      gridColumn: `${col} / span ${w}`,
      gridRow: `${bandRow} / span ${h}`,
    };

    cursor = col + w;
    firstInBand = false;
    bandHeight = Math.max(bandHeight, h);
  });

  return slots;
}
