import type { Project } from "@/payload-types";

export type { Project };

/**
 * The home page composition is a 12-column grid in which most cells stay empty.
 * Each project gets a slot: where it starts, how wide it is, its aspect ratio and
 * a vertical offset that breaks the rows up so nothing reads as a tidy table.
 *
 * The pattern repeats every 8 projects. Consecutive slots whose column ranges do
 * not overlap end up sharing a row (grid auto-flow), which is what produces the
 * scattered left/right rhythm — some rows hold two images, some only one.
 */
type Slot = {
  start: number;
  span: number;
  ratio: string;
  offset: number;
  labelAlign: "top" | "bottom";
};

const SCATTER: Slot[] = [
  { start: 1, span: 5, ratio: "4 / 3", offset: 0, labelAlign: "top" },
  { start: 8, span: 5, ratio: "3 / 4", offset: 150, labelAlign: "bottom" },
  { start: 3, span: 4, ratio: "1 / 1", offset: 0, labelAlign: "top" },
  { start: 8, span: 4, ratio: "4 / 5", offset: 110, labelAlign: "top" },
  { start: 1, span: 7, ratio: "16 / 10", offset: 0, labelAlign: "bottom" },
  { start: 6, span: 6, ratio: "3 / 2", offset: 130, labelAlign: "top" },
  { start: 2, span: 4, ratio: "3 / 4", offset: 0, labelAlign: "top" },
  { start: 7, span: 5, ratio: "4 / 3", offset: 90, labelAlign: "bottom" },
];

/** The per-project size chosen in the CMS overrides the slot's width and ratio. */
const SIZE_OVERRIDE: Record<string, { span: number; ratio: string }> = {
  "2x2": { span: 6, ratio: "1 / 1" },
  "2x1": { span: 7, ratio: "16 / 10" },
  "1x2": { span: 4, ratio: "3 / 4" },
  "1x1": { span: 3, ratio: "1 / 1" },
};

export function getScatterSlot(project: Project, index: number) {
  const base = SCATTER[index % SCATTER.length];
  const override =
    project.gridSize && project.gridSize !== "auto" ? SIZE_OVERRIDE[project.gridSize] : undefined;

  const span = override?.span ?? base.span;
  const ratio = override?.ratio ?? base.ratio;
  const start = Math.max(1, Math.min(base.start, 13 - span));
  const end = start + span - 1;

  // Put the label wherever there is actually empty grid left over.
  const labelSide: "left" | "right" = end <= 8 || start < 4 ? "right" : "left";

  return { start, span, ratio, offset: base.offset, labelAlign: base.labelAlign, labelSide };
}
