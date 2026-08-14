import Link from "next/link";
import type { Media } from "@/payload-types";
import { getProjectRatio, type Project } from "@/lib/projects";

export default function WorkGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="work-grid">
      {projects.map((p, i) => {
        const heroDoc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
        const hero = heroDoc?.mimeType?.startsWith("image/") ? heroDoc : null;
        const quote = p.quote?.trim();

        return (
          <Link key={p.slug} href={`/projects/${p.slug}`} className="work-item">
            <div className="work-media" style={{ aspectRatio: getProjectRatio(p, i) }}>
              {hero?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.url}
                  alt={hero.alt}
                  className="work-image"
                  style={{ objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%` }}
                />
              ) : (
                <span className="work-placeholder">{p.imgLabel ?? "fotografija"}</span>
              )}

              {/* Only when there is something to say — an empty quote used to
                  render as the literal word "null" across the picture. */}
              {quote && (
                <span className="work-quote">
                  <span className="font-serif">{`"${quote}"`}</span>
                </span>
              )}
            </div>

            <span className="work-label">
              <span className="work-title">{p.title}</span>
              <span className="work-meta">
                {p.category}, {p.year}
              </span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
