import type { Project } from "@/payload-types";

export type { Project };

/**
 * Home composition: a 12-column grid with tight gutters.
 *
 * Four picture footprints, and every picture starts on one of four column lines
 * (1, 4, 7, 10). Repeating so few sizes and so few left edges is what makes the
 * grid legible.
 *
 * Pictures are packed two to a band. Labels are placed in the band's leftover
 * columns and pinned to its top or bottom corner, alternating, so they read as
 * part of the grid rather than as captions. Because a label shares the band
 * with its picture instead of sitting under it, labels add no height.
 */
export type SizeKey = "wide" | "landscape" | "square" | "portrait";

const SIZES: Record<SizeKey, { span: number; ratio: string }> = {
  wide: { span: 4, ratio: "16 / 10" },
  landscape: { span: 3, ratio: "4 / 3" },
  square: { span: 2, ratio: "1 / 1" },
  portrait: { span: 2, ratio: "3 / 4" },
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
  "portrait",
  "wide",
  "square",
  "portrait",
  "landscape",
  "square",
  "wide",
];

const ANCHORS = [1, 4, 7, 10];
const COLUMNS = 12;
const PER_BAND = 2;

const fits = (anchor: number, span: number) => anchor + span - 1 <= COLUMNS;

/** Bands alternate where they begin so the page does not all hug the left. */
const bandStart = (band: number) => (band % 2 === 0 ? 1 : 4);

function resolveSize(project: Project, index: number): SizeKey {
  const chosen = project.gridSize;
  if (chosen && chosen !== "auto" && SIZE_BY_FIELD[chosen]) return SIZE_BY_FIELD[chosen];
  return AUTO_CYCLE[index % AUTO_CYCLE.length];
}

type Placed = { index: number; start: number; span: number; ratio: string };

function freeRanges(items: Placed[]): [number, number][] {
  const taken = new Array(COLUMNS + 2).fill(false);
  for (const it of items) {
    for (let c = it.start; c < it.start + it.span; c++) taken[c] = true;
  }

  const ranges: [number, number][] = [];
  let open: number | null = null;
  for (let c = 1; c <= COLUMNS; c++) {
    if (!taken[c]) {
      if (open === null) open = c;
    } else if (open !== null) {
      ranges.push([open, c - 1]);
      open = null;
    }
  }
  if (open !== null) ranges.push([open, COLUMNS]);
  return ranges;
}

export type Slot = {
  image: { gridColumn: string; gridRow: string; aspectRatio: string };
  label: { gridColumn: string; gridRow: string; alignSelf: "start" | "end"; textAlign: "left" | "right" };
};

export function buildScatterLayout(projects: Project[]): Slot[] {
  const bands: Placed[][] = [];
  let band: Placed[] = [];
  let cursor = bandStart(0);

  projects.forEach((project, index) => {
    const { span, ratio } = SIZES[resolveSize(project, index)];
    let start = ANCHORS.find((a) => a >= cursor && fits(a, span));

    if (start === undefined || band.length >= PER_BAND) {
      if (band.length) bands.push(band);
      band = [];
      cursor = bandStart(bands.length);
      start = ANCHORS.find((a) => a >= cursor && fits(a, span)) ?? ANCHORS.find((a) => fits(a, span)) ?? 1;
    }

    band.push({ index, start, span, ratio });
    cursor = start + span + 1;
  });
  if (band.length) bands.push(band);

  const slots: Slot[] = [];

  bands.forEach((items, bandIndex) => {
    const ranges = freeRanges(items);
    const used = new Set<number>();
    const row = String(bandIndex + 1);

    items.forEach((item, positionInBand) => {
      const end = item.start + item.span - 1;

      let pick = -1;
      let bestScore = Infinity;
      ranges.forEach(([from, to], rangeIndex) => {
        const distance = from > end ? from - end : item.start - to;
        // Prefer an unused range, but fall back to sharing one. A single column
        // is too narrow to set a title in, so treat it as a last resort.
        const shared = used.has(rangeIndex) ? COLUMNS : 0;
        const narrow = to - from + 1 < 2 ? COLUMNS * 2 : 0;
        const score = distance + shared + narrow;
        if (score < bestScore) {
          bestScore = score;
          pick = rangeIndex;
        }
      });

      const range = pick >= 0 ? ranges[pick] : ([item.start, end] as [number, number]);
      if (pick >= 0) used.add(pick);

      // Two labels can end up in the same gap, so the first hangs from the top
      // of the band and the second from the bottom. Bands flip the order.
      const topFirst = bandIndex % 2 === 0;
      const alignSelf: "start" | "end" =
        (positionInBand === 0) === topFirst ? "start" : "end";

      slots[item.index] = {
        image: {
          gridColumn: `${item.start} / span ${item.span}`,
          gridRow: row,
          aspectRatio: item.ratio,
        },
        label: {
          gridColumn: `${range[0]} / span ${range[1] - range[0] + 1}`,
          gridRow: row,
          alignSelf,
          textAlign: range[1] === COLUMNS ? "right" : "left",
        },
      };
    });
  });

  return slots;
}
