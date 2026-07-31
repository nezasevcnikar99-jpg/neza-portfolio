import type { Project } from "@/payload-types";

export type { Project };

/**
 * Home composition: a 12-column grid with even gutters.
 *
 * Only four picture sizes exist, and every image starts on one of four column
 * lines (1, 4, 7, 10). Repeating so few sizes and so few left edges is what
 * makes the grid legible — the eye picks up the alignment down the page.
 *
 * Images are placed in explicit bands rather than left to flow, and everything
 * in a band hangs from the same top line. No per-image vertical offsets: those
 * are what made earlier versions read as scattered rather than composed.
 */
type SizeKey = "landscape" | "portrait" | "square" | "wide";

const SIZES: Record<SizeKey, { span: number; ratio: string }> = {
  landscape: { span: 4, ratio: "4 / 3" },
  portrait: { span: 3, ratio: "3 / 4" },
  square: { span: 3, ratio: "1 / 1" },
  wide: { span: 5, ratio: "16 / 10" },
};

/** Each size appears exactly twice per unit, so no shape dominates. */
const UNIT: { band: number; start: number; size: SizeKey }[] = [
  { band: 1, start: 1, size: "landscape" },
  { band: 1, start: 7, size: "square" },
  { band: 2, start: 4, size: "wide" },
  { band: 3, start: 1, size: "portrait" },
  { band: 3, start: 7, size: "landscape" },
  { band: 4, start: 4, size: "square" },
  { band: 4, start: 10, size: "portrait" },
  { band: 5, start: 1, size: "wide" },
];

const UNIT_BANDS = 5;

export function getScatterSlot(index: number) {
  const slot = UNIT[index % UNIT.length];
  const unit = Math.floor(index / UNIT.length);
  const size = SIZES[slot.size];

  return {
    gridColumn: `${slot.start} / span ${size.span}`,
    gridRow: String(unit * UNIT_BANDS + slot.band),
    aspectRatio: size.ratio,
  };
}
