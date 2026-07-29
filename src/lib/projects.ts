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
