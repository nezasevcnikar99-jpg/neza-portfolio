import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nezasevcnikar.eu";

// Read on each request, so a project added in the admin is listed at once.
export const dynamic = "force-dynamic";

/** Every page a search engine should know about, for Google Search Console. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const projects = await getAllProjects();
  const pages = ["", "/archive", "/about", "/kontakt"].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
    priority: path === "" ? 1 : 0.6,
  }));
  return [
    ...pages,
    ...projects.map((project) => ({
      url: `${SITE_URL}/projects/${project.slug}`,
      lastModified: new Date(project.updatedAt),
      priority: 0.8,
    })),
  ];
}
