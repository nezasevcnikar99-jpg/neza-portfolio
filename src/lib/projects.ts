import type { Project } from "@/payload-types";

export type { Project };

/**
 * The home composition is a 12-column module grid with no gutters, so placements
 * are exact: images that sit in neighbouring cells meet edge to edge, and images
 * placed one module apart diagonally meet at a single corner.
 *
 * A unit of five projects repeats down the page. Within a unit:
 *   0 — 1  share a vertical edge
 *   1 — 2  meet at a corner
 *   2 — 3  meet at a corner
 *   4      stands alone, giving the composition somewhere to breathe
 *
 * Each image reserves an empty cell beside it for its label, which is why the
 * labels line up with the grid instead of floating against the pictures.
 */
type Cell = { col: number; colSpan: number; row: number; rowSpan: number };
type Slot = { image: Cell; label: Cell };

const UNIT: Slot[] = [
  {
    image: { col: 1, colSpan: 5, row: 1, rowSpan: 4 },
    label: { col: 6, colSpan: 3, row: 1, rowSpan: 1 },
  },
  {
    image: { col: 6, colSpan: 5, row: 3, rowSpan: 5 },
    label: { col: 11, colSpan: 2, row: 3, rowSpan: 1 },
  },
  {
    image: { col: 3, colSpan: 3, row: 8, rowSpan: 4 },
    label: { col: 6, colSpan: 3, row: 8, rowSpan: 1 },
  },
  {
    image: { col: 6, colSpan: 5, row: 12, rowSpan: 4 },
    label: { col: 11, colSpan: 2, row: 12, rowSpan: 1 },
  },
  {
    image: { col: 1, colSpan: 4, row: 17, rowSpan: 5 },
    label: { col: 5, colSpan: 3, row: 17, rowSpan: 1 },
  },
];

/** Height of one repeat, leaving a blank row before the next unit starts. */
const UNIT_ROWS = 22;

const shift = (cell: Cell, rows: number): Cell => ({ ...cell, row: cell.row + rows });

export function getScatterSlot(index: number): Slot {
  const slot = UNIT[index % UNIT.length];
  const rows = Math.floor(index / UNIT.length) * UNIT_ROWS;
  return { image: shift(slot.image, rows), label: shift(slot.label, rows) };
}

export const area = (cell: Cell) => ({
  gridColumn: `${cell.col} / span ${cell.colSpan}`,
  gridRow: `${cell.row} / span ${cell.rowSpan}`,
});
