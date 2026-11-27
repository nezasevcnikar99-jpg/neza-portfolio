import type { MetadataRoute } from "next";
import { getAllProjects } from "@/lib/projects-data";
import { getSettings } from "@/lib/settings";
import { href } from "@/lib/i18n";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.nezasevcnikar.eu";

// Read on each request, so a project added in the admin is listed at once.
export const dynamic = "force-dynamic";

/** Every page a search engine should know about, for Google Search Console. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A hidden site lists nothing, so it is not offered to Google afresh.
  const settings = await getSettings().catch(() => null);
  if (settings?.searchVisible === false) return [];
  const projects = await getAllProjects();
  // Each page in both languages, each entry naming its twin, which is how
  // Google pairs the Slovene and English versions.
  const entry = (path: string, lastModified: Date, priority: number) =>
    (["sl", "en"] as const).map((lang) => ({
      url: `${SITE_URL}${href(lang, path === "" ? "/" : path).replace(/^\/$/, "")}`,
      lastModified,
      priority,
      alternates: {
        languages: {
          sl: `${SITE_URL}${path}`,
          en: `${SITE_URL}${href("en", path === "" ? "/" : path)}`,
        },
      },
    }));
  return [
    ...["", "/archive", "/about", "/kontakt"].flatMap((path) => entry(path, new Date(), path === "" ? 1 : 0.6)),
    ...projects.flatMap((project) => entry(`/projects/${project.slug}`, new Date(project.updatedAt), 0.8)),
  ];
}
