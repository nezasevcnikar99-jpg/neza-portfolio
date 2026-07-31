import type { Project } from "@/payload-types";

export type { Project };

/**
 * Home composition: a six-column grid built on one square module.
 *
 * Three footprints — a square, a double square, and a landscape two squares
 * wide — so every picture is a whole number of modules.
 *
 * Each picture claims one extra column for its label, which sits horizontally
 * beside it. Reserving that column during packing rather than afterwards is
 * what stops two neighbours from wanting the same gap: the first picture in a
 * band takes the column to its right, everyone after it takes the column to
 * its left, so no column is ever claimed twice. It also means the picture that
 * starts at column one never puts its label out in the page margin.
 *
 * Rows are quarter modules. Four of them plus the gaps add back up to a whole
 * module, so pictures stay exactly square while bands can sit a quarter module
 * apart — close enough to read as one field rather than separate rows.
 */
export type SizeKey = "small" | "big" | "landscape";

/** Width in columns, height in quarter-module rows. */
const SIZES: Record<SizeKey, { w: number; h: number }> = {
  small: { w: 1, h: 4 },
  big: { w: 2, h: 8 },
  landscape: { w: 2, h: 4 },
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

/**
 * Seven rather than six: each picture spends one column on its label, so a
 * coarser grid would only fit two pictures to a band and the page would grow
 * taller, not shorter.
 */
const COLUMNS = 7;

function resolveSize(project: Project, index: number): SizeKey {
  const chosen = project.gridSize;
  if (chosen && chosen !== "auto" && SIZE_BY_FIELD[chosen]) return SIZE_BY_FIELD[chosen];
  return AUTO_CYCLE[index % AUTO_CYCLE.length];
}

export type Slot = {
  gridColumn: string;
  gridRow: string;
  labelSide: "left" | "right";
  labelTop: boolean;
};

export function buildScatterLayout(projects: Project[]): Slot[] {
  const slots: Slot[] = [];

  let bandIndex = 0;
  let bandRow = 1;
  let bandHeight = 0;
  let cursor = 1;
  let positionInBand = 0;

  projects.forEach((project, index) => {
    const { w, h } = SIZES[resolveSize(project, index)];

    if (cursor + w > COLUMNS) {
      // One spacer row between bands: a quarter module, not a whole one.
      bandRow += bandHeight + 1;
      bandHeight = 0;
      bandIndex += 1;
      cursor = 1;
      positionInBand = 0;
    }

    const first = positionInBand === 0;
    const imageCol = first ? cursor : cursor + 1;

    slots[index] = {
      gridColumn: `${imageCol} / span ${w}`,
      gridRow: `${bandRow} / span ${h}`,
      labelSide: first ? "right" : "left",
      labelTop: (positionInBand + bandIndex) % 2 === 0,
    };

    cursor = cursor + w + 1;
    positionInBand += 1;
    bandHeight = Math.max(bandHeight, h);
  });

  return slots;
}
