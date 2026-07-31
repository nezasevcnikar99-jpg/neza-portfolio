import Link from "next/link";
import type { Media } from "@/payload-types";
import { getScatterSlot, type Project } from "@/lib/projects";

export default function ProjectScatter({ projects }: { projects: Project[] }) {
  return (
    <div className="scatter-grid">
      {projects.map((p, i) => {
        const slot = getScatterSlot(i);
        const heroDoc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
        const hero = heroDoc?.mimeType?.startsWith("image/") ? heroDoc : null;

        return (
          <div
            key={p.slug}
            className="scatter-item"
            style={{ gridColumn: slot.gridColumn, gridRow: slot.gridRow }}
          >
            <Link
              href={`/projects/${p.slug}`}
              className="scatter-media project-cell"
              style={{ aspectRatio: slot.aspectRatio }}
            >
              {hero?.url ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={hero.url}
                  alt={hero.alt}
                  style={{
                    position: "absolute",
                    inset: 0,
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    objectPosition: `${hero.focalX ?? 50}% ${hero.focalY ?? 50}%`,
                  }}
                />
              ) : (
                <span className="scatter-placeholder">{p.imgLabel ?? "fotografija"}</span>
              )}

              <div className="project-cell-overlay">
                <div
                  className="font-serif"
                  style={{ fontStyle: "italic", fontSize: 16, lineHeight: 1.4, color: "#fff", textAlign: "center" }}
                >
                  {`"${p.quote}"`}
                </div>
              </div>
            </Link>

            <div className="scatter-label font-sans">
              <div className="scatter-label-title">{p.title}</div>
              <div className="scatter-label-meta">
                {p.category}, {p.year}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
