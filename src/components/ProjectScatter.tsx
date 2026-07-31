import Link from "next/link";
import type { Media } from "@/payload-types";
import { buildScatterLayout, type Project } from "@/lib/projects";

export default function ProjectScatter({ projects }: { projects: Project[] }) {
  const layout = buildScatterLayout(projects);

  return (
    <div className="scatter-wrap">
      <div className="scatter-grid">
        {projects.map((p, i) => {
          const slot = layout[i];
          const heroDoc = typeof p.heroImage === "object" ? (p.heroImage as Media | null) : null;
          const hero = heroDoc?.mimeType?.startsWith("image/") ? heroDoc : null;

          return (
            <div
              key={p.slug}
              className={`scatter-item label-${slot.labelSide} ${slot.labelTop ? "label-top" : "label-bottom"}`}
              style={{ gridColumn: slot.gridColumn, gridRow: slot.gridRow }}
            >
              <Link href={`/projects/${p.slug}`} className="scatter-media project-cell">
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
                    style={{ fontStyle: "italic", fontSize: 15, lineHeight: 1.4, color: "#fff", textAlign: "center" }}
                  >
                    {`"${p.quote}"`}
                  </div>
                </div>
              </Link>

              <div className="scatter-label font-sans">
                <span className="scatter-label-title">{p.title}</span>
                <span className="scatter-label-meta">
                  {p.category}, {p.year}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
