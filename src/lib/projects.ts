import type { Project } from "@/payload-types";

export type { Project };

export const CATEGORIES = ["Vse", "Arhitektura", "Literarni esej", "Grafika"] as const;

export const GRID_SIZES = [
  { col: 2, row: 2 },
  { col: 1, row: 1 },
  { col: 1, row: 1 },
  { col: 1, row: 2 },
  { col: 2, row: 1 },
  { col: 1, row: 1 },
];

export function filterByCategory(projects: Project[], category: (typeof CATEGORIES)[number]) {
  return category === "Vse" ? projects : projects.filter((p) => p.category === category);
}

const GRID_SIZE_MAP: Record<string, { col: number; row: number }> = {
  "2x2": { col: 2, row: 2 },
  "2x1": { col: 2, row: 1 },
  "1x2": { col: 1, row: 2 },
  "1x1": { col: 1, row: 1 },
};

export function getGridSize(project: Project, index: number) {
  if (project.gridSize && project.gridSize !== "auto" && GRID_SIZE_MAP[project.gridSize]) {
    return GRID_SIZE_MAP[project.gridSize];
  }
  return GRID_SIZES[index % GRID_SIZES.length];
}
