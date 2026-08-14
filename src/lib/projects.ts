import type { Project } from "@/payload-types";

export type { Project };

/**
 * The home index is a plain column grid: every picture is one column wide and
 * starts on the same vertical line as the one above it, and its label sits
 * directly underneath. Nothing is packed or placed by hand.
 *
 * What a project chooses is its proportion, not its size. Keeping the width
 * fixed is what makes the columns read; letting the height vary is what keeps
 * the page from looking like a contact sheet.
 */
export type SizeKey = "landscape" | "square" | "portrait";

const RATIOS: Record<SizeKey, string> = {
  landscape: "3 / 2",
  square: "1 / 1",
  portrait: "4 / 5",
};

/**
 * Maps the stored field value onto a proportion. The keys are legacy names kept
 * to avoid a Postgres enum migration — see the field definition in Projects.ts.
 */
const SIZE_BY_FIELD: Record<string, SizeKey> = {
  "2x1": "landscape",
  "1x1": "square",
  "2x2": "portrait",
  "1x2": "portrait",
};

/**
 * Proportion order used for projects left on "auto".
 *
 * Seven entries, which shares no factor with three or two columns. A cycle
 * whose length divides the column count locks each column to one proportion —
 * at six entries and three columns the right-hand column came out portrait
 * every single time.
 */
const AUTO_CYCLE: SizeKey[] = [
  "square",
  "landscape",
  "portrait",
  "square",
  "landscape",
  "square",
  "portrait",
];

export function getProjectRatio(project: Project, index: number): string {
  const chosen = project.gridSize;
  const key =
    chosen && chosen !== "auto" && SIZE_BY_FIELD[chosen]
      ? SIZE_BY_FIELD[chosen]
      : AUTO_CYCLE[index % AUTO_CYCLE.length];
  return RATIOS[key];
}
