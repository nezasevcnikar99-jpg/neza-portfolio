import type { Project } from "@/payload-types";

export type { Project };

/**
 * Home composition: a 12-column grid with even gutters.
 *
 * Four picture sizes, and every image starts on one of four column lines
 * (1, 4, 7, 10). Repeating so few sizes and so few left edges is what makes the
 * grid legible — the eye picks up the alignment down the page.
 *
 * Sizes are chosen per project in the CMS, so the layout cannot be hand-placed;
 * it is packed instead. Pictures fill a band left to right, always landing on an
 * anchor and always leaving at least one empty column between them. Whatever
 * does not fit starts the next band, which is why no choice of sizes can make
 * two pictures collide. Everything in a band hangs from the same top line.
 */
export type SizeKey = "landscape" | "square" | "wide" | "portrait";

const SIZES: Record<SizeKey, { span: number; ratio: string }> = {
  landscape: { span: 4, ratio: "4 / 3" },
  square: { span: 3, ratio: "1 / 1" },
  wide: { span: 5, ratio: "16 / 10" },
  portrait: { span: 3, ratio: "3 / 4" },
};

/**
 * Maps the stored field value onto a size. The keys are legacy names kept to
 * avoid a Postgres enum migration — see the field definition in Projects.ts.
 */
const SIZE_BY_FIELD: Record<string, SizeKey> = {
  "2x2": "landscape",
  "1x1": "square",
  "2x1": "wide",
  "1x2": "portrait",
};

/** Shape order used for projects left on "auto". */
const AUTO_CYCLE: SizeKey[] = [
  "landscape",
  "square",
  "wide",
  "portrait",
  "landscape",
  "square",
  "portrait",
  "wide",
];

const ANCHORS = [1, 4, 7, 10];
const COLUMNS = 12;

/** Every third band holds a single picture, to keep the page breathing. */
const isSingleBand = (band: number) => band % 3 === 2;

/** Where a band starts looking for space, so bands do not all hug the left. */
const bandStart = (band: number) =>
  isSingleBand(band) ? [7, 1, 4][Math.floor(band / 3) % 3] : band % 2 === 0 ? 1 : 4;

const fits = (anchor: number, span: number) => anchor + span - 1 <= COLUMNS;

function resolveSize(project: Project, index: number): SizeKey {
  const chosen = project.gridSize;
  if (chosen && chosen !== "auto" && SIZE_BY_FIELD[chosen]) return SIZE_BY_FIELD[chosen];
  return AUTO_CYCLE[index % AUTO_CYCLE.length];
}

export function buildScatterLayout(projects: Project[]) {
  let band = 0;
  let placedInBand = 0;
  let cursor = bandStart(0);

  return projects.map((project, index) => {
    const { span, ratio } = SIZES[resolveSize(project, index)];

    let start = ANCHORS.find((a) => a >= cursor && fits(a, span));
    const capacity = isSingleBand(band) ? 1 : 2;

    if (start === undefined || placedInBand >= capacity) {
      band += 1;
      placedInBand = 0;
      cursor = bandStart(band);
      start = ANCHORS.find((a) => a >= cursor && fits(a, span)) ?? ANCHORS.find((a) => fits(a, span)) ?? 1;
    }

    placedInBand += 1;
    cursor = start + span + 1;

    return {
      gridColumn: `${start} / span ${span}`,
      gridRow: String(band + 1),
      aspectRatio: ratio,
    };
  });
}
