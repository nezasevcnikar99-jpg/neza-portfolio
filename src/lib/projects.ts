import type { Project } from "@/payload-types";

export type { Project };

export const COLUMNS = 4;

/**
 * The index is a ruled grid of square cells, four across, drawn including the
 * empty ones — a caption pinned to the corner of a ruled cell names that cell,
 * where the same caption in open white would only float.
 *
 * Pictures follow a fixed figure of four bands holding six pictures, taken from
 * the reference. It reads as composed rather than packed because the empty
 * cells are part of the figure, not what is left over.
 *
 * A caption goes in whichever cell is nearest its own picture, which is often
 * the cell above or below rather than one in the same band, and hangs from the
 * edge facing it: alongside a picture it sits at the top, above one it sits at
 * the bottom. Captions in the last column are set to the right so they hold the
 * outer margin.
 */
type Slot = { band: number; col: number; span: number };

/**
 * Six pictures across four bands, the figure the reference repeats. The empty
 * cells are part of it rather than what is left over, which is what makes it
 * read as composed instead of packed.
 */
const CYCLE: Slot[] = [
  { band: 0, col: 2, span: 2 },
  { band: 1, col: 1, span: 2 },
  { band: 1, col: 4, span: 1 },
  { band: 2, col: 2, span: 1 },
  { band: 3, col: 1, span: 1 },
  { band: 3, col: 3, span: 2 },
];

const CYCLE_BANDS = 4;

export type Corner = "tl" | "tr" | "bl" | "br";

export type Cell =
  | { kind: "image"; project: Project; index: number; span: number }
  | { kind: "label"; project: Project; index: number; align: Corner }
  | { kind: "empty" };

type Placed = { index: number; project: Project; band: number; col: number; span: number };

const centreOf = (p: Placed) => ({ x: p.col + p.span / 2, y: p.band + 0.5 });

/**
 * Captions are not assigned by hand — each picture takes the free cell nearest
 * to it, and only one whose own nearest picture is that same picture. That is
 * what stops a caption sitting closer to a neighbour's photograph than to the
 * one it names, which hand placement kept doing.
 */
function assignLabels(images: Placed[], lastBand: number) {
  const taken = new Set<string>();
  images.forEach((im) => {
    for (let c = im.col; c < im.col + im.span; c++) taken.add(`${im.band}:${c}`);
  });

  const free: { band: number; col: number }[] = [];
  for (let band = 0; band <= lastBand; band++) {
    for (let col = 1; col <= COLUMNS; col++) {
      if (!taken.has(`${band}:${col}`)) free.push({ band, col });
    }
  }

  const cornerFor = (cell: { band: number; col: number }, im: Placed): Corner =>
    `${im.band > cell.band ? "b" : "t"}${cell.col === COLUMNS ? "r" : "l"}` as Corner;

  // Where the caption actually sits, not the middle of its cell. Measuring from
  // the cell centre put four captions nearer a neighbour's photograph.
  const anchorOf = (cell: { band: number; col: number }, corner: Corner) => ({
    x: cell.col + (corner[1] === "r" ? 0.85 : 0.15),
    y: cell.band + (corner[0] === "b" ? 0.85 : 0.15),
  });

  const distance = (a: { x: number; y: number }, im: Placed) => {
    const c = centreOf(im);
    return Math.hypot(c.x - a.x, c.y - a.y);
  };

  const used = new Set<string>();
  const labels = new Map<string, { project: Project; index: number; align: Corner }>();

  for (const im of images) {
    const candidates = free
      .filter((cell) => !used.has(`${cell.band}:${cell.col}`))
      .map((cell) => {
        const corner = cornerFor(cell, im);
        const anchor = anchorOf(cell, corner);
        const own = distance(anchor, im);
        // Nothing else may be closer to where the caption will actually sit.
        const closest = images.reduce((m, other) => Math.min(m, distance(anchor, other)), Infinity);
        return { cell, corner, d: own, ownsIt: own <= closest + 1e-9 };
      })
      .sort((a, b) => a.d - b.d);

    const pick = candidates.find((x) => x.ownsIt) ?? candidates[0];
    if (!pick) continue;

    used.add(`${pick.cell.band}:${pick.cell.col}`);
    labels.set(`${pick.cell.band}:${pick.cell.col}`, {
      project: im.project,
      index: im.index,
      align: pick.corner,
    });
  }

  // Greedy placement can strand a late picture with a cell an earlier one had
  // already taken. One pass of swaps settles those without disturbing the rest.
  const entries = [...labels.entries()];
  const owns = (cellKey: string, im: Placed) => {
    const [band, col] = cellKey.split(":").map(Number);
    const cell = { band, col };
    const corner = cornerFor(cell, im);
    const anchor = anchorOf(cell, corner);
    const own = distance(anchor, im);
    return own <= images.reduce((m, o) => Math.min(m, distance(anchor, o)), Infinity) + 1e-9;
  };
  const imageOf = (index: number) => images.find((im) => im.index === index)!;

  for (let pass = 0; pass < 2; pass++) {
    for (let a = 0; a < entries.length; a++) {
      for (let b = a + 1; b < entries.length; b++) {
        const [keyA, valA] = entries[a];
        const [keyB, valB] = entries[b];
        const imA = imageOf(valA.index);
        const imB = imageOf(valB.index);
        const before = Number(owns(keyA, imA)) + Number(owns(keyB, imB));
        const after = Number(owns(keyB, imA)) + Number(owns(keyA, imB));
        if (after > before) {
          entries[a] = [keyB, valA];
          entries[b] = [keyA, valB];
        }
      }
    }
  }

  return new Map(
    entries.map(([key, value]) => {
      const [band, col] = key.split(":").map(Number);
      return [key, { ...value, align: cornerFor({ band, col }, imageOf(value.index)) }];
    })
  );
}

/**
 * Lays the figure out band by band and returns the cells in reading order,
 * empties included, so the grid can draw every rule.
 */
export function buildIndexCells(projects: Project[]): Cell[] {
  // The figure stays fixed and the projects are dealt into it for the sake of
  // the composition, not their order: each slot takes the first project whose
  // shape suits it. A chosen size decides that shape; on "auto" the hero picture
  // does — a landscape picture wants the wide slot, anything squarer the square
  // one. Order only breaks ties. If no project suits a slot, an "auto" project
  // takes it anyway; a project with a chosen size never goes in the wrong shape.
  const shapeOf = (project: Project): number | null => {
    if (project.gridSize === "1x1") return 1;
    if (project.gridSize === "2x1") return 2;
    const hero = typeof project.heroImage === "object" ? project.heroImage : null;
    const ratio = hero?.width && hero?.height ? hero.width / hero.height : null;
    return ratio === null ? null : ratio >= 1.25 ? 2 : 1;
  };
  const chosen = (project: Project) => project.gridSize === "1x1" || project.gridSize === "2x1";

  const images: Placed[] = [];
  const pending = [...projects];
  for (let i = 0; pending.length > 0; i++) {
    const slot = CYCLE[i % CYCLE.length];
    let at = pending.findIndex((project) => shapeOf(project) === slot.span);
    if (at === -1) at = pending.findIndex((project) => !chosen(project));
    if (at === -1) continue;

    const [project] = pending.splice(at, 1);
    const cycle = Math.floor(i / CYCLE.length);
    // Numbered in the order pictures appear, which is also the order the phone
    // stacks them in, so each caption still follows its own picture there.
    images.push({
      index: images.length,
      project,
      band: cycle * CYCLE_BANDS + slot.band,
      col: slot.col,
      span: slot.span,
    });
  }

  const lastBand = images.reduce((m, im) => Math.max(m, im.band), 0) + 1;
  const labels = assignLabels(images, lastBand);

  const byCell = new Map<string, Cell>();
  images.forEach((im) =>
    byCell.set(`${im.band}:${im.col}`, {
      kind: "image",
      project: im.project,
      index: im.index,
      span: im.span,
    })
  );
  labels.forEach((l, key) => byCell.set(key, { kind: "label", ...l }));

  const cells: Cell[] = [];
  for (let band = 0; band <= lastBand; band++) {
    let col = 1;
    while (col <= COLUMNS) {
      const cell = byCell.get(`${band}:${col}`);
      if (cell?.kind === "image") {
        cells.push(cell);
        col += cell.span;
      } else if (cell?.kind === "label") {
        cells.push(cell);
        col += 1;
      } else {
        cells.push({ kind: "empty" });
        col += 1;
      }
    }
  }

  return cells;
}
