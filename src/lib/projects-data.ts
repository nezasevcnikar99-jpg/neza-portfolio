import "server-only";
import type { Project } from "@/payload-types";
import { getPayloadClient } from "./payload";

export async function getAllProjects(): Promise<Project[]> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    sort: "order",
    limit: 0,
    depth: 1,
  });
  return result.docs;
}

export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "projects",
    where: { slug: { equals: slug } },
    depth: 2,
    limit: 1,
  });
  return result.docs[0] ?? null;
}

export async function getArchiveGroups() {
  const projects = await getAllProjects();
  const sorted = [...projects].sort((a, b) => b.year - a.year);
  let counter = 0;
  const numbered = sorted.map((p) => ({ ...p, num: String(++counter).padStart(2, "0") }));
  const years = [...new Set(numbered.map((p) => p.year))];
  return years.map((year) => ({ year, items: numbered.filter((p) => p.year === year) }));
}

export async function getNextProject(slug: string): Promise<Project | null> {
  const projects = await getAllProjects();
  const idx = projects.findIndex((p) => p.slug === slug);
  if (idx === -1) return null;
  return projects[(idx + 1) % projects.length];
}
