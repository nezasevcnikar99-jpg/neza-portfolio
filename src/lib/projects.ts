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

/**
 * Shape order used for projects left on "auto".
 *
 * Weighted towards squares: three of them fill a band exactly, while anything
 * two columns wide leaves room for only one more picture. Leaning on squares
 * keeps bands full and the page shorter.
 */
const AUTO_CYCLE: SizeKey[] = [
  "small",
  "small",
  "small",
  "landscape",
  "small",
  "small",
  "big",
  "small",
];

const COLUMNS = 6;

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

type Banded = { index: number; w: number; h: number };

export function buildScatterLayout(projects: Project[]): Slot[] {
  // Group into bands first, so a band's total width is known before placing it.
  const bands: Banded[][] = [];
  let band: Banded[] = [];
  let cursor = 1;

  projects.forEach((project, index) => {
    const { w, h } = SIZES[resolveSize(project, index)];
    if (cursor + w > COLUMNS) {
      bands.push(band);
      band = [];
      cursor = 1;
    }
    band.push({ index, w, h });
    cursor += w + 1;
  });
  if (band.length) bands.push(band);

  const slots: Slot[] = [];
  let bandRow = 1;

  bands.forEach((items, bandIndex) => {
    let column = 1;
    const placed = items.map((item, position) => {
      const first = position === 0;
      const imageCol = first ? column : column + 1;
      column += item.w + 1;
      return { ...item, position, imageCol };
    });

    // Push the last picture out to the right edge so the band spans the full
    // width. Without this a leftover column reads as a much wider right margin
    // than the left one. A lone picture stays put — it has no band to justify.
    const slack = COLUMNS - (column - 1);
    if (slack > 0 && placed.length > 1) {
      placed[placed.length - 1].imageCol += slack;
    }

    placed.forEach((item) => {
      slots[item.index] = {
        gridColumn: `${item.imageCol} / span ${item.w}`,
        gridRow: `${bandRow} / span ${item.h}`,
        labelSide: item.position === 0 ? "right" : "left",
        labelTop: (item.position + bandIndex) % 2 === 0,
      };
    });

    // One spacer row between bands: a quarter module, not a whole one.
    bandRow += Math.max(...items.map((item) => item.h)) + 1;
  });

  return slots;
}
