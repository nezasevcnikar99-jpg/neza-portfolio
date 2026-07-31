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
 * Weighted towards squares, and towards runs of four of them: four squares fill
 * a band exactly, which both puts a picture in the last column and sets two
 * pairs side by side so their inner edges meet. Anything two columns wide
 * breaks the run, so the wider shapes are spaced out.
 */
const AUTO_CYCLE: SizeKey[] = [
  "small",
  "small",
  "small",
  "small",
  "landscape",
  "small",
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

/**
 * Pictures are taken two at a time, and each pair shares the single column
 * between them: the left picture's label hangs from the top of it, the right
 * one's from the bottom. Halving the columns spent on labels is what lets a
 * band hold three or four pictures instead of two.
 */
const columnsUsed = (items: Banded[]) =>
  items.reduce((total, item) => total + item.w, 0) + Math.ceil(items.length / 2);

/**
 * Bands are not all flush to both margins — that reads as too regular. Every
 * third one is indented by a column, and only every third is pushed out to the
 * right edge, so some rows float clear of one margin or the other.
 */
const bandStart = (band: number) => (band % 3 === 1 ? 2 : 1);
const bandJustifies = (band: number) => band % 3 === 0;

export function buildScatterLayout(projects: Project[]): Slot[] {
  const bands: Banded[][] = [];
  let band: Banded[] = [];

  projects.forEach((project, index) => {
    const { w, h } = SIZES[resolveSize(project, index)];
    const available = COLUMNS - (bandStart(bands.length) - 1);
    if (band.length > 0 && columnsUsed([...band, { index, w, h }]) > available) {
      bands.push(band);
      band = [];
    }
    band.push({ index, w, h });
  });
  if (band.length) bands.push(band);

  const slots: Slot[] = [];
  let bandRow = 1;

  bands.forEach((items, bandIndex) => {
    type Placed = Banded & { imageCol: number; side: "left" | "right"; top: boolean };
    const groups: Placed[][] = [];
    let column = bandStart(bandIndex);

    for (let i = 0; i < items.length; i += 2) {
      const left = items[i];
      const right = items[i + 1];
      // Alternate which of the pair takes the top of the shared column.
      const flip = (bandIndex + groups.length) % 2 === 1;

      if (right) {
        const labelCol = column + left.w;
        groups.push([
          { ...left, imageCol: column, side: "right", top: !flip },
          { ...right, imageCol: labelCol + 1, side: "left", top: flip },
        ]);
        column = labelCol + 1 + right.w;
      } else {
        // A picture with no partner takes its label on the left instead, so the
        // picture itself can sit against the right edge rather than its caption.
        groups.push([{ ...left, imageCol: column + 1, side: "left", top: !flip }]);
        column += left.w + 1;
      }
    }

    // Shift the whole last group, never a single picture out of a pair, or the
    // two would lose the column they share.
    const slack = COLUMNS - (column - 1);
    if (bandJustifies(bandIndex) && slack > 0 && groups.length > 1) {
      groups[groups.length - 1].forEach((item) => {
        item.imageCol += slack;
      });
    }

    groups.flat().forEach((item) => {
      slots[item.index] = {
        gridColumn: `${item.imageCol} / span ${item.w}`,
        gridRow: `${bandRow} / span ${item.h}`,
        labelSide: item.side,
        labelTop: item.top,
      };
    });

    // One spacer row between bands: a quarter module, not a whole one.
    bandRow += Math.max(...items.map((item) => item.h)) + 1;
  });

  return slots;
}
